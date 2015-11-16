/**
 * Created by root on 9/7/15.
 */

var q,
    _,
    js_fsm,
    esb_messenger,
    lib,
    Node = null;

var dbgPrint = function(){
    var debug_level = 1;
    var level = arguments[0];
    if((_.isNumber(level) && level < debug_level) || (_.isString(level) && _.contains([/*"ESB","FSM","NGM"*/],level)))
        console.log.apply(this, _.flatten(["WFM: ",_.takeRight(arguments,arguments.length-1)]));
};
var errPrint = function(){
    console.log.apply(this, _.flatten(["WFM: Error -", arguments]));
}

exports.init = function(m){
    q = m.pl.dep.nmm.q();
    _ = m.pl.dep.nmm.lodash();
    js_fsm = m.pl.dep.nmm.js_fsm();
    lib = m.pl.dep.clm;
    esb_messenger = m.pl.mc;
    Node = require('./node.js').init(m);

    return NodeGraph;
};

var NodeGraph = function(workflow, init, namespace, input, output){
    try {
        var self = this;
        this.workflow = workflow;
        this.evt_queue = [];
        this.history = [];
        this.nodes = {};
        this.edges = init.edges;
        this.marked = init.marked;
        _.forIn(init.nodes, function (node, key) {
            self.nodes[key] = new Node(_.extend(node,{nid:key}), input);
        });
    }catch(e){
        errPrint("Error building nodegraph:",e);
    }
};
NodeGraph.prototype.serialize = function(){
    return {
        namespace : this.namespace,
        marked : this.marked,
        edges : this.edges,
        nid : this.namespace,
        isSubflow : this.isSubflow,
        nodes : _.transform(this.nodes,function(agg, val, key){
            agg[key] = val.serialize();
        },{})
    };
};
NodeGraph.prototype.getActive = function() {
    var self = this;
    return self.marked;//_.map(this.marked, function(ele){return self.nodes[self.marked]});
};
NodeGraph.prototype.getNext = function(target){
    var successors = this.getSuccessors(target);
    return successors && successors.length > 0 ? _.pluck(successors,'dst') : undefined;
};
NodeGraph.prototype.activateNext = function(target){
    var current = this.nodes[target];
    if (!current)
    {
        return false;
    }
    else //activate next
    {
        var successors = this.getSuccessors(target);
        var kickoutResponse = false;
        //End of workflow
        if (successors.length == 0)
            return false; //nothing to activate - complain to parent
        if(_.find(successors,"respond",true)) kickoutResponse = true;

        //Branch
        if(successors.length > 1)
        {
            var target_nid =  current.output ? _.find(successors,"if",current.output.result) : undefined;
            if(target_nid)//branch conditional
            {
                this.marked = _.without(this.marked,target);
                this.marked.push(target_nid.dst);
                return {kickoutResponse : kickoutResponse, next : target_nid.dst};
            }
            else//parallel conditional
            {
                this.marked = _.without(this.marked,target);
                this.marked = _.union(successors,this.marked);
                return {kickoutResponse : kickoutResponse};
            }
            if(!target_nid) throw "BAD CONDITIONAL: NO VALID SUCCESSOR SPECIFIED";
        }
        //Single Successor
        else {
            this.marked = _.without(this.marked,target);
            this.marked.push(successors[0].dst);
            return {kickoutResponse : kickoutResponse};
        }
    }
};
NodeGraph.prototype.getSuccessors = function(target){
    return this.edges[target];
};
NodeGraph.prototype.getAntecessors = function(target){
    return _.keys(_.omit(this.edges,function(source){
        return _.findIndex(source,"dst",target) < 0;
    }));
}
NodeGraph.prototype.allAntecessorsFinished = function(target){
    var antecessors = this.getAntecessors(target),
        self = this;
    return _.every(antecessors,function(antecessor){
        return self.nodes[antecessor].isFinished;
    })
}
NodeGraph.prototype.hasAsAncestor = function(node,target){
    var antecessors = this.getAntecessors(node),
        self = this;
    if(node == target) return true;
    if(antecessors.length == 0) return false;
    return _.any(antecessors, function(antecessor){
        return self.hasAsAncestor(antecessor, target);
    });
}

NodeGraph.prototype.receiveEvent = function(node, evt){
    var deferred = q.defer(),
        self = this;
    if(_.isArray(node)) node = _.compact(node);
    this.evt_queue.push({promise:deferred, event: evt});
    this.history.push(evt);
    if(!this.evt_queue.lock)
    {
        try {
            if(_.isArray(node) && node.length > 1)
            {
                q.all( _.map(node,function(n,i){
                    var myEvt = _.clone(evt);
                    myEvt.intermediates = [];
                    return self.processEvent(n,myEvt, q.defer());
                })).then(function(results){
                    deferred.resolve();
                }  ,  function failure(e){
                    deferred.reject();
                })
            }
            else
            {
                if(_.isArray(node)) node = node[0];
                this.processEvent(node, evt, deferred).then(function(){
                    deferred.resolve();
                }  ,  function failure(e){
                    deferred.reject();
                })
            }
        }catch(e){
            errPrint("ERR at receive event", e);
        }
    }
    return deferred.promise;
};
NodeGraph.prototype.fetchInfo = function(path,security){
    var m = {
        op : "ams_read_entity",
        pl : {}
    }
    m.pl[path[2]] = {
        eid : path[3]
    }
    m.sc = security;
    return esb_messenger(m)
}
NodeGraph.prototype.processEvent = function(node, evt, promise) {
    var self = this,
        activeNode = this.nodes[node];

    dbgPrint('NGM',"Workflow processing event '"+evt.wf.ev+"' on nid = "+activeNode.nid+"("+JSON.stringify(this.nodes[node]));

    var wrapperPromise;

    if(evt.wf.ev == "begin" && activeNode.fsm.current == "START")
    {
        var inbound_edge_spec = _.find(this.edges[node],function(edge){return edge.src !== undefined})
        if(inbound_edge_spec)
        {
            //This node has specified inbound-node behaviour.
            var shallContinue = _.every(inbound_edge_spec.src, function(spec){
                var satisfied = true;
                if(spec.any)
                {
                    satisfied = _.any(spec.any, function(antecessor){
                        return self.nodes[antecessor.src].isFinished
                    })
                }
                if(spec.must)
                {
                    satisfied = _.every(spec.must, function(antecessor){
                        return self.nodes[antecessor.src].isFinished
                    })
                }
                return satisfied
            })
            if(shallContinue) wrapperPromise = activeNode.start(evt.pl,this.workflow,evt.ac);
            else return q({foo:"Deferred until all custom required antecessors completed"});
        }
        else if(this.allAntecessorsFinished(node))//By default, only continue if predecessors done
        {
            dbgPrint('FSM',"All antecessors finished");
            wrapperPromise = activeNode.start(evt.pl,this.workflow,evt.ac);
        }
        else
        {
            dbgPrint('FSM',"************************DEFERRING");
            return q({foo:"Deferred until all antecessors completed"});

        }
    } else wrapperPromise = q();
    return wrapperPromise.then(function(){
        //Prepare active node to receive the event: it needs to fulfill a promise
        var deferred = q.defer(),
            fsmPromise = deferred.promise;
        activeNode.fsm.onafterevent = function (event, from, to) {
            deferred.resolve({event: event, from: from, to: to, msg: this.msg});
            this.msg = undefined;
        };
        activeNode.fsm.error = function(evt, from, to, args, ec, em){
            errPrint("FSM error....",evt,from,to,args,ec,em);
            deferred.reject("INVALID EVENT "+evt+" SENT TO STATE "+from);
        };

        //Issue the event
        dbgPrint('FSM',"...Commands requested...");
        activeNode.fsm[evt.wf.ev]();

        //Wait for commands from the FSM
        return fsmPromise.then(function onPercolated(transition){

            dbgPrint('FSM',"...Commands received -->",transition.to);

            //Make execution promise
            var execPromise = q();
            var command = {};
            if(transition && transition.msg)
            {
                var t_msg = transition.msg;
                command = {
                    settled: t_msg.isSettled,
                    q_op: t_msg.q_op || "all",
                    event: transition.event,
                    next: t_msg.next,
                    ops: _.map(t_msg.ops, function (op) {
                        op.pl = activeNode.input;
                        return _.defaults(op,{vr : "1.0.0", ac:evt.ac, sm:{}});
                    })
                };
                execPromise = q[command.q_op](_.map(command.ops, function(op){
                    try {
                        var paths = _.filter(_.keys(op.pl),function(path){return path.indexOf(".")>0});
                        var non_paths = _.filter(_.keys(op.pl),function(path){return path.indexOf(".")<0});
                        var new_pl = {};
                        _.forEach(non_paths,function(non_path){
                            new_pl[non_path] = op.pl[non_path];
                        })
                        _.forEach(paths,function(path){
                            _.set(new_pl,path,op.pl[path])
                        });
                        op.ac = op.ac || {}
                        op.pl = new_pl;
                        //Why is transaction id put into the payload
                        //op.pl.transaction_id = op.transactionid = self.workflow.code+"/"+node;
                        op.transaction_id = self.workflow.code+"/"+node;
                        dbgPrint('ESB',"INPUT TO ESB FUNCTION IS:\n",op,"\n<---end input")
                        return esb_messenger(op);
                    } catch (e) {
                        errPrint("Error in ESB messenger: ", e,op);
                    }
                }));
            }
            dbgPrint('FSM',"...Commands executing...");

            var esbtime = new Date().getTime();
            return execPromise.then(function onCommandsDone(results){

                dbgPrint('ESB',"...Commands completed! ("+(new Date().getTime()-esbtime)+"ms)");

                var furtherEvent = command && !command.settled ? {cmd: command, result: results} : undefined;
                if(transition.to == "END")
                {
                    //End this node
                    var output = _.compact(evt.intermediates).pop(),
                        nextNode = self.getNext(node);
                    activeNode.finish(output?output.pl:undefined,self);
                    dbgPrint('FSM',"End of node next is",nextNode);
                    //Start next node
                    if(nextNode && nextNode.length > 0)
                    {
                        var activation_info = self.activateNext(node);
                        if(activation_info.kickoutResponse) {
                            evt.master_promise.resolve({pl:output.pl})
                        }

                        var intermediates = _.flatten([evt.intermediates,results]),
                            generatedEvent = _.extend(evt, {
                                wf: {
                                    ev: "begin"
                                },
                                intermediates : intermediates
                            });
                        dbgPrint('FSM',"sending nextNode",nextNode,activation_info);
                        return self.receiveEvent(activation_info && activation_info.next?activation_info.next:nextNode, generatedEvent).then(function (result) {
                            var result = _.compact(_.flatten([results,result])).pop();
                            promise.resolve(result);
                        },function failure(e){
                            if(nextNode.length > 1) dbgPrint(9,"Resolving multiple failed");
                        });
                    }
                    else
                    {
                        var result = activeNode.output;
                        //result = activeNode.output;
                        dbgPrint('FSM',"End of workflow",result);
                        promise.resolve(result);
                    }
                }
                else if(!furtherEvent)
                {
                    dbgPrint('FSM',"No further automatic events");
                    var result = _.compact(_.flatten(results)).pop();
                    promise.resolve(result);
                }
                else
                {
                    dbgPrint('FSM',"...Generating further automatic events ↓,results:",results);
                    return q().then(function(){
                        var opsFailed = !_.every(results,function(r){return !r.er || r != {} }) && results.length > 0,
                            intermediates = furtherEvent && furtherEvent.result.length > 0 ? furtherEvent.result:evt.intermediates,
                            lastInterObj = _.compact(intermediates).pop(),
                            responsePayload = lastInterObj && _.isObject(lastInterObj) ? lastInterObj.pl : undefined,
                            generatedEvent = _.extend(evt, {
                                wf: {
                                    ev: opsFailed ? "fail" : (furtherEvent.cmd.next ? furtherEvent.cmd.next : "done")
                                },
                                intermediates: intermediates
                            });
                        dbgPrint("sending self event",generatedEvent);
                        return self.receiveEvent(node, generatedEvent);
                    }).then(function(toReturn){
                        var result = _.compact(_.flatten([results,toReturn?toReturn:undefined])).pop();
                        promise.resolve(result);
                    },function failure(e){
                        errPrint("ACK!",e,activeNode);
                        promise.reject(e);
                    });
                }
            })
        } , function failure (e){
            errPrint("Error while processing event... ",e);
            promise.reject(e);
        });
    })
};
NodeGraph.prototype.rollback = function(targetNode, currentNode, rolledback_set){
    var active = currentNode?currentNode:this.getActive(),
        self = this;

    if(!_.isArray(active)) active = [active];
    if(!_.isArray(rolledback_set)) rolledback_set = [];

    var promises = [];

    for(var i = 0; i < active.length; i ++)
    {
        var node = active[i];
        if(_.contains(rolledback_set,node)) continue;

        rolledback_set.push(node);
        promises.push(self.rollbackNode(node).then(function(){
            //For each antecessor that descends from the target node, roll it back
            var priors = self.getAntecessors(node);
            priors = _.filter(priors,function(ele){return self.hasAsAncestor(ele,targetNode)})
            var subpromises = [];
            _.each(priors,function(ele){subpromises.push(self.rollback(targetNode,ele,rolledback_set));});
            return q.all(subpromises);
        }));
    }
    return q.all(promises);

}
NodeGraph.prototype.rollbackNode = function(targetNode){
    var node = this.nodes[targetNode],
        self = this,
        deferred = q.defer(),
        fsmPromise = deferred.promise;
    if(!_.isFunction(node.fsm.rollback) || node.fsm.current == "START"){return q();}
    node.fsm.onafterevent = function (event, from, to) {
        deferred.resolve({event: event, from: from, to: to, msg: this.msg});
        this.msg = undefined;
    };
    node.fsm.error = function(evt, from, to, args, ec, em){
        errPrint("FSM error....",evt,from,to,args,ec,em);
        deferred.reject("INVALID EVENT "+evt+" SENT TO STATE "+from);
    }

    try {
        node.fsm["rollback"]();
    }catch(e){
        errPrint("UMM",e);
    }
    return fsmPromise.then(function onrollback(transition){
        //form an anti-call for the transition's function
        if(transition.msg && transition.msg.ops && transition.msg.ops.length > 0)
        {
            var my_tid = self.workflow.code+"/"+targetNode;
            var my_pl = {
                dns : transition.msg.ops[0].dns,
                sns : "wms",
                op : "wms_rollback",
                pl : {
                    transaction_id : my_tid
                },
                transactionid : my_tid
            }
            return esb_messenger(my_pl)
        }
    }).then(function(){
        //Decide to recurse
        if(node.fsm.current != 'START')
        {
            return self.rollbackNode(targetNode);
        }
        else{
            self.nodes[targetNode].isFinished = false;
            console.log("...Node rollback Done",targetNode);
            return q();
        }
    }, function failure(err){
        console.log("Node graph bailing on rollback:",err);
        throw err;
    });
}