/**
 * Created by root on 9/16/15.
 */
module.exports = function (paramMongoose, paramFormSchema){

    var debugSchema = new paramMongoose.Schema({
        toprint: String,
        version: {type:Number, default:0}
    });

    debugSchema.pre('save',function(next){
        console.log("incrementing save");
        this.version += 1;
        next();
    });

    return debugSchema;
};