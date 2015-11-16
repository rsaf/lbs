/**
 * Created by root on 9/7/15.
 */
var q,
    _,
    js_fsm,
    lib,
    esb_messenger = null;

var dbgPrint = function(){
    var debug_level = 10;
    var level = arguments[0];
    if(level < debug_level)
        console.log.apply(this, _.flatten(["WFM: ",_.takeRight(arguments,arguments.length-1)]));
};
var errPrint = function(){
    console.log.apply(this, _.flatten(["WFM: Error -", arguments]));
}
var fixKeys = function(dict){
    var keys = _.sortBy(_.keys(dict),function(str){return _.filter(str,function(val){return val == "["}).length});
    return _.reduce(keys, function(agg,val,key){
        var fixKey = val.replace(/\[/g,'.').replace(/\]/g,'');
        agg[fixKey] = dict[val];
        return agg;
    },{})
}
var unfixKeys = function(dict){
    var keys = _.keys(dict);
    return _.reduce(keys, function(agg,val){
        var unfixKey = _.reduce(val.split('.'),function(agg, word,idx){
            if(idx == 0) agg += word;
            else agg += "[" + word + "]"
            return agg;
        },"")
        agg[unfixKey] = dict[val];
        return agg;
    },{})
}

exports.init = function(m){
    q = m.pl.dep.nmm.q();
    _ = m.pl.dep.nmm.lodash();
    js_fsm = m.pl.dep.nmm.js_fsm();
    lib = m.pl.dep.clm;
    esb_messenger = m.pl.mc;

    return Node;
};
var Node = function(node, alternatePayloadDictionary){
    this.spec = node;
    this.code = node.code;
    this.name = node.name;
    this.nid = node.nid;
    this.input = fixKeys(node.input);
    this.alternatePayloadDictionary = alternatePayloadDictionary;
    this.output = node.output;
    var fsmparams = {
        events: node.transitions,
        initial: node.initial,
        error: function (evt, from, to, args, ec, em) {
            errPrint("FSM failed... ", evt, from, to, args, ec, em);
            throw ec || em;
        },
        callbacks: //Translate the json of the spec into FSM callbacks
            _.transform(node.callbacks, function (result, val, key) {
                result[key] = function (event, from, to) {
                    var msg = val;
                    if (!val || !_.isPlainObject(val))
                        msg = {};
                    else
                        msg = _.defaults(msg, {
                            //instanceParams : val,
                            nodeID: node.code,
                            isSettled: true,
                            next: undefined
                        });
                    this.msg = msg;
                };
            })
    };
    this.fsm = js_fsm.create(fsmparams);
};
Node.prototype.finish = function(payload,workflow){
    var self = this;
    this.isFinished = true;
    var unsatisfied = _.difference(_.keys(this.output), _.keys(payload));
    this.output = _.extend(this.output,_.pick(payload, _.keys(this.output)));
    _.forEach(unsatisfied,function(key){
        function foo() {
            var path = self.output[key].split(".");
            if (path.length >= 2 && (path[1] == "input" || path[1] == "output" || path[0] == "pl" || path[0] == "app")) {
                    //We will assume this is a path of shape "nodeidx.<output/input>.path.foo.to.key.bar
                    var idx = path[0],
                        loc = path[1],
                        path = _.takeRight(path, path.length - 2);
                    var toreify = _.get(workflow.nodes[idx][loc], path);
                return toreify;
            }
            return path;
        };
        self.output[key] = foo();
    })
};
Node.prototype.start = function(payload,workflow,security){
    var self = this;
    return q().then(function(){
        return q(self.reifyInputLinks(payload,workflow,security));
    }).then(function (result){
        self.input = result;
    })
};
Node.prototype.serialize = function(){
    var cleanCallbacks = {};
    _.forOwn(this.spec.callbacks,
        function(callback,key){
            cleanCallbacks[key] = _.omit(callback,'ops');
        }
    );
    return {
        isFinished : this.isFinished,
        input : unfixKeys(this.input),
        output : unfixKeys(this.output),
        nid : this.nid,
        code : this.code,
        name : this.name,
        callbacks : cleanCallbacks,
        transitions : this.spec.transitions,
        initial : this.fsm.current
    }
}
Node.prototype.reifyInputLinks = function(payload, workflow, security){
    var self = this;
    //Handle dictionary swap for subflows
    _.each(this.alternatePayloadDictionary, function(val,key){
        dbgPrint(2,"WFM: Changing",key,"from",self.input[key],"to",val)
        self.input[key] = val;
    });
    var database_lookups = {};
    //Reify
    var result = _.mapValues(this.input,function(value, key){
        if(!_.isString(value)) return value;
        var path = value.split(".");
        if(path.length >= 2 && (path[1] == "input" || path[1] == "output" || path[0] == "pl" || path[0] == "app"))
        {
            if(path[0] == "pl")//we pull from the payload. Path is "pl.path.foo.to.key.bar"
            {
                var path = _.takeRight(path,path.length-1);
                return _.get(payload, path);
            }
            else if(path[0] == "app")//database lookup
            {
                database_lookups[key] = path;
                return undefined;
            }
            else
            {
                //We will assume this is a path of shape "nodeidx.<output/input>.path.foo.to.key.bar
                var idx = path[0],
                    loc = path[1],
                    path = _.takeRight(path, path.length - 2);
                return _.get(workflow.graph.nodes[idx][loc],path);
            }
        }
        return value;
    });
    var db_keys = _.keys(database_lookups);
    if(db_keys.length > 0)
    {
        var db_promises = _.map(db_keys,function(key){
            //DB paths are of form ['app',<type>,'row',....]
            return workflow.graph.fetchInfo(database_lookups[key],security);
        })
        return q.all(db_promises).then(function(results){
            for(var i = 0; i < db_keys.length; i ++)
            {
                result[db_keys[i]] = results[i].pl
            }
            //todo insert db results into input
            return result;
        })
    }
    var unreified =  _.filter(_.keys(result),function(key){return result[key] === undefined});
    if(unreified.length > 0)
    {
        errPrint("Warning - After reifying, the following were unable to be reified: ",unreified);

        dbgPrint(1,"My input dictionary is:\n",this.input);

        dbgPrint(1,"My payload is:\n",payload);

        dbgPrint(1,"my workflow is:\n",workflow.graph.nodes);
    }
    return q(result);
};