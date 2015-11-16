/**
 * Created by root on 9/2/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var nodeSchema = new paramMongoose.Schema({
        "code": String,
        "name": String,
        "fsm":String,
        "input" : Object,
        "output" : Object,
        "params" : Object
    });
    return nodeSchema;
};