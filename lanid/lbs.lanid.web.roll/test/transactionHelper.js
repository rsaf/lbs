/* 
 * This should be a seperate project that other modules can depend on (see the Transaction model in models as well)
 * Code here will help the module to start, commit and roll back transactions
 */

function _isValidObjectId(id) {
  if(id == null) return false;

  if(id != null && 'number' != typeof id && (id.length != 12 && id.length != 24)) {
    return false;
  } else {
    // Check specifically for hex correctness
    if(typeof id == 'string' && id.length == 24) return /^[0-9a-fA-F]{24}$/.test(id);
    return false;
  }
};

var Q = require('q')
, mongoose
, TransactionSchema = null
, Transaction = null;
function _updateTransactions(arg){
  return Transaction.update(arg.query,arg.doc,{multi:true})
    .exec(function(){});//add dummy function to force it to write as save    
}
function _insertOriginals(arg){
  var i=arg.transactions.length,promise=Q();
  function addPromise(t){
    promise = promise.then(function(){
      return mongoose.models[t.collectionName].create(t.orgValue,function(e,d){
      });
    });
  }
  while(--i>-1){
    addPromise(arg.transactions[i]);
  }
  return promise;
}
function _deleteOriginals(arg){
  var i=arg.transactions.length,promises=[];
  while(--i>-1){
    promises.push(
      mongoose.models[arg.transactions[i].collectionName].remove({_id:arg.transactions[i].entityid}
        ,function(){}).exec()//dummy function to have exec return a promise and treat this as save
    );
  }
  return Q.all(promises);
}
function _restoreOriginals(arg){
  var i=arg.transactions.length,promise=Q();
  function deleteInsert(t){
    promise = promise.then(function(){
      return _deleteOriginals({transactions:[t]})
    }).then(function(){
      return _insertOriginals({transactions:[t]});
    });
  }
  while(--i>-1){
    deleteInsert(arg.transactions[i]);
  }
  return promise;
}
var transactionHelper = {
  prepareCreate:function prepareCreate(m){
    return Q().then(function(){
      m = m || {};
      if(!m.collectionName){
        return Q.reject('Missing Entity name property for prepareCreate.');
      }
      if(!(mongoose.models[m.collectionName] && typeof mongoose.models[m.collectionName].remove==='function')){
        return Q.reject('In prepareCreate: Model with entity name:'+m.collectionName+' does not have a remove function, cannot remove as rollback.');
      }
      if(!(m.entity && m.entity._id)){
        return Q.reject('In prepareCreate: preparing to insert but no _id was provided. Use mongoose.Types.ObjectId() to create an _id first.');
      }
      if(!_isValidObjectId(m.entity._id.toString())){
        return Q.reject('In prepareCreate: preparing to insert but no valid _id was provided. Use mongoose.Types.ObjectId() to create an _id first.');
      }
      if(!_isValidObjectId(m.transactionid.toString())){
        return Q.reject('In prepareCreate: preparing to insert but no valid transaction id was provided.');
      }
      return Transaction.create({status:'prepare'
        ,transactionid:m.transactionid
        ,entityid:m.entity._id
        ,operation:'create'
        ,collectionName:m.collectionName});
    });
  }
  , prepareUpdate:function prepareUpdate(m){
    return Q().then(function(){
      m = m || {};
      if(!m.collectionName){
        return Q.reject('Missing Entity name property for prepareUpdate.');
      }
      if(!(mongoose.models[m.collectionName] && typeof mongoose.models[m.collectionName].collection.save==='function')){
        return Q.reject('In prepareUpdate: Model with entity name:'+m.collectionName+' does not have a save function, cannot save as rollback.');
      }
      if(!(m.entity && m.entity._id)){
        return Q.reject('In prepareUpdate: preparing to update but entity has no _id.');
      }
      if(!_isValidObjectId(m.entity._id.toString())){
        return Q.reject('In prepareUpdate: preparing to update but entity has no valid _id.');
      }
      if(!_isValidObjectId(m.transactionid.toString())){
        return Q.reject('In prepareUpdate: preparing to update but transaction has no valid _id.');
      }
      return Transaction.create({
        status:'prepare'
        ,transactionid:m.transactionid
        ,orgValue:m.entity
        ,entityid:m.entity._id
        ,operation:'update'
        ,collectionName:m.collectionName});
    });
  }
  , prepareDelete:function prepareDelete(m){
    return Q().then(function(){
      m = m || {};
      if(!m.collectionName){
        return Q.reject('Missing Entity name property for prepareDelete.');
      }
      if(!(mongoose.models[m.collectionName] && typeof mongoose.models[m.collectionName].create==='function')){
        return Q.reject('In prepareDelete: Model with entity name:'+m.collectionName+' does not have a create function, cannot create as rollback.');
      }
      if(!(m.entity && m.entity._id)){
        return Q.reject('In prepareDelete: preparing to delete but no _id was provided.');
      }
      if(!_isValidObjectId(m.entity._id.toString())){
        return Q.reject('In prepareDelete: preparing to delete but no valid _id was provided.');
      }
      if(!_isValidObjectId(m.transactionid.toString())){
        return Q.reject('In prepareDelete: preparing to delete but no valid transaction id was provided.');
      }
      //@todo: find the entity if it only has an _id
      if(Object.keys(m.entity).length===1){
        return mongoose.models[m.collectionName].findOne({_id:m.entity._id.toString()},function(){})
                .exec();
      }
      return Q(m.entity);
    }).then(function(entity){
      return Transaction.create({status:'prepare'
        ,transactionid:m.transactionid
        ,orgValue:entity
        ,entityid:m.entity._id
        ,operation:'delete'
        ,collectionName:m.collectionName});
    });
  }
  , commit:function commit(m){
    return _updateTransactions({
      doc:{ status: 'commited' }
      ,query:{"transactionid":m.transactionid}
    });
  }
  , rollback:function rollback(m){
    return Q().then(function(){
      if(!_isValidObjectId(m.transactionid.toString())){
        return Q.reject('In rollback: preparing to rollback but no valid transaction id was provided.');
      }
      return Transaction.find({"transactionid":m.transactionid,operation:{$in:['create']}},function(){})
          .select({entityid:1,collectionName:1})
          .exec();
    }).then(function(transactions){
      return _deleteOriginals({transactions:transactions});
    }).then(function(){
      return Transaction.find({"transactionid":m.transactionid,operation:{$in:['delete','update']}},function(){})
          .select({entityid:1,orgValue:1,operation:1,collectionName:1})
          .sort({_id:1})
          .exec();
    }).then(function(transactions){
      return _restoreOriginals({transactions:transactions});
    }).then(function(){
      return _updateTransactions({
        doc:{ status: 'rolledback' }
        ,query:{"transactionid":m.transactionid.toString()}
      });
    });
  }
  , getNextSequence: function getNextSequence(name){
    var d = Q.defer();
    mongoose.models['counters'].findOneAndUpdate({_id:name},{ $inc: { seq: 1 } },function(e,dt){
      if(e){
        d.reject(e);return;
      }
      d.resolve(dt);
    });
    return d.promise;
  }
};

//@todo: write a prepareDelete (used on paymentlist)
//@todo: write a funtion to get all records for a certain transaction id
//
//inject all dependencies
exports.init = function init(m) {
  mongoose = m.pl.mongoose;
  TransactionSchema = require("./models/Transaction.js")(mongoose);
  Transaction = mongoose.model('transactions', TransactionSchema);
  return transactionHelper;
};


