/**
 * Created by root on 8/21/15.
 */

module.exports = function (paramMongoose, paramFormSchema){

    var NodeTemplateSchema = new paramMongoose.Schema({
        code : {type:String, required:true},
        name : String,
        nid : String,
        isActive : Boolean,
        initial : String,
        transitions : [
            {
                name: String,
                from: String,
                to: String
            }
        ],
        callbacks : Object
    });
    return NodeTemplateSchema;
};