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
        parent: {type:mongoose.Schema.Types.ObjectId, ref: 'tables'},
        rtt: {type: String, default: "Title"}, //row title
        rdt: {type: mongoose.Schema.Types.Mixed}, //row data,
        ufid: String
    });
    return entity_schema;
};