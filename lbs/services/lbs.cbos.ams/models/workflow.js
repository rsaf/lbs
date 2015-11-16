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
        desc: {type: String},
        parent: {type:mongoose.Schema.Types.ObjectId, ref: 'canvas'},
        ufid: String
    });
    return entity_schema;
};