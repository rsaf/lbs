/**
 * Created by leo on 8/9/15.
 */

module.exports = function (mongoose,common_schema) {
    var entity_schema = mongoose.Schema({
        eid: {type:mongoose.Schema.Types.ObjectId},
        ds: {type:Boolean, default: false},
        ac: common_schema.ac, //audit control
        sc: common_schema.sc, // security control
        oc: common_schema.oc,
        desc: {type: String}, //app description
        name: {type: String, default: "app1"}, //app name
        dname: {type: String}, //display name
        linkTo: {type: String},
        //icons: {type: mongoose.Schema.Types.Mixed},
        icons: {large: String, idefault: String, iselected: String},
        parent: {type:mongoose.Schema.Types.ObjectId, ref: 'apps'},
        ufid: {type: String}
    });
    return entity_schema;
};