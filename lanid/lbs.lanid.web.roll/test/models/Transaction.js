/* 
 * This should be part of a transaction helper module that can be installed as a
 * dependency of a module such as smm. The smm will initialize this module with
 * a mongoose and use the helper to store data for transactions as well as rollback
 * and commit
 */

module.exports = function (paramMongoose){

var TransactionSchema = new paramMongoose.Schema({
  status: String//@todo: this should be a set of values
  ,transactionid:{type:paramMongoose.Schema.Types.ObjectId,required:true}
  ,entityid:{type:paramMongoose.Schema.Types.ObjectId,required:true}
  ,startDate:{type:Date,required:true,default:new Date()}
  ,operation:String
  ,orgValue:Object
  ,collectionName:String
});

return TransactionSchema;

};