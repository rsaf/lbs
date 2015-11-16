module.exports = function (paramMongoose, paramFormSchema){

    var workflowSchema = new paramMongoose.Schema({
        code : {type:String, required:true},
        name : String,
        marked : String,
        nodes : Object,
        edges : Object
    });
    return workflowSchema;
};


