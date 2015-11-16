/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (param_mongoose, paramAuditSchema) {
    var user_schema = param_mongoose.Schema({
        //the created by and modify by schema will be injected
        //access control will also be injected
        //user_auditing: param_audit_schema,
        //eid: {type:param_mongoose.Schema.Types.ObjectId},
        ls: {type: Boolean, default: false}, //login status
        us: {type: String, default: "100"}, //user status 100 enable, 200 disable
        lhp: String, //last host ip
        lld: Date, //last login date
        lfd: Date, //last login fail date
        fc: Number, //fail count
        ed: Date, // account expiration date
        ut: String, // user type --> super, power, normal
        tlc: Number, //total login count
        gs: [{type: param_mongoose.Schema.Types.ObjectId, ref: 'group'}], //groups
        org: {type: param_mongoose.Schema.Types.ObjectId, ref: 'organization'}, // current organization
        cl: { //cbos login
            ln: {type: String, unique : true}, //login name
            hpw: String,  //hashed password
            lc: {type: Number, default : 0}
        },
        mb: String, //mobile number
        em: String, //email
        aid: String, //default app id
        nid: String, //default navigationtop id
        ufn: String, // user full name
        ual: String, // user avatar link
        ur: String  // user roll
    });
    return user_schema;
};