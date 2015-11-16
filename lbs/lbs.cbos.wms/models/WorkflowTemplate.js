/**
 * Created by root on 8/21/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var workflowTemplateSchema = new paramMongoose.Schema({
        code : {type:String, required:true},
        name : String,
        marked : String,
        edges : Object,
        nodes : Object,
        published : Boolean
    });
    return workflowTemplateSchema;
};


