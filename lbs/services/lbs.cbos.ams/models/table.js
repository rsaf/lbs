/**
 * Created by leo on 9/4/15.
 */

module.exports = function (mongoose, common_schema) {
    var entity_schema = mongoose.Schema({
        eid: {type:mongoose.Schema.Types.ObjectId},
        ds: {type:Boolean, default: false},
        ac: common_schema.ac, //audit control
        sc: common_schema.sc, // security control
        oc: common_schema.oc,
        name: {type: String},
        type: {type: String},
        desc: {type: String},
        parent: {type:mongoose.Schema.Types.ObjectId, ref: 'canvas'},
        fields: [{fn: String, ft:String, fid:String, fdn: String, ufid: String }], //field name // ufid user friendly id, vt view type
        views: [{vid: String, vn: String, vt: String, vfields:[{fid:String, ufid: String}], vtu: String, mvtu: String, uuid:String, uuidm: String, ufid: String }], //vn: view name , vfield: view fields , fid: field id, fd:field directive
        forms: [{fid: String, name: String, ffields:[{fid:String,ft: String,fd: String,label: String,desc:String, ufid: String}], ftu: String, mftu: String, uuid:String, uuidm: String, ufid: String }],
        workflows: [{wid: String, name: String, wtu: String, uuid:String, ufid: String }],
        dvid: String, //default view id
        dvtu: String, //default view template url,
        dfid: String, //default form id
        dftu: String, //defautl form template url
        ufid: String
    });
    return entity_schema;
};