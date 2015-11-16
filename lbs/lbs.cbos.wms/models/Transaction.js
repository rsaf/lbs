/**
 * Created by root on 9/15/15.
 */
/**
 * Created by root on 9/2/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var transactionSchema = new paramMongoose.Schema({
        status: String//@todo: this should be a set of values
        ,transactionid:{type:String,required:true}
        ,entityid:{type:String,required:true}// id of the entity to restore/remove/update not used when roll back a multiple update cannot be Objectid because sometimes a string is an id
        ,startDate:{type:Date,required:true,default:new Date()}
        ,operation:String
        ,query:Object //could be {"_id":{"$in":[val,val]}}
        ,values:String //the old value(s) (object to json string) could be: {'postal_code':'110000','service_name':'original name'} used when roll back multiple update together with query
        ,orgValue:Object
        ,collectionName:String
    });
    return transactionSchema;
};