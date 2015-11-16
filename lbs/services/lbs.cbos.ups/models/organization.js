/**
 * Created by leo on 8/9/15.
 */
module.exports = function (param_mongoose, param_audit_schema){

    var organization_schema = param_mongoose.Schema({
        //id:
        cd:{ type: Date, default: Date.now } //created date
    });
    return organization_schema;
};
