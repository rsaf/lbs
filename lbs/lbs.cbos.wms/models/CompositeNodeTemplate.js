/**
 * Created by root on 9/1/15.
 */
/**
 * Created by root on 8/21/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var compositeNodeTemplateSchema = new paramMongoose.Schema({
        code : {type:String, required:true},
        name : String,
        marked : String,
        edges : Object,
        nodes : Object
    });
    return compositeNodeTemplateSchema;
};