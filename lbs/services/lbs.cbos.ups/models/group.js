/**
 * Created by leo on 8/9/15.
 */
module.exports = function (param_mongoose){
    var group_schema = param_mongoose.Schema({
        //id:
        mc: {type: Number, default:1}, //member counts
        cd:{ type: Date, default: Date.now } //created date
    });
    return group_schema;
};
