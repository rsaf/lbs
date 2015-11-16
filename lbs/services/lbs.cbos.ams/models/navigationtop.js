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
        name: {type: String},
        desc: {type: String},
        apps: [{name: String, aid:String,lnid:String, linkTo: String, icons: {idefault: String, iselected: String}}],
        //ln: layout name, lid: layout id , ltu: layout template url, lnid: left navigation id
        parent: {type:mongoose.Schema.Types.ObjectId, ref: 'apps'},
        ufid: String
    });
    return entity_schema;
};
