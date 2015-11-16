/**
 * Created by root on 8/12/15.
 */

//TODO: support multiple simultaneously-active nodes

var q,
    _,
    js_fsm,
    esb_messenger,
    lib,
    NodeGraph = null;

exports.init = function(m){
    q = m.pl.dep.nmm.q();
    _ = m.pl.dep.nmm.lodash();
    js_fsm = m.pl.dep.nmm.js_fsm();
    lib = m.pl.dep.clm;
    esb_messenger = m.pl.mc;
    NodeGraph = require('./nodegraph.js').init(m);

    return Workflow;
};

var Workflow = function(json){
    this.evt_queue = [];
    this.evt_queue.lock = false;
    this.history = json.history || [];
    this.acceptingEvents = false;
    this.code = json.code;
    this.name = json.name;
    this.graph = new NodeGraph(this, json);
    this.start();
};
Workflow.prototype.serialize = function(){
    var s_graph = this.graph.serialize();
    var result = {
        nodes : s_graph.nodes,
        edges : s_graph.edges,
        marked : s_graph.marked,
        history : this.history,
        name : this.name,
        code : this.code
    };
    return result;
};
Workflow.prototype.stop = function(){
    this.acceptingEvents = false;
};
Workflow.prototype.start = function(){
    this.acceptingEvents = true;
};
Workflow.prototype.restart = function(){
    this.acceptingEvents = true;
    //todo: set current state back to beginning
};
Workflow.prototype.rollback = function(target_nid){
    var self = this;
    console.log("Delegating rollback to graph");
    return self.graph.rollback(target_nid).then(function(){
        console.log("Rollback done");
    } , function failure(err){
        console.log("Workflow rollback failed",err);
        throw err;
    });
};
Workflow.prototype.receiveEvent = function(evt){
    if(!this.acceptingEvents) return q({er:"Workflow is not accepting events at the moment. Please try again later"});

    var deferred = q.defer();
    this.evt_queue.push({promise:deferred, event: evt});
    this.history.push(evt);
    if(!this.evt_queue.lock)
    {
        this.processEvent();
    }
    return deferred.promise;
};
Workflow.prototype.processEvent = function(){
    var activeNodes = this.graph.getActive(),
        queueee = this.evt_queue.shift(),
        evt = queueee.event,
        promise = queueee.promise,
        self = this;

    if(_.isString(activeNodes)) activeNodes = [activeNodes]
    evt.master_promise = promise;
    return q.all(_.map(activeNodes,function(node){
        var p = q.defer();

        return self.graph.receiveEvent(node, evt);
    })).then(function success(e){
        console.log("WFM: Resolving toplevel event");
        promise.resolve(e);
    }).then(null,  function failure(e){
        console.log("WFM: Rejecting toplevel event",e);
        promise.reject(e);
    })
};

exports.Workflow = Workflow;