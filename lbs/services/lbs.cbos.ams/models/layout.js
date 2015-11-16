/**
 * Created by leo on 9/4/15.
 */

module.exports = function (mongoose, common_schema) {
    var entity_schema = mongoose.Schema({
        eid: {type: mongoose.Schema.Types.ObjectId},
        ds: {type: Boolean, default: false},
        ac: common_schema.ac, //audit control
        sc: common_schema.sc, // security control
        oc: common_schema.oc,
        name: {type: String, default: "layout1"},
        desc: {type: String},
        type: {type: String},
        parent: {type: mongoose.Schema.Types.ObjectId, ref: 'apps'},
        ltu: String, // layout template url, this is current not use since it is also store in the navigation. it may be use for validation later
        uuid: String,
        lcp: [{lig: String, cpd: String}], // layout components  lig: component location in grid, cpd: component directive,
        ufid: String,
        isp: {type: Boolean, default: false} // isp : is published ?
    });
    return entity_schema;
}