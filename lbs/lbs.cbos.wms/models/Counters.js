/**
 * Created by root on 9/2/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var counterSchema = new paramMongoose.Schema({
        "type" : String,
        "prefix" : String,
        "counter" : Number
    });
    return counterSchema;
};