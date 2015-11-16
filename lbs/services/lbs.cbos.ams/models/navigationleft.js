/**
 * Created by leo on 8/9/15.
 */
module.exports = function (mongoose, common_schema) {
    var entity_schema = mongoose.Schema({
        eid: {type:mongoose.Schema.Types.ObjectId},
        ds: {type:Boolean, default: false},
        ac: common_schema.ac, //audit control
        sc: common_schema.sc, // security control
        oc: common_schema.oc,
        name: {type: String, default: "left-nav"},
        dltu: String,
        dlid: String,
        dln: String,
        dlb: String, //default label show on left navigation
        desc: {type: String},
        layouts: [{ln: String, lid:String, ltu: String, lb:String, linkTo: String, icons: {idefault: String, iselected: String}}],
        parent: {type:mongoose.Schema.Types.ObjectId, ref: 'apps'},
        ufid: String
    });
    return entity_schema;
};