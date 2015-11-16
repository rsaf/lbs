//Dependencies
var q,
    mongoose,
    esb_messenger,
    uuid,
    _,
    lib,
    workflow = null;

var WorkflowSchema,
    WorkflowModel,
    FSMSchema,
    FSMModel,
    NodeSchema,
    NodeModel,
    TransactionSchema,
    TransactionModel,
    DebugPrintSchema,
    DebugPrintModel,
    CounterSchema,
    CounterModel,

    CompositeNodeTemplateSchema,
    CompositeNodeTemplateModel,
    NodeTemplateSchema,
    NodeTemplateModel,
    WorkflowTemplateSchema,
    WorkflowTemplateModel = null;

var wms_liveWorkflows = {},
    wms_cachedTemplates = {};

//Exposed API
exports.operations = [
    init,
    wms_process,
    wms_rollback,
    wms_rollback_workflow,
    wms_upload_workflow_design,
    wms_publish_workflow_design,
    wms_open_template,
    wms_open_workflow,

    wms_init_workflow,
    wms_process_event,
    wms_release_workflow,
    wms_persist_workflow,
    wms_conditional_eval,
    wms_substitute_and_evaluate,
    wms_gate_on_expression,
    wms_debug_print
];
exports.operations.forEach(function(op) {
    // re-export ops (for testing)
    exports[op.name] = op;
});

function init(m){
    esb_messenger = m.pl.mc;
    workflow = require('./helpers/workflow.js').init(m);
    q = m.pl.dep.nmm.q();
    lib = m.pl.dep.clm;
    uuid = m.pl.dep.nmm.node_uuid();
    _ = m.pl.dep.nmm.lodash();

    var p0 = m.pl.dep.sfm.get_mongoose({"sns": "wms"});

    return q.all([p0]).then(function(r) {
        mongoose = r[0].pl.so;

        WorkflowSchema = require("./models/Workflow.js")(mongoose);
        WorkflowModel = mongoose.model('Workflow', WorkflowSchema);
        FSMSchema = require("./models/FSM.js")(mongoose);
        FSMModel = mongoose.model("FSM",FSMSchema);
        NodeSchema = require("./models/Node.js")(mongoose);
        NodeModel = mongoose.model("Node",NodeSchema);
        TransactionSchema = require("./models/Transaction.js")(mongoose);
        TransactionModel = mongoose.model('Transaction', TransactionSchema);
        DebugPrintSchema = require("./models/DebugPrint.js")(mongoose);
        DebugPrintModel = mongoose.model('DebugPrint', DebugPrintSchema);
        CounterSchema = require("./models/Counters.js")(mongoose);
        CounterModel = mongoose.model('Counter', CounterSchema);

        NodeTemplateSchema = require("./models/NodeTemplate.js")(mongoose);
        NodeTemplateModel = mongoose.model('NodeTemplate', NodeTemplateSchema);
        CompositeNodeTemplateSchema = require("./models/CompositeNodeTemplate.js")(mongoose);
        CompositeNodeTemplateModel = mongoose.model('CompositeNodeTemplate', CompositeNodeTemplateSchema);
        WorkflowTemplateSchema = require("./models/WorkflowTemplate.js")(mongoose);
        WorkflowTemplateModel = mongoose.model('WorkflowTemplate', WorkflowTemplateSchema);
        return q.all([
            load_defaults_into_mongo(WorkflowTemplateModel, require("./data/default_workflows.json")),
            load_defaults_into_mongo(NodeModel, require("./data/default_nodes.json")),
            load_defaults_into_mongo(FSMModel, require("./data/default_fsm.json")),
            load_defaults_into_mongo(CounterModel, require("./data/default_counters.json"))
        ]);

    }).then(function(){
        return {pl: {"ss":"wms initiation done!"}, er: null};
    }, function failure(err){
        console.log("Failed to initialize WMS:",err);
        return {pl: null, er: {ec: 1001, em: err }};
    });
}
function load_defaults_into_mongo(model,json){
    var promises = _.map(_.keys(json), function(key){
        var deferred = q.defer();
        model.findOne({code:json[key].code}, function(err,res){
            if(err) deferred.reject(err);
            else if(!res){
                var ele = new model(json[key]);
                return (ele).save(function(err){
                    if(err) deferred.reject(err);
                    else deferred.resolve(res);
                });
            }
            else deferred.resolve();
        });
        return deferred.promise;
    });
    return q.all(promises).then(function(){
    }, function failure(err){
        console.log("Loading defaults failed! Reason:",err);
    })
}

//
//  Workflow Life Cycle
//

function wms_process(m){
    var opPromise = q();
    console.log("WMS: wms_process receving message %s \n\n", JSON.stringify(m));
    if(m.op) opPromise = esb_messenger(m);
    var my_wid;
    return opPromise.then(function(q){
        if(m.wf)
        return wms_init_workflow({wid: m.wf.wid,wtk: m.wf.wtk})
            .then(function process(r){
                m = _.set(m,'wf.wid', r.pl.wid);
                my_wid = r.pl.wid
                return wms_process_event(m)
            })
            .then(function close(result){
                console.log("WMS: CLosing workflow", m.wf);
                wms_release_workflow({wid: m.wf.wid});
                m.pl.target_node = "A";
                m.wid = my_wid;
                return result;
            }).then(null  ,  function error(e){
                console.log("ERR ----",e);
                return {er : "Unable to process event: Server problem"}
            })
        else
            return q;
    });
}
function wms_rollback_workflow(m){
    var tgtWorkflow = wms_init_workflow(m);
    return wms_liveWorkflows[tgtWorkflow.pl.wid].rollback(m.pl.target_node);
}

function wms_rollback(m){
    return lib.rollback(mongoose, TransactionModel, m)
}

function wms_init_workflow(m) {
    if(!m.wid) //no wid - making new workflow
    {
        console.log("WFM: Instantiating new workflow", m.wtk);
        return instantiate_workflow(m.wtk, m.wid);
    }
    else //wid - reinstate workflow
    {
        console.log("WFM: Getting old workflow", m.wid);
        return reinstate_workflow(m.wid, m.wtk);
    }
}
function instantiate_workflow(paramTemplateID, paramWorkflowID){
    var workflowTemplateID = paramTemplateID;
    var wid = paramWorkflowID || uuid.v4();
    return wms_get_template(workflowTemplateID).then(function(template) {
        if (!template) return {"pl": null, "er": "Template not found"};
        var init = _.extend(template,{code: wid});
        var flow = new workflow(init);
        wms_liveWorkflows[wid] = flow;
        return q(true);//wms_persist_workflow({pl:wms_liveWorkflows[wid]});
    }).then(function(){
        return {"pl":{wid: wid},"er":null};
    }, function error(err){
        return {"pl":null, "er": "WFM: Error creating new workflow:"+JSON.stringify(err)};
    });
}
function reinstate_workflow(paramWorkflowID, paramWorkflowTemplate){
    var wid = paramWorkflowID;
    if(wms_liveWorkflows[wid])
    {
        console.log("WFM: Workflow already instantiated", wid);
        //workflow in memory!

        return {"pl":{wid: wid}, "er":null};
    }
    else
    {
        console.log("WFM: Instantiating old workflow", wid);
        return wms_get_workflow(wid).then(function(workflowSpec){
            if(!workflowSpec && paramWorkflowTemplate)
            {
                console.log("Isn't actually 'old'. Creating new workflow with wid",paramWorkflowID);
                //Workflow doesn't exist: create one with the queried id
                return instantiate_workflow(paramWorkflowTemplate, paramWorkflowID)
            }

            wms_liveWorkflows[wid] = new workflow(workflowSpec);
            return {"pl":{wid: wid}, "er":null};
        }, function error(err){
            return {"pl":null, "er": "WFM: Error creating old workflow:"+JSON.stringify(err)};
        });
    }
}
function wms_persist_workflow(m) {
    var json = m.pl;
    var deferred = q.defer();
    WorkflowModel.findOne({code: json.code}).exec().then(function(res){
        if(!res){
            (new WorkflowModel(json)).save(function (err) {
                if (!err) {
                    deferred.resolve();
                }
                else {
                    console.log("WFM: error in saving workflow", err);
                    deferred.reject(err);
                }
            });
        }
        else {
            WorkflowModel.update({code: json.code},json,function(err,res){
                if(!err){
                    deferred.resolve();
                }
                else {
                    console.log("WFM: error in updating workflow",err);
                    deferred.reject(err);
                }
            });
        }
    } , function failure(err){
        deferred.reject(err);
    });
    return deferred.promise;
}
function wms_release_workflow(m) {
    var wid = m.wid;

    wms_liveWorkflows[wid] = undefined;

    return q(wid);
}
function wms_process_event(m){
    var start = new Date().getTime(),
        wid = m.wf.wid,
        op = m.op,
        evtResponse = null;
    if(!wms_liveWorkflows[wid]) return {"er":"Workflow '"+wid+"' does not exist!"};

    return wms_liveWorkflows[wid].receiveEvent(m).then(function persistSelf(response){
            evtResponse = response;
            return esb_messenger({
                "sns" : "wms",
                "dns" : "wms",
                "op" : "wms_persist_workflow",
                "pl" : wms_liveWorkflows[wid].serialize()
            });

        }).then(function(response){
            var pack = evtResponse;
            console.log("WFM: Successful workflow interaction (" + (new Date().getTime() - start) + "ms) Response:",JSON.stringify(pack));
            return pack;
        }).then(null , function failure(e){
            console.log("WMS: Error in workflow ", e);
            return {
                pl : null,
                er : e
            }
        });
}

//

//  Template Retrieval

//
function validate_template(data){
    var starts = _.filter(_.keys(data.nodes),function(node_key){
        return data.nodes[node_key].code == "CBN000009";
    });
    var ends = _.filter(_.keys(data.nodes), function(node_key){
        return data.nodes[node_key].code == "CBN000010";
    });

    if(starts.length > 1) return {err:"Rejected: Multiple start nodes."};
    if(starts.length == 0) return {err:"Rejected: No 'start' node"};
    if(ends.length > 1) return {err:"Rejected: Multiple end nodes."};
    if(ends.length ==0) return {err:"Rejected: No 'end' node"};
    if(!data.marked) return {err:"Rejected: No initial node specified"};

    var connected = [];
    var afterlife_found = false;
    recursive_list(starts[0]);

    function recursive_list(nid){
        try{

        var successors = data.edges[nid];
        _.each(successors, function(ele){
            recursive_list(ele.dst);
        });
        if(successors && successors.length > 0 && data.nodes[nid] && data.nodes[nid].code == "CBN000010")
        {
            afterlife_found = true;
        }
        else
        {
        }
        }catch(e){
            console.log("ERROR doing afterlife check:",e);
        }
    }
    if(!_.every(_.keys(data.nodes),function(node_key){return _.contains(connected,node_key)})) return {err:"Rejected: Graph is disconnected"};
    if(afterlife_found) return {err:"Rejected: Nodes found continuing after END node's completion"}
    return {valid: true}
}
function wms_publish_workflow_design(m){
    var deferred = q.defer();
    WorkflowTemplateModel.findOne({code:m.pl.code}).exec().then(function(template){
        var validation_result = template?validate_template(template):{err:"Template not found"};
        if(template && !validation_result.err)
        {
            console.log("FOUND VALID TEMPLATE TO PUBLISH");
            template.published = true;
            template.save(function(err, res){
                if(err) deferred.reject({pl:null, er:err})
                else deferred.resolve({pl:res, er:null})
            })
        }
        else
        {
            deferred.reject({pl:null, er:"Invalid template design. Validation error:"+validation_result.err});
        }
    });
    return deferred.promise;
}
function wms_upload_workflow_design(m){
    var deferred = q.defer();
    m.pl.code = m.pl.code || "CBWD"+uuid.v4();

    WorkflowTemplateModel.findOne({code: m.pl.code}).exec().then(function(template){
        if(template)
        {
            //already exists, update
            template.marked = m.pl.marked || template.marked;
            template.nodes = m.pl.nodes || template.nodes;
            template.edges = m.pl.edges || template.edges;
            template.save(function(err,res){
                console.log("Overriding:",err,res);
                if(err) {
                    deferred.reject(err)
                }
                else
                    deferred.resolve(m.pl.code);
            });
        }
        else{
            (new WorkflowTemplateModel(m.pl)).save(function(err,res){
                console.log("Saving:",err,res);
                if(err)
                    deferred.reject(err)
                else
                    deferred.resolve(m.pl.code);
            });
        }
    })
    return deferred.promise;
}
function wms_open_template(m){
    if(!m.pl.code)//new template being requested
    {
        return CounterModel.findOne({type:"templateSeq"}).exec().then(function(res){
            if(res)
            {
                res.counter += 1;
                var deferred = q.defer();
                res.save(function(err){
                    var new_code = res.prefix+res.counter
                    if(err)
                    {
                        deferred.reject({pl:null, er:"Bad Attempt to save incremented template id"});
                    }
                    else
                    {
                        wms_upload_workflow_design({
                            pl:{
                                code : new_code,
                                marked : "A",
                                edges : {
                                },
                                nodes : {
                                    "A" : {
                                        name : "START",
                                        code : "CBN000009",
                                        link: "cbos_components/canvas/workflow/resources/images/flowChartIcons_10.png",
                                        x : 50,
                                        y : 200
                                    }
                                }
                            }
                        }).then(function(){
                            deferred.resolve({pl: null, er: null, code : res.prefix+res.counter});
                        }, function failure(){
                            deferred.reject({pl:null, er:"Unable to initialize new template"});
                        })
                    }
                });
                return deferred.promise;
            }
            else{
                console.log("Bad SEQUENCE");
                return {pl: null, er:"Bad Attempt to get next unusedtemplate id"};
            }
        })
    }
    return wms_get_template(m.pl.code).then(function(r){
        return {pl: r, er: null}
    },function failure(err){
        if(err == "Template Not Found ("+ m.pl.code+")")
        {
            return {pl:null, er:null};
        }
        console.log("ERROR GETTING TEMPLATE",err);
        return {pl: null, er:err};
    })
}
function wms_open_workflow(m){
    return wms_get_workflow(m.pl.code).then(function(r){
        return {pl: r}
    })
}
function wms_get_workflow(workflowID){
    return WorkflowModel.findOne({code:workflowID}).exec().then(function(res){
        if(res)
            return res;
        else return null;
    } , function failure(e){
        return e;
    });
}
function wms_get_template(templateID){
    if(!templateID) return null;
    var workflowSpec = null;
    return WorkflowTemplateModel.findOne({code:templateID}).lean().exec().then(function(workflowTemplate){
        if(!workflowTemplate) throw "Template Not Found ("+templateID+")";
        workflowSpec = workflowTemplate;
        var promises = _.map(_.keys(workflowTemplate.nodes),function(idx){
            var node_spec = workflowTemplate.nodes[idx],
                node,
                fsm;
            return NodeModel.findOne({code: node_spec.code}).lean().exec()
                .then(function(node_template){
                    if(!node_template) throw("Node not found for",node_spec.code,node_spec);
                    node = node_template;
                    return FSMModel.findOne({code: node_template.fsm}).lean().exec();
                })
                .then(function(fsm_template){
                    _.forEach(_.keys(fsm_template.callbacks), function(key){
                        var path = fsm_template.callbacks[key].ops;
                        if(_.startsWith(path,"params."))
                            fsm_template.callbacks[key].ops = _.get(node, path);
                    });
                    fsm = fsm_template;
                })
                .then(function assemble(){
                    return _.omit(_.extend(node, _.omit(fsm,"code","name"), _.omit(node_spec,"code")),["fsm","params","node"]);
                });
        });
        return q.all(promises);
    }).then(function success(res){
        var origKeys = _.keys(workflowSpec.nodes);
        for(var i = 0; i < res.length; i ++)
        {
            workflowSpec.nodes[origKeys[i]] = res[i];
        }
        return workflowSpec;
    } , function failure(e){
        console.log("ERROR RETRIEVING TEMPLATE:",e);
        throw e;
    });
}

//

//  Special Node Execution Support

//
function wms_gate_on_expression(m){
    return wms_substitute_and_evaluate(m).then(function(result){
        if(result.pl.result == false)
        {
            return {pl: null, er:"Failed Gating Expression"}
        }
        else return {pl:result.pl.result,er:result.er}
    });
}
function wms_substitute_and_evaluate(m){
    var allowed_operators = ["+","-","*","/",">","<",">=","<=","==","&&","||","(",")","%","true","false"];
    var result = eval(_.reduce(_.map(_.words(m.pl.expression, /[^, ]+/g),function(token){
        if(_.contains(allowed_operators,token)) return token;
        var variable = _.get(m.pl,token);
        var token_as_num = parseFloat(token);
        if(variable === undefined  && !_.isNumber(token_as_num))
        {
            throw "BAD SUBSTITUTION IN CALCULATION: token "+token+" not found in payload "+JSON.stringify(m.pl);
        }
        else if(variable === undefined && _.isNumber(token_as_num)){
            return parseFloat(token)
        }
        else return variable;
    }),function(agg,val){
        return agg +" "+ val;
    },""));

    console.log("WMS: Evaluation of user expression (", m.pl.expression,") yielded '",result,"'");
    return q(result).then(function(result){
        return {pl:{result:result},er:null};
    }, function failure(e){
        return {pl:null,er:e};
    })

}
function wms_conditional_eval(m){
    return wms_substitute_and_evaluate(m).then(function(result){
        return {pl:{result:result.pl.result}}
    });
}
function wms_debug_print(m){
    var toSave;
    return lib.getCreate(mongoose, TransactionModel, "DebugPrint",{"toprint": m.pl.toprint}, m.transactionid,{},true).then(function(r) {
        r = _.extend(r,m.pl)
        return lib.saveToPromise(r);
    }).then(function(p){
        toSave = p;
        return lib.commit(TransactionModel, m);
    }).then(function(){
        console.log("Debug print called:", toSave);
        return q({pl:toSave})
    }  ,  function failure(err){
        console.log("Getcreate failed:",err)
        throw err
    })
}
