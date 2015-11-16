/**
 * Created by leo on 8/2/15.
 */

var q,
    _ = null;

exports.init = function (m){
    var nmm = m.pl.dep.nmm;
    q = nmm.q();
    _ = nmm.lodash();
    return this;
}


exports.audit_control_schema = function()
{
    return {
        c: { //creator
            uid: {type:String},//id of the user who created this record
            oid: {type:String},//organisation id
            cd:  {type: Date}//creation date
        },
        m: {//modified
            uid: {type:String},//id of user who changed the service
            oid: {type:String},//organisation id
            md: {type:Date}//last updated date
        }
    }
}

exports.access_control_schema = function(permissionDefaults)
{
    if(permissionDefaults === undefined) permissionDefaults = {};
    return {

        own : {
            uid: {select: false, type:String},
            p: {default: permissionDefaults.own !== undefined ? permissionDefaults.own : "rwd" ,select: false,type:String}
        },
        grp : {
            uid: {select: false, type:String},
            p: {default: permissionDefaults.grp !== undefined ? permissionDefaults.grp : "rwd" ,select: false,type:String}
        },
        all:{
            p: {default: permissionDefaults.all !== undefined ? permissionDefaults.all : "rwd" ,select: false,type:String}
        }
    }
};


exports.common_schema = function (json) {
    if (json === undefined) json = {sc: {}};
    return {
        ac: { //audit control
            c: { //creator
                uid: {type: String},//id of the user who created this record
                oid: {type: String},//organisation id
                cd: {type: Date}//creation date
            },
            m: {//modified
                uid: {type: String},//id of user who changed the service
                oid: {type: String},//organisation id
                md: {type: Date}//last updated date
            }
        },
        sc: {  //security control
            own: {
                uid: {select: false, type: String},
                p: {default: json.sc.own !== undefined ? json.sc.own : "rwd", select: false, type: String}
            },
            grp: {
                uid: {select: false, type: String},
                p: {default: json.sc.grp !== undefined ? json.sc.grp : "rwd", select: false, type: String}
            },
            all: {
                p: {default: json.sc.all !== undefined ? json.sc.all : "rwd", select: false, type: String}
            }
        },
        oc: {   //ownership control
            o: {//modified
                uid: {type: String},//id of user who owns the records
                oid: {type: String},//organisation id
                od: {type: Date}// ownership start date
            }
        }
    }

}


exports.set_entity_values = function (){
    return function (entityModelData){
        var me = this;
        for (var field  in entityModelData) {
            //console.log("CLM: field %s", field);
            me.set(field, entityModelData[field]);
            //if(me.schema.path(field)){
            //    //console.log("CLM: field name %s" ,field);
            //    //console.log("CLM: field data %s" , entityModelData[field]);
            //    me.set(field, entityModelData[field])
            //}
        };
        me.eid = me._id;
        //console.log(me);
    }
};

exports.update_entity_values = function (){
    return function (entityModelData){
        var me = this;
        for (var field  in entityModelData) {
            if(me.schema.path(field)){
                var dt = me.schema.path(field).instance;
                if(dt != "Array"){
                    me.set(field, entityModelData[field]);
                }
                else{
                    console.log("SCHEMA TYPE INSTANCE --- --- %s",  JSON.stringify(me.schema.path(field).instance));
                    //me.set(field, entityModelData[field]);
                    me.path(field).set(0, entityModelData[field]);
                }
                //console.log("SCHEMA --- --- %s",  JSON.stringify(me.schema.paths[field]));
                //console.log("SCHEMA FIELD --- --- %s",  field);
                //console.log("SCHEMA TYPE --- --- %s",  JSON.stringify(me.schema.path(field)));
                //console.log("SCHEMA TYPE INSTANCE --- --- %s",  JSON.stringify(me.schema.path(field).instance));
            }
        };
        me.eid = me._id;
    }
};

exports.set_entity_created = function (){
    return function (securityControl){
        var  me  = this;
        if(securityControl.uid && securityControl.oid){
            me.set('ac.c.uid', securityControl.uid);
            me.set('ac.c.oid', securityControl.oid);
            me.set('ac.c.cd',  new Date());

            me.set('ac.m.uid', securityControl.uid);
            me.set('ac.m.oid', securityControl.oid);
            me.set('ac.m.md',  new Date());

            me.set('oc.o.uid', securityControl.uid);
            me.set('oc.o.oid', securityControl.oid);
            me.set('oc.o.od',  new Date());


        }
    }
};

exports.set_entity_modified = function (){
    return function (securityControl){
        var me  = this;
        if(securityControl.uid && securityControl.oid){
            me.set('ac.m.uid', securityControl.uid);
            me.set('ac.m.oid', securityControl.oid);
            me.set('ac.m.md', new Date());
        }
    }

}

exports.set_entity_owner = function (){
    return function (securityControl){
        var me  = this;
        if(securityControl.uid && securityControl.oid){
            me.set('oc.o.uid', securityControl.uid);
            me.set('oc.o.oid', securityControl.oid);
            me.set('oc.o.od', new Date());
        }
    }

}


//Imported lanzheng rollback stuff
exports.saveToPromise = function(document){
    return q()
        .then(function(){
            var d = q.defer();
            document.save(function(paramError,paramData){
                if(paramError){
                    console.log("Unsaved document:\n",document);
                    d.reject(paramError);return;
                }
                d.resolve(paramData);
            });
            return d.promise;
        })
        .then(null,function reject(err){
            return q.reject('In saveToPromise:'+err+' ');
        });
}
exports.getCreate = function(mongoose, Transaction, collectionName,entity,transactionid,query,okCreate,credential){
    var ret=false;
    var me = this;
    return q()
        .then(function(){

            if(isValidObjectId(entity._id)&&!query){
                ret = mongoose.models[collectionName].findOne({_id:entity._id}).exec();
            }else if(query){
                ret = mongoose.models[collectionName].findOne(query).exec();
            }else{
                var result = new mongoose.models[collectionName]();
                if(result.s && credential)
                {
                    result.s.own.uid = credential.user;
                    result.s.grp.uid = credential.organization;
                }
                ret = q(result);
            }
            return ret;
        })
        .then(function(result){
            var transParams={};
            var preparefn='';
            if(!result){
                if(query&&okCreate){
                    result = new mongoose.models[collectionName]();
                    if(result.s && credential)
                    {
                        result.s.own.uid = credential.user;
                        result.s.grp.uid = credential.organization;
                    }
                }else{
                    return q.reject('cannot find the entity in '+collectionName);
                }
            }
            ret = result;
            if(transactionid){
                transParams={
                    transactionid:transactionid
                    ,entity:result
                    ,collectionName:collectionName
                };
                preparefn=result.isNew?prepareCreate:prepareUpdate;
                return preparefn(mongoose, Transaction, transParams);
            }
            else console.log("Skipping transaction");
            return true;
        })
        .then(
        function resolve(){
            return q.resolve(ret);
        },function reject(err){
            return q.reject("In lib transactonHelper getCreate; "  + err);
        }
    );


}
exports.commit = function(Transaction, m){
    return q()
        .then(function(){
            return _updateTransactions(Transaction, {
                doc:{ status: 'commited' }
                ,query:{"transactionid":m.transactionid}
            })//me.mongoose promises do not have .fail or .catch, return a q promise
                .then(function resolveCommit(ret) {
                    return q.resolve(ret);
                },function rejectCommit(err) {
                    return q.reject(err);
                });
        });
}
exports.rollback = function rollback(mongoose, transaction_model, m){
    var Transaction = transaction_model;
    var transactionsByType;
    return q().then(function(){
        //make sure version is within one
        return Transaction.find({"transactionid": m.transactionid},function(){})
            .select({query:1,values:1,collectionName:1,entityid:1,operation:1,orgValue:1})
            .exec();
    }).then(function(transactions) {
        if (!validate_transaction_id(m.transactionid))
            return q.reject('In rollback: preparing to rollback but no valid transaction id was provided.');
        transactionsByType = _.defaults(_.groupBy(transactions, 'operation'), {
            update: [],
            delete: [],
            create: [],
            "multi-update": []
        });
        var promises = [];
        for(var i in transactions)
        {
            console.log("QUERY IS:",
                _.extend(transactions[i].query || {},{"version":{"$gt" : (transactions[i].orgValue?transactions[i].orgValue.version + 1:1)}})
            );
            promises.push(
                mongoose.models[transactions[i].collectionName].find(
                    _.extend(transactions[i].query || {},{"version":{"$gt" : (transactions[i].orgValue?transactions[i].orgValue.version + 1:1)}})
                ).exec()
            );
        }
        return q.all(promises);
    }).then(function(searchlight){
        if(_.compact(_.flatten(searchlight)).length > 0)
        {
            console.log("BAD ORGVALUE! Expecting this + 1",transactionsByType);
            console.log("GOT", _.compact(_.flatten(searchlight)));
            throw "In rollback: aborting. There have been changes to a transacted document that we are unaware of";
        }
        return _rollbackByquery(mongoose, {transactions: transactionsByType['multi-update']})
    }).then(function(){
        return _deleteOriginals(mongoose, {transactions: transactionsByType['create']})
    }).then(function(){
        return _restoreOriginals(mongoose, {transactions: _.union(transactionsByType['delete'],transactionsByType['update'])})
    }).then(function() {
        return _updateTransactions(Transaction, {
            doc: {status: 'rolledback'}
            , query: {"transactionid": m.transactionid.toString()}
        });
    }).then(function resolveRollback(res) {
        return q.resolve(res);
    },function rejectRollback(err) {
        return q.reject(err);
    });
}
function _rollbackByquery(mongoose, arg){
    var transactions=arg.transactions,i = transactions.length,promises=[];
    while((i-=1)>-1){
        promises.push(
            mongoose.models[transactions[i].collectionName].update(
                transactions[i].query
                ,{$set:JSON.parse(transactions[i].values)}
                ,{multi:true}).exec()
        );
    }
    return q.all(promises);
}
function _updateTransactions(Transaction, arg){

    return Transaction.update(arg.query,arg.doc,{multi:true})
        .exec(function(){});//add dummy function to force it to write as save
}
function _insertOriginals(mongoose, arg){
    var i=arg.transactions.length,promises=[];
    function addPromise(t){
        console.log("INSERTING ONE", t.collectionName,t.orgValue)
        t.orgValue.version--;//todo:This is a bit smelly. I'm autoincrementing pre('save') elsewhere, so I need to counter that here.
        return mongoose.models[t.collectionName].create(t.orgValue,function(e,d){
            console.log("---->",e,d);
        });
    }
    while((i-=1)>-1){
        promises.push(addPromise(arg.transactions[i]));
    }
    return q.all(promises)
        .then(function resolve(res){//this.mongoose promise has no .then or .catch, return a q promise
            return q.resolve(res);
        },function reject(err){
            return q.reject(err);
        });
}
function _deleteOriginals(mongoose, arg){
    console.log("Delete originals called with",arg);
    return q()
        .then(function(){
            var i=arg.transactions.length,cols={},promises=[],collectionName,
                prop=Object.hasOwnProperty;
            //group by collection name
            while((i-=1)>-1){
                cols[arg.transactions[i].collectionName]=cols[arg.transactions[i].collectionName]||[];
                cols[arg.transactions[i].collectionName].push(arg.transactions[i].entityid);
            }
            for(collectionName in cols){
                console.log("Considering deleting one");
                if(prop.call(cols,collectionName)){
                    console.log("DELETING ONE", collectionName, cols[collectionName]);
                    promises.push(
                        mongoose.models[collectionName].remove({_id:{"$in":cols[collectionName]}}).exec()
                    );
                }
            }
            return q.all(promises)
                .then(function resolve(res){//me.mongoose promise has no .then or .catch, return a q promise
                    return q.resolve(res);
                },function reject(err){
                    return q.reject(err);
                });
        });
}
function _restoreOriginals(mongoose, arg){
    var i=arg.transactions.length,promises=[];
    function deleteInsert(t){
        return _deleteOriginals(mongoose, {transactions:[t]})
            .then(function(){
                return _insertOriginals(mongoose, {transactions:[t]});
            });
    }
    while((i-=1)>-1){
        promises.push(deleteInsert(arg.transactions[i]));
    }
    return q.all(promises)
        .then(function resolve(res){//me.mongoose promise has no .then or .catch, return a q promise
            return q.resolve(res);
        },function reject(err){
            return q.reject(err);
        });
}
function validate_transaction_id(id){
    return true;
}
function isValidObjectId(id){
    if(id&&id.toString){
        id=id.toString();
    }
    /*jshint ignore:start*/
    if(id == null) return false;
    if(id != null && 'number' != typeof id && (id.length != 12 && id.length != 24)) {
        return false;
    } else {
        // Check specifically for hex correctness
        if(typeof id == 'string' && id.length == 24){
            return /^[0-9a-fA-F]{24}$/.test(id);
        }
        return false;
    }
    /*jshint ignore:end*/
}

function prepareCreate(mongoose, Transaction, m){
    return q()
        .then(function(){
            m = m || {};
            if(!m.collectionName){
                return q.reject('Missing Entity name property for prepareCreate.');
            }
            if(!(mongoose.models[m.collectionName] && typeof mongoose.models[m.collectionName].remove==='function')){
                return q.reject('In prepareCreate: Model with entity name:'+m.collectionName+' does not have a remove function, cannot remove as rollback.');
            }
            if(!(m.entity && m.entity._id)){
                return q.reject('In prepareCreate: preparing to insert but no _id was provided. Use me.mongoose.Types.ObjectId() to create an _id first.');
            }
            if(!validate_transaction_id(m.transactionid)){
                return q.reject('In prepareCreate: preparing to insert but no valid transaction id was provided.');
            }
            return Transaction.create({status:'prepare'
                    ,transactionid:m.transactionid
                    ,entityid:m.entity._id
                    ,operation:'create'
                    ,collectionName:m.collectionName}
            );
        })//me.mongoose promises do not have .then or .catch return a q promise
        .then(function resolvePrepare(trans) {
            return q.resolve(trans);
        },function rejectPrepare(err) {
            return q.reject('Error in prepareCreate'+err.message);
        });
}
function prepareUpdate(mongoose, Transaction, m){
    return q()
        .then(function(){
            m = m || {};
            if(!m.collectionName){
                return q.reject('Missing Entity name property for prepareUpdate.');
            }
            if(!(mongoose.models[m.collectionName] && typeof mongoose.models[m.collectionName].collection.save==='function')){
                return q.reject('In prepareUpdate: Model with entity name:'+m.collectionName+' does not have a save function, cannot save as rollback.');
            }
            if(!(m.entity && m.entity._id)){
                return q.reject('In prepareUpdate: preparing to update but entity has no _id.');
            }
            if(!validate_transaction_id(m.transactionid)){
                return q.reject('In prepareUpdate: preparing to update but transaction has no valid _id.');
            }
            if(Object.keys(m.entity).length===1){
                return mongoose.models[m.collectionName].findOne({_id:m.entity._id.toString()},function(){}).exec();
            }
            return q.resolve(m.entity);
        }).then(function(entity){
            return Transaction.create({
                    status:'prepare'
                    ,transactionid:m.transactionid
                    ,orgValue:entity
                    ,entityid:entity._id
                    ,operation:'update'
                    ,collectionName:m.collectionName}
            );
        })//me.mongoose promises do not have .fail or .catch, return a q promise
        .then(function resolvePrepare(trans) {
            return q.resolve(trans);
        },function rejectPrepare(err) {
            return q.reject('Error in prepareUpdate:'+err.message+" - ");
        });
}
function prepareDelete(mongoose, Transaction, m){
    return q()
        .then(function(){
            m = m || {};
            if(!m.collectionName){
                return q.reject('Missing Entity name property for prepareDelete.');
            }
            if(!(mongoose.models[m.collectionName] && typeof mongoose.models[m.collectionName].create==='function')){
                return q.reject('In prepareDelete: Model with entity name:'+m.collectionName+' does not have a create function, cannot create as rollback.');
            }
            if(!(m.entity && m.entity._id)){
                return q.reject('In prepareDelete: preparing to delete but no _id was provided.');
            }
            if(!isValidObjectId(m.transactionid.toString())){
                return q.reject('In prepareDelete: preparing to delete but no valid transaction id was provided.');
            }
            //find the entity if it only has an _id
            if(Object.keys(m.entity).length===1){
                return mongoose.models[m.collectionName].findOne({_id:m.entity._id.toString()},function(){})
                    .exec();
            }
            return q.resolve(m.entity);
        }).then(function(entity){
            return Transaction.create({status:'prepare'
                    ,transactionid:m.transactionid
                    ,orgValue:entity
                    ,entityid:m.entity._id
                    ,operation:'delete'
                    ,collectionName:m.collectionName}
            );
        })//me.mongoose promises do not have .fail or .catch, return a q promise
        .then(function resolvePrepare(trans) {
            return q.resolve(trans);
        },function rejectPrepare(err) {
            return q.reject('Error in prepareDelete:'+err.message+" - ");
        });
}