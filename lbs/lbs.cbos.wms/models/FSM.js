/**
 * Created by root on 9/2/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var fsmSchema = new paramMongoose.Schema({
        "code" : String,
        "name" : String,
        "initial" : String,
        "transitions" : [
            {
                "name" : String,
                "from" : String,
                "to" : String
            }
        ],
        "callbacks" : Object
    });
    return fsmSchema;
};