/**
 * Created by leo on 8/9/15.
 */

var fs = require('fs');

var q = null;
var mongoose = null;
var _ = null;
var cheerio = null;

var esb_messenger = null;
var entity_model_map = {};

exports.operations = [
    init,
    ams_create_entity,
    ams_read_entity,
    ams_update_entity,
    ams_delete_entity,
    ams_create_entities,
    ams_read_entities,
    ams_create_entity_done,
    ams_add_cbos_component,
    ams_get_app_components,
    ams_get_canvas_components,
    ams_get_user_desktop_apps,
    ams_get_user_top_nav
];

// re-export ops (for testing)
exports.operations.forEach(function(op) {
    //console.log(op.name);
    exports[op.name] = op;
});

function init(m){
    var r = {"pl": {}, "er": {}};
    q = m.pl.dep.nmm.q();
    _ = m.pl.dep.nmm.lodash();
    cheerio = m.pl.dep.nmm.cheerio();
    esb_messenger = m.pl.mc;
    var  p0 = m.pl.dep.sfm.get_mongoose({"sns": "ams"});
    var  p1 = m.pl.dep.sfm.get_app_config({"sns":"ams"});

   return q.all([p0,p1]).then(function success(r){
       try {
           mongoose = r[0].pl.so;
           var app_config = r[1].pl.ac;
           var model_file_path = app_config.application.api.codebase_root + "/services/lbs.cbos.ams" + '/models';
           fs.readdirSync(model_file_path).forEach(function (file) {
               //console.log(model_file_path + '/' + file);
               var common_schema =  m.pl.dep.clm.common_schema();
               var entity_schema = require(model_file_path + '/' + file)(mongoose, common_schema);
               entity_schema.methods.setValues =  m.pl.dep.clm.set_entity_values();
               entity_schema.methods.updateValues = m.pl.dep.clm.update_entity_values();
               entity_schema.methods.setCreated =  m.pl.dep.clm.set_entity_created();
               entity_schema.methods.setModified =  m.pl.dep.clm.set_entity_modified();
               entity_schema.methods.setOwner = m.pl.dep.clm.set_entity_owner();
               var entity_model_name = file.substring(0, (file.length-3));
               var entity_model = mongoose.model(entity_model_name,entity_schema);
               entity_model_map[entity_model_name] = entity_model;
               //console.log("UPS: loaded model:  %s", entity_model_name);
           });
           r.pl = {"ss":"ams initiation done!"};
           return r;
       }
       catch(exception){
           console.log(exception);
           throw exception;
       }

    }).then(null, function failure(err){
       r.er = {ec:9000, em: err};
       throw r;
    });
};

function ams_create_entity(m) {
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    //console.log("AMS: creating entity with key %s $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", entity_keys[0]);
    console.log ("AMS: Create entity ... %s", JSON.stringify(m.pl));
    if (entity_keys.length === 1){
        var entity_name = entity_keys[0];
        var entity_model_instance = new entity_model_map[entity_name]();
        entity_model_instance.setValues(m.pl[entity_name]);
        entity_model_instance.setCreated(m.ac);
        return entity_model_instance.save().then(function success(entity){
            //console.log("AMS: entity created %s ", JSON.stringify(entity));
            r.pl[entity_name] = entity;
            return r;
        }).then(null, function failure(err){
            r.er = {ec:9016, em: err};
            return r;
        });
    }
    else {
        r.er =  {ec: "3000", em: "invalid entity in payload"};
        return q.reject(r);
    }
};

function ams_read_entity(m) {
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    var query_conditions = {"ac.c.oid": m.ac.oid, "ds": false};
    var name = null;
    var eid = null;
    var sqm = null;

    if (entity_keys.length === 1) {
        var entity_name = entity_keys[0];
        eid = _.get(m, "pl." + entity_name + ".eid");
        name = _.get(m, "pl." + entity_name + ".name");

        if(m.sqm){
           var criteria_keys = _.keys(m.sqm);
           criteria_keys.forEach(function(key){
               query_conditions[key] = m.sqm[key];
           })
        }
        else if (eid) {
            query_conditions["eid"] = eid;
        }
        else if (name) {
            query_conditions["name"] = name;
        }

        if (m.sqm || eid || name ) {
            return entity_model_map[entity_name].findOne(query_conditions).exec().then(function success(entity) {
                r.pl[entity_name] = entity;
                return r;
            }).then(null, function failure(err) {
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "no name provided"};
            return q.reject(r);
        }
    }
}

function ams_update_entity(m) {
    console.log("AMS: update entity receiving message %s", JSON.stringify(m));
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    if (entity_keys.length === 1) {
        var entity_type = entity_keys[0];
        console.log("AMS: updating entity with key %s", entity_type);
        var entity_eid = _.get(m, "pl." + entity_type + ".eid");
        if (entity_eid) {
            var query_condition = {"eid": entity_eid, "ac.c.oid": m.ac.oid, "ds": false};
            var entity_model = entity_model_map[entity_type];
            return entity_model.findOne(query_condition).exec().then(function success(old_entity) {
                //console.log("AMS: old_entity from db ...%s ", old_entity);
                var new_entity = JSON.parse(JSON.stringify(m.pl[entity_type]));
                delete new_entity.eid;
                delete new_entity._id;
                delete new_entity.sc;
                delete new_entity.ac;
                delete new_entity.ds;
                delete new_entity.__v;
                //console.log("AMS: new entity %s ", JSON.stringify(new_entity));
                for (var field  in new_entity) {
                    if (entity_model.schema.path(field).instance === "Array") {
                       //console.log("AMS: Array field found ...%s ", field);
                        if (new_entity[field]._id) {
                           //console.log("AMS: new entity array field %s", JSON.stringify(new_entity[field]));
                            if (old_entity[field].length > 0) {
                                for (i = 0; i < old_entity[field].length; i++) {
                                    if ( (old_entity[field][i]._id == new_entity[field]._id)) {
                                        old_entity[field].splice(i, 1);
                                        old_entity[field].push(new_entity[field])
                                    }
                                    //else {
                                    //    old_entity[field].push(new_entity[field]);
                                    //}
                                }
                            }
                            else {
                                old_entity[field].push(new_entity[field]);
                            }
                        }
                        else {
                            if( !(_.isEmpty(new_entity[field]))){
                                //@Todo avoid pushing empty field into the array
                                old_entity[field].push(new_entity[field]);
                            }
                        }
                    }
                    else {
                        //console.log("AMS: simple field found ... %s " ,field);
                        old_entity[field] = new_entity[field];
                    }
                }
                old_entity.setModified(m.ac);
                return old_entity.save();
            }).then(function success(saved_entity) {
                //console.log("AMS: Save entity ---> %s", saved_entity);
                r.pl[entity_type] = saved_entity;
                return r;
            }).then(null, function failure(err) {
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "no eid provided"};
            return q.reject(r);
        }
    }
    else {
        r.er = {ec: 9022, em: "invalid entity length in pl"};
        return q.reject(r);
    }
}

//function ams_update_entity(m) {
//    var r = {"pl": {}, "er": {}};
//    var entity_keys = _.keys(m.pl);
//    if (entity_keys.length === 1) {
//        var entity_name = entity_keys[0];
//        //console.log("AMS: updating entity with key %s", entity_name);
//        var eid = _.get(m, "pl." + entity_name + ".eid");
//        if (eid) {
//            var query_condition = {"eid": eid, "ac.c.oid": m.ac.oid, "ds": false};
//            var update_option = {new: true};
//            var entity = m.pl[entity_name]
//            delete entity.eid;
//            var update_condition = {};
//            var update_array_values = {};
//            var update_non_array_values = {};
//            var entity_model = entity_model_map[entity_name];
//            for (var field  in entity) {
//                //console.log("AMS: ============= field %s  has type %s", field, entity_model.schema.path(field).instance)
//                if (entity_model.schema.path(field).instance === "Array") {
//                    update_array_values[field] = entity[field];
//                    update_condition["$push"] = update_array_values;
//                }
//                else {
//                    update_non_array_values[field] = entity[field];
//                    update_condition["$set"] = update_non_array_values;
//                }
//            }
//            //console.log("AMS: ====== Update condition %s", JSON.stringify(update_condition));
//            //update_condition = {$set: update_non_array_values, $push: update_array_values};
//            return entity_model.findOneAndUpdate(query_condition, update_condition, update_option).exec().then(function success(entity) {
//                entity.setModified(m.ac);
//                return entity.save();
//            }).then(function success(entity) {
//                //console.log("AMS: entity updated %s ", JSON.stringify(entity));
//                r.pl[entity_keys[0]] = entity;
//                return r;
//            }).then(null, function failure(err) {
//                r.er = {ec: 9018, em: err};
//                return r;
//            });
//        }
//        else {
//            r.er = {ec: 9021, em: "no eid provided"};
//            return q.reject(r);
//        }
//    }
//    else {
//        r.er = {ec: 9022, em: "invalid entity length in pl"};
//        return q.reject(r);
//    }
//}

//function ams_delete_entity(m){
//    var r = {"pl": {}, "er": {}};
//    var entity_keys = _.keys(m.pl);
//    if( _.get(m,"pl."+entity_keys[0]+".eid") ){
//        return entity_model_map[entity_keys[0]].findOne({"eid": _.get(m,"pl."+entity_keys[0]+".eid"), "ac.c.oid": m.ac.oid, "ds": false}).exec().then(function success(entity){
//            entity.set("ds", true);
//            entity.setModified(m.ac);
//            return entity.save();
//        }).then(function success(entity){
//            r.pl[entity_keys[0]]= entity;
//            return r;
//        }).then(null, function failure(err){
//            r.er = {ec:9019, em: err};
//            return r;
//        });
//    }
//    else {
//        r.er = {ec:9022, em: "no eid provided"};
//        return q.reject(r);
//    }
//
//}

function ams_delete_entity(m) {
    console.log("AMS: update entity receiving message %s", JSON.stringify(m))
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    if (entity_keys.length === 1) {
        var entity_type = entity_keys[0];
        //console.log("AMS: updating entity with key %s", entity_type);
        var entity_eid = _.get(m, "pl." + entity_type + ".eid");
        if (entity_eid) {
            var query_condition = {"eid": entity_eid, "ac.c.oid": m.ac.oid, "ds": false};
            var entity_model = entity_model_map[entity_type];
            return entity_model.findOne(query_condition).exec().then(function success(old_entity) {
                //console.log("AMS: old_entity from db ...%s ", old_entity);
                var new_entity = JSON.parse(JSON.stringify(m.pl[entity_type]));
                delete new_entity.eid;
                delete new_entity._id;
                delete new_entity.sc;
                delete new_entity.ac;
                delete new_entity.ds;
                delete new_entity.__v;
                //console.log("AMS: new entity %s ", JSON.stringify(new_entity));
                if(_.keys(new_entity).length > 0){
                    for (var field  in new_entity) {
                        if (entity_model.schema.path(field).instance === "Array") {
                            //console.log("AMS: Array field found ...%s ", field);
                            if (  new_entity[field]._id ) {
                                 //console.log("AMS: new entity array field %s", JSON.stringify(new_entity[field]));
                                if (old_entity[field].length > 0) {
                                    for (i = 0; i < old_entity[field].length; i++) {
                                         //console.log("AMS: old entity array field %s", old_entity[field][i]);
                                         //console.log(old_entity[field][i]._id + " === " + new_entity[field]._id );
                                        if ((old_entity[field][i]._id == new_entity[field]._id)) {
                                            old_entity[field].splice(i, 1);
                                           // no need to add new value, since the item has been deleted
                                           // old_entity[field].push(new_entity[field])
                                        }
                                    }
                                }
                            }

                        }
                        else {
                            //console.log("AMS: simple field found ... %s " ,field);
                            //deleted simple fields will simply set their values to empty, which should be the value sent to teh back end
                            old_entity[field] = new_entity[field];
                        }
                    }
                }
               else {
                    //if no fields in the entity, delete the whole entity using our marked for delete flag
                    old_entity.set("ds", true);
                }
                old_entity.setModified(m.ac);
                return old_entity.save();
            }).then(function success(saved_entity) {
                //console.log("AMS: Save entity ---> %s", saved_entity);
                r.pl[entity_type] = saved_entity;
                return r;
            }).then(null, function failure(err) {
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "no eid provided"};
            return q.reject(r);
        }
    }
    else {
        r.er = {ec: 9022, em: "invalid entity length in pl"};
        return q.reject(r);
    }
}

function ams_read_entities(m) {
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    var query_conditions = {"ac.c.oid": m.ac.oid, "ds": false};
    if (entity_keys.length === 1) {
        var entity_type = entity_keys[0].substring(0, entity_keys[0].length - 1); //remove the s from the end of the entity name
        if (m.sqm) {
            var criteria_keys = _.keys(m.sqm);
            criteria_keys.forEach(function (key) {
                query_conditions[key] = m.sqm[key];
            });
            return entity_model_map[entity_type].find(query_conditions).sort({"ac.m.md": -1}).exec().then(function success(entities) {
                r.pl[entity_keys[0]] = entities;
                return r;
            }).then(null, function failure(err) {
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "no filtering query provided"};
            return q.reject(r);
        }
    }
    else {
        r.er = {ec: 9022, em: "invalid entity type  or number .. "};
        return q.reject(r);
    }
}

function ams_create_entities(m) {

    console.log("AMS: Create entities message ", JSON.stringify(m));

    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    if (entity_keys.length === 1){
       // var entity_type = entity_keys[0];
        var entity_type = entity_keys[0].substring(0, entity_keys[0].length - 1); //remove the s from the end of the entity name
        var all_promises = [];
        var entities = m.pl[entity_keys[0]].data;

        entities.forEach(function(entity){
            entity.parent =  m.pl[entity_keys[0]].parent;
            var entity_model_instance = new entity_model_map[entity_type]();

            //console.log("AMS: creating entity ... %s", JSON.stringify(entity));
            entity_model_instance.setValues(entity);
            entity_model_instance.setCreated(m.ac);
            var p = entity_model_instance.save();
            all_promises.push(p);
        })

        return q.all(all_promises).then(function success(entities){
            //console.log("AMS entities from db ----> ", entities);

            r.pl[entity_keys[0]]= entities;
            return r;
        }).then(null, function failure(er){
            console.log(er);
            r.er = {ec:9016, em: err};
            return r;
        })

    }
    else {
        r.er =  {ec: "3000", em: "invalid entity in payload"};
        return q.reject(r);
    }
};

function ams_create_entity_done(m){
    console.log("AMS: ams_create_entity_done receiving message %s", JSON.stringify(m))
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    var queryconditions = {"ac.c.oid": m.ac.oid, "ds": false};
    var entity_name = null;
    var entity_eid = null;
    var entity_type = entity_keys[0];

    if (entity_keys.length) {
        entity_eid = _.get(m, "pl." + entity_type + ".eid");
        entity_name = _.get(m, "pl." + entity_type + ".name");
        if (entity_eid) {
            queryconditions["eid"] = entity_eid;
        }
        else if (entity_name) {
            queryconditions["name"] = entity_name;
        }

        if (entity_eid || entity_name ) {
            return entity_model_map[entity_type].findOne(queryconditions).exec().then(function success(entity) {



                if(m.sqm.ct ==='tables'){
                    //console.log("TABLES %s", JSON.stringify(entity));
                    return _generate_table_html(entity);
                }
                else if(m.sqm.ct ==='forms'){
                   // console.log("FORMS %s", JSON.stringify(entity));
                    return _generate_form_html(entity);
                }
            }).then(function success(modified_entity){
                //console.log(modified_entity);
                modified_entity.setModified(m.ac);
                return modified_entity.save();
            }).then(function success(saved_entity){
                //console.log("AMS: Save entity ---> %s", saved_entity);
                 r.pl[entity_type] = saved_entity;
                return r;
            }).then(null, function failure(err) {
                console.log("AMS: create component done  error %s", JSON.stringify(err));
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "no name provided"};
            return q.reject(r);
        }
    }
}

function ams_add_cbos_component(m) {
    console.log("AMS: ams_add_cbos_component receiving message %s", JSON.stringify(m))
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    if (entity_keys.length === 1) {
        var entity_type = entity_keys[0];
        //console.log("AMS: updating entity with key %s", entity_type);
        var entity_eid = _.get(m, "pl." + entity_type + ".eid");
        if (entity_eid) {
            var query_condition = {"eid": entity_eid, "ac.c.oid": m.ac.oid, "ds": false};
            var entity_model = entity_model_map[entity_type];
            return entity_model.findOne(query_condition).exec().then(function success(old_entity) {
                console.log("AMS: old_entity from db ...%s ", old_entity);
                var new_entity = JSON.parse(JSON.stringify(m.pl[entity_type]));
                delete new_entity.eid;
                delete new_entity._id;
                delete new_entity.sc;
                delete new_entity.ac;
                delete new_entity.ds;
                delete new_entity.__v;
                //console.log("AMS: new entity %s ", JSON.stringify(new_entity));
                for (var field  in new_entity) {
                    //console.log("AMS: field found %s ", field);
                    if (entity_model.schema.path(field).instance === "Array") {
                        //console.log("AMS: Array field found %s ", field);
                        if (new_entity[field].lig) {
                            //console.log("AMS: new entity array field %s", new_entity[field]);
                            //reformate lcp json data
                            var lcp = {
                                "lig":  new_entity[field].lig,
                                "cpd" : '<cbos-table-runtime tid="'+ new_entity[field].tid +'"  rtid="'+ new_entity[field].rtid + '"  rfid="'+new_entity[field].rfid+'"  vtu="'+ new_entity[field].vtu+'" mvtu="'+ new_entity[field].mvtu+'" ftu="'+ new_entity[field].ftu +'" mftu="'+ new_entity[field].mftu +'"  title="'+new_entity[field].title +'"></cbos-table-runtime>'
                            };
                            new_entity[field] = lcp;
                            if (old_entity[field].length > 0) {
                                for (i = 0; i < old_entity[field].length; i++) {
                                    if (old_entity[field][i].lig === new_entity[field].lig) {
                                        old_entity[field].splice(i, 1);
                                        old_entity[field].push(new_entity[field])
                                    }
                                    else {
                                        old_entity[field].push(new_entity[field]);
                                    }
                                }
                            }
                            else {
                                old_entity[field].push(new_entity[field]);
                            }
                        }
                        else {
                            if(new_entity[field]){
                              //@Todo avoid pushing empty field into the array
                              //old_entity[field].push(new_entity[field]);
                            }
                        }
                    }
                    else {
                        console.log("AMS: pushing simple fields ... %s " ,field);
                        old_entity[field] = new_entity[field];
                    }
                }
                if (entity_type === 'layout') {
                    return _generate_layout_html(old_entity);
                }
            }).then(function success(modified_entity) {
                modified_entity.setModified(m.ac);
                console.log("AMS: saving modified_entity to db ...%s ", modified_entity);
                return modified_entity.save();
            }).then(function success(saved_entity) {
                //console.log("AMS: Save entity ---> %s", saved_entity);
                r.pl[entity_type] = saved_entity;
                return r;
            }).then(null, function failure(err) {
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "no eid provided"};
            return q.reject(r);
        }
    }
    else {
        r.er = {ec: 9022, em: "invalid entity length in pl"};
        return q.reject(r);
    }
}

function _generate_table_html(tableJson){
    var all_promises = [];
    if (tableJson  && tableJson.views && tableJson.fields) {
        var table_fields_nav = _.indexBy(tableJson.fields, 'fid');
        tableJson.views.forEach( function (table_view){
            var view_fields = table_view.vfields;
            var new_header= ' <div><h4 class="pull-left cbos-margin-bottom-0">{{componentTitle}}</h4> <div class="dropdown pull-right cbos-margin-right-0"> <span class="cbos-pointer dropdown-toggle glyphicon glyphicon-list cbos-grayer cbos-gray-border" title="table menu" style="font-size: 1.5em; " id="addTableRecord" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"></span> <ul class="dropdown-menu" aria-labelledby="addTableRecord"> <li><a ui-sref={{linkTo}}>Add Record</a></li> <li><a href="#">Edit Record</a></li> <li><a href="#">View Record</a></li> <li><a href="#">Delete Record</a></li> </ul> </div> <div class="clearfix"></div> </div>';
            var table_template = '<div>' +  new_header + '<table class="cbos-table runtime"><tr class="cbos-table-header">';
            var table_header= "";
            var table_row = "";
            //console.log("AMS: template %s", table_template);

            view_fields.forEach(function (view_field) {
                table_header = table_header + "<td>" + table_fields_nav[view_field.fid].fn + "</td>";
                //table_row = table_row + "<td> {{row." + view_field.fid + "}} </td>";
                table_row = table_row + "<td> {{row.rdt." + table_fields_nav[view_field.fid].fid + "}} </td>";
            });
            table_template = table_template + table_header;
            table_template = table_template + '</tr><tr ng-repeat="row in rows">';
            table_template = table_template + table_row;
            table_template = table_template + '</tr></table></div>';
            console.log("AMS: saving table template ...");
            var p = esb_messenger({"op": "bms_create_blob", "pl": {"table": {"blob": table_template, "ext": "html", "uuid": table_view.uuid}}});
            all_promises.push(p);
        });
        return q.all(all_promises).then( function success(r){
         for (var i = 0; i < r.length; i ++){
             tableJson.views[i].vtu = r[i].pl.table.url;
             tableJson.views[i].uuid = r[i].pl.table.uuid;
         }
           console.log("AMS: table template  generated, starting to generate mobile template ..  ");
           return _generate_table_html_mobile(tableJson)
           //return tableJson;

        }).then(null, function(er){
            console.log(er);
            return er;
        })
    }
    else {
        r.er = {ec: 9030, em: "invalid table json provided"};
        return q.reject(r);
    }
}

function _generate_table_html_mobile(tableJson){
    var all_promises = [];
    if (tableJson  && tableJson.views && tableJson.fields) {
        var table_fields_nav = _.indexBy(tableJson.fields, 'fid');
        tableJson.views.forEach( function (table_view){
            var view_fields = table_view.vfields;
            var table_menu = ' <div class="runtime-mobile-table-actions cbos-gray-border pull-right "> <div class="dropdown pull-left cbos-margin-right-0"> <span class="cbos-pointer cbos-gray glyphicon glyphicon-list cbos-padding-5-15 cbos-pointer dropdown-toggle" id="mobileAddTableRecord" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></span> <ul class="dropdown-menu" aria-labelledby="mobileAddTableRecord"> <li><a ui-sref={{linkTo}}>Add Record</a></li> <li><a >Edit Record</a></li> <li><a >View Record</a></li> <li><a >Delete Record</a></li> </ul> </div> <div class="cbos-border-left cbos-pointer cbos-gray glyphicon pull-left cbos-padding-5-15 cbos-line-height cbos-pointer" ng-class="{\'glyphicon-menu-down\': mobileTableCollapsed, \'glyphicon-menu-up\': !mobileTableCollapsed}" ng-init="mobileTableCollapsed=false" ng-click="mobileTableCollapsed = !mobileTableCollapsed"></div> <div class="clearfix"></div> </div>';
            var mobile_template = '<div class="runtime-mobile-table"> <div class="runtime-mobile-table-header cbos-gray-border cbos-padding-5"> <div class="pull-left" style="line-height: 32px;">{{componentTitle}}</div> '+table_menu+' <div class="clearfix"></div> </div> <div collapse="mobileTableCollapsed" > <div class=" runtime-mobile-table-body cbos-gray-border cbos-border-top-none"> <div class="runtime-mobile-table-row" ng-repeat="row in rows" > <div class="pull-right check-select"> <input type="checkbox"></div> <div class="description ellipsis ">'

            var row_first_item = '';
            var row_second_item = '';
            var row_third_item = '';

            if(view_fields.length > 1){
                row_first_item =  '<h4 class="ellipsis"> {{row.rdt.' + table_fields_nav[view_fields[1].fid].fid + '}}</h4>';
             }
            if(view_fields.length > 2){
                row_second_item = '<span class="ellipsis">' + table_fields_nav[view_fields[2].fid].fn + ':  {{row.rdt.' + table_fields_nav[view_fields[2].fid].fid + '}}</span>';
            }

            if(view_fields.length>3){
                row_third_item = ' <span class="ellipsis">' + table_fields_nav[view_fields[3].fid].fn + ': {{row.rdt.' + table_fields_nav[view_fields[3].fid].fid + '}}</span>';
            }
            mobile_template = mobile_template + row_first_item;
            mobile_template = mobile_template + '<div class="details">' + row_second_item  + row_third_item +' </div> </div> <div class="clearfix"></div> </div> </div> </div> </div>'


            console.log("AMS: saving table template mobile version... %s", mobile_template);
            var p = esb_messenger({"op": "bms_create_blob", "pl": {"table": {"blob": mobile_template, "ext": "html", "uuid": table_view.uuidm}}});
            all_promises.push(p);
        });
        return q.all(all_promises).then( function success(r){
            for (var i = 0; i < r.length; i ++){
                tableJson.views[i].mvtu = r[i].pl.table.url;
                tableJson.views[i].uuidm = r[i].pl.table.uuid;
            }
            console.log("AMS: mobile template  generated ");
            return tableJson;

        }).then(null, function(er){
            console.log(er);
            return er;
        })
    }
    else {
        r.er = {ec: 9030, em: "invalid table json provided"};
        return q.reject(r);
    }
}

function _generate_form_html(tableJson){
    var all_promises = [];
    var table_form_element_html_map = {
        '0001': '<div class="form-group"> <label class="control-label col-sm-3">cboslabel</label><div class="col-sm-9"> <input type="text" class="form-control" ng-blur="autoSaveFormData({cbosfid:cbosfid})" ng-model="cbosfid"> </div> </div>',
        '0010': '',
        '0011': '',
        '0100': '',
        '0101': '',
        '0110': '',
        '0111': '',
        '1000': ''
    };


    if (tableJson  && tableJson.forms) {
         console.log(JSON.stringify(tableJson.forms));
        tableJson.forms.forEach( function (table_form){
            var form_fields = table_form.ffields;
            var form_template = '<div class="modal" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog modal700"><div class="modal-content"><div class="modal-header cbos-bluebg"><button type="button" class="close" aria-label="Close" ng-click="dismiss()"><span aria-hidden="true">&times;</span></button>';
            var form_header = ' <h4 class="modal-title cbos-white">{{componentTitle}}</h4></div><div class="modal-body"><div class="form-horizontal">';
                form_template = form_template + form_header;
            var form_elements = '';

            form_fields.forEach(function (field) {
                var form_element = table_form_element_html_map[field.fd];
                form_element = form_element.toString().replace("cboslabel",field.label);
                form_element = form_element.toString().replace('ng-model="cbosfid"','ng-model="' + field.ufid + '"' );
                form_element = form_element.toString().replace('ng-blur="autoSaveFormData({cbosfid:cbosfid})"','ng-blur="autoSaveFormData({'+field.ufid +':'+field.ufid +'})"' );
                form_element = form_element.toString().replace('cbosfid',field.ufid);
                form_elements = form_elements + form_element;
            });

            form_template = form_template + form_elements;
            var form_footer = '</div><div class="clearfix"></div></div><div class="modal-footer"><div class="cbos-modal-footer-inner"><button class="btn cbos-btn cbos-btn-gray cbos-btn-lg" ng-click="dismiss()">Cancel</button><button class="btn cbos-btn cbos-btn-blue cbos-btn-lg" ng-click="submitModalForm()">OK</button></div></div></div></div></div>';
            form_template = form_template + form_footer;


            console.log("AMS: saving table template ...");
            var p = esb_messenger({"op": "bms_create_blob", "pl": {"form": {"blob": form_template, "ext": "html", "uuid": table_form.uuid}}});
            all_promises.push(p);
        });
        return q.all(all_promises).then( function success(r){
            for (var i = 0; i < r.length; i ++){
                tableJson.forms[i].ftu = r[i].pl.form.url;
                tableJson.forms[i].uuid = r[i].pl.form.uuid;
            }
            console.log("AMS: form template  generated, starting to generate mobile version ");

            return _generate_form_html_mobile(tableJson);
            //return tableJson;

        }).then(null, function(er){
            console.log(er);
            return er;
        })
    }
    else {
        r.er = {ec: 9030, em: "invalid table json provided"};
        return q.reject(r);
    }
}

function _generate_form_html_mobile(tableJson){
    var all_promises = [];
    var table_form_element_html_map = {
        '0001': '<div class="form-group"> <label class="control-label col-sm-3">cboslabel</label><div class="col-sm-9"> <input type="text" class="form-control" ng-blur="autoSaveFormData({cbosfid:cbosfid})" ng-model="cbosfid"> </div> </div>',
        '0010': '',
        '0011': '',
        '0100': '',
        '0101': '',
        '0110': '',
        '0111': '',
        '1000': ''
    };

    if (tableJson  && tableJson.forms) {
        console.log(JSON.stringify(tableJson.forms));
        tableJson.forms.forEach( function (table_form){
            var form_fields = table_form.ffields;
            var form_template = '<div class="container-fluid mobileRecordFormContainer"><div class="mobileRecordFormBody"><div class="form-horizontal">';
            var form_elements = '';
            form_fields.forEach(function (field) {
                var form_element = table_form_element_html_map[field.fd];
                form_element = form_element.toString().replace("cboslabel",field.label);
                form_element = form_element.toString().replace('ng-model="cbosfid"','ng-model="' + field.ufid + '"' );
                form_element = form_element.toString().replace('ng-blur="autoSaveFormData({cbosfid:cbosfid})"','ng-blur="autoSaveFormData({'+field.ufid +':'+field.ufid +'})"' );
                form_element = form_element.toString().replace('cbosfid',field.ufid);
                form_elements = form_elements + form_element;
            });
            form_template = form_template + form_elements;
            var form_footer = ' </div><div class="clearfix"></div> </div> <div class="mobile-record-form-footer"> <div class="cbos-modal-footer-inner"> <button class="btn cbos-btn cbos-btn-gray cbos-btn-lg" ng-click="dismiss()">Cancel</button> <button class="btn cbos-btn cbos-btn-blue cbos-btn-lg" ng-click="submitForm()">Ok</button> </div> </div> </div>';
            form_template = form_template + form_footer;

            console.log("AMS: saving table template ...");
            var p = esb_messenger({"op": "bms_create_blob", "pl": {"form": {"blob": form_template, "ext": "html", "uuid": table_form.uuidm}}});
            all_promises.push(p);
        });
        return q.all(all_promises).then( function success(r){
            for (var i = 0; i < r.length; i ++){
                tableJson.forms[i].mftu = r[i].pl.form.url;
                tableJson.forms[i].uuidm = r[i].pl.form.uuid;
            }
            console.log("AMS: table template  generated ");
            return tableJson;

        }).then(null, function(er){
            console.log(er);
            return er;
        })
    }
    else {
        r.er = {ec: 9030, em: "invalid table json provided"};
        return q.reject(r);
    }
}

function _generate_layout_html(layout_json){
    var layout_templates_definitions = {};
    layout_templates_definitions["1y"] = '<div class="cbos-runtime-grid"><div class="cbos-1y-grid cbos-grid-block"><div class="cbos-y1-grid  grid-place-holder"><cbos-add-component-container lig="cbos-y1-grid" ></cbos-add-component-container></div></div></div>';
    layout_templates_definitions["2y"] = '<div class="cbos-runtime-grid"><div class="cbos-2y-grid cbos-grid-block"><div class="cbos-y1-grid grid-place-holder"><cbos-add-component-container lig="cbos-y1-grid" ></cbos-add-component-container></div><div class="cbos-y2-grid grid-place-holder"><cbos-add-component-container lig="cbos-y2-grid"></cbos-add-component-container></div></div></div>';
    layout_templates_definitions["2y-sidebar"]= '<div class="cbos-runtime-grid"><div class="row cbos-grid-row"><div class="col-sm-8 cbos-grid-col"><div class="cbos-2y-grid cbos-grid-block "><div class="cbos-y1-grid grid-place-holder"> <cbos-add-component-container lig="cbos-y1-grid" ></cbos-add-component-container></div><div class="cbos-y2-grid grid-place-holder"> <cbos-add-component-container lig="cbos-y2-grid" ></cbos-add-component-container></div></div></div><div class="col-sm-4 cbos-grid-col"><div class="cbos-sidebar grid-place-holder"><cbos-add-component-container lig="cbos-sidebar" ></cbos-add-component-container></div></div></div></div>';
    layout_templates_definitions["2y-y2x1-y2x2"] = '<div class="cbos-runtime-grid "><div class="cbos-2y-grid cbos-grid-block"><div class="cbos-y1-grid grid-place-holder"><cbos-add-component-container lig="cbos-y1-grid" ></cbos-add-component-container></div><div class="cbos-y2-grid"><div class="cbos-2x-grid cbos-grid-block"><div class="container-fluid cbos-grid-container"><div class="row cbos-grid-row"><div class="col-sm-6  cbos-grid-col"><div class="cbos-x1-grid  grid-place-holder"> <cbos-add-component-container lig="cbos-x1-grid" ></cbos-add-component-container></div></div><div class="col-sm-6 cbos-grid-col"><div class="cbos-x2-grid  grid-place-holder "><cbos-add-component-container lig="cbos-x2-grid" ></cbos-add-component-container></div></div></div></div></div></div></div></div>';
    layout_templates_definitions["2y-y2x1-y2x2-y2x3"] = '<div class="cbos-runtime-grid"><div class="cbos-2y-grid cbos-grid-block"><div class="cbos-y1-grid grid-place-holder"> <cbos-add-component-container lig="cbos-y1-grid" ></cbos-add-component-container> </div><div class="cbos-y2-grid"><div class="cbos-3x-grid cbos-grid-block"><div class="container-fluid cbos-grid-container"><div class="row cbos-grid-row"><div class="col-sm-4 cbos-grid-col"><div class="cbos-x1-grid grid-place-holder"> <cbos-add-component-container lig="cbos-x1-grid" ></cbos-add-component-container></div></div><div class="col-sm-4  cbos-grid-col"><div class="cbos-x2-grid grid-place-holder"><cbos-add-component-container lig="cbos-x2-grid" ></cbos-add-component-container></div></div><div class="col-sm-4 cbos-grid-col"><div class="cbos-x3-grid grid-place-holder"> <cbos-add-component-container lig="cbos-x3-grid" ></cbos-add-component-container></div></div></div></div></div></div></div></div>';
    if(layout_json.type){
        var current_layout_template_dom = cheerio.load(layout_templates_definitions[layout_json.type]);
        console.log("\n\nAMS: parsed html template ..%s \n\n" , current_layout_template_dom.html());
        if(layout_json.lcp){
            var layout_components = layout_json.lcp;
            layout_components.forEach(function (component) {
                current_layout_template_dom('cbos-add-component-container[lig="' + component.lig + '"]').parent('.'+component.lig).removeClass('grid-place-holder');
                current_layout_template_dom('cbos-add-component-container[lig="' + component.lig + '"]').replaceWith(component.cpd);
            });
        }
        console.log("AMS: saving layout template ...%s n\n\n",  current_layout_template_dom.html());
        return esb_messenger({"op": "bms_create_blob", "pl": {"layout": {"blob": current_layout_template_dom.html(), "ext": "html", "uuid": layout_json.uuid}}}).then( function success(r){
            layout_json.ltu = r.pl.layout.url;
            layout_json.uuid = r.pl.layout.uuid;
            return layout_json;
        }).then(null, function failure(er){
            console.log(er);
            return er;
        } );
    }
    else {
        r.er = {ec: 9040, em: "invalid layout json provided"};
        return q.reject(r);
    }
}

function ams_get_app_components(m){
    var r = {"pl": {}, "er": {}};
    var components = [];
    var entity_keys = _.keys(m.pl);
    console.log("starting to find components ....");
        if ((entity_keys.length > 0) && (m.pl[entity_keys[0]].eid)) {
            return entity_model_map["canvas"].find({"parent": m.pl[entity_keys[0]].eid, "ac.c.oid": m.ac.oid, "ds": false}).exec().then(function success(canvases) {
                //console.log("canvases %s", canvases);
                var canvases_promise = [];
                canvases.forEach(function (canvas){
                    var canvas_linkTo = "desktop.app.canvas({appName:'" + m.pl[entity_keys[0]].name.toLowerCase() +"',canvasName:'" + canvas.ufid +"'})";
                    var canvas_node = {
                        'id': canvas.ufid,
                        'title':canvas.name,
                        'linkTo':canvas_linkTo ,
                        'nodes': []
                    };
                    var charts_promise = entity_model_map["chart"].find({"parent": canvas.eid , "ac.c.oid": m.ac.oid, "ds": false}).exec();
                    var tables_promise = entity_model_map["table"].find({"parent": canvas.eid , "ac.c.oid": m.ac.oid, "ds": false}).exec();
                    var canvas_promise = q.all([charts_promise,tables_promise]);
                    canvases_promise.push(canvas_promise);
                    canvas_promise.then(function success(reply){
                        //console.log("canvas promise reply %s", reply)
                        var charts = reply[0];
                        var charts_node = {
                            'id': "charts" + canvas.ufid,
                            'title':"Charts",
                            'linkTo': canvas_linkTo,
                            'nodes': []
                        };
                        if(charts.length >0){
                            charts.forEach(function(chart){
                                var chart_node = {
                                    'id': chart.ufid,
                                    'title':chart.name,
                                    'linkTo': canvas_linkTo,
                                    'nodes': []
                                };
                                charts_node.nodes.push(chart_node);
                            });
                        }

                        var tables = reply[1];
                        var tables_node = {
                            'id': "tables" + canvas.ufid,
                            'title':"Tables",
                            'linkTo': canvas_linkTo,
                            'nodes': []
                        };
                        var forms_node = {
                            'id': "forms" + canvas.ufid,
                            'title':"Forms",
                            'linkTo': canvas_linkTo,
                            'nodes': []
                        };

                        var workflows_node = {
                            'id': "workflows" + canvas.ufid,
                            'title':"Workflows",
                            'linkTo': canvas_linkTo,
                            'nodes': []
                        };

                        if(tables.length >0){
                            tables.forEach(function(table){
                                var table_node = {
                                    'id': table.ufid,
                                    'title':table.name,
                                    'linkTo': canvas_linkTo,
                                    'nodes': []
                                };
                                tables_node.nodes.push(table_node);

                                if(table.forms.length > 0){
                                    table.forms.forEach(function(form){
                                        var form_node = {
                                            'id': form.ufid,
                                            'title':form.name,
                                            'linkTo': canvas_linkTo,
                                            'nodes': []
                                        };
                                        forms_node.nodes.push(form_node);
                                    })
                                }

                                if(table.workflows.length > 0){
                                    table.workflows.forEach(function(workflow){
                                        var workflow_node = {
                                            'id': workflow.ufid,
                                            'linkTo': canvas_linkTo,
                                            'title':workflow.name,
                                            'nodes': []
                                        };
                                        workflows_node.nodes.push(workflow_node);
                                    })
                                }
                            });
                        }

                        canvas_node.nodes.push(tables_node);
                        canvas_node.nodes.push(forms_node);
                        canvas_node.nodes.push(workflows_node);
                        canvas_node.nodes.push(charts_node);

                        components.push(canvas_node);

                    }).then(null, function failure(er){
                        //console.log("canvas promise error %s", er)
                    })
                });
                return q.all(canvases_promise);
            }).then(function success(reply){
                //console.log("components to reply %s", components);
                r.pl.components = components;
                return r;
            }).then(null, function failure(err) {
                r.er = {ec: 9017, em: err};
                return r;
            });
        }
        else {
            r.er = {ec: 9021, em: "invalid entity or eid"};
            return q.reject(r);
        }
}

function ams_get_canvas_components(m){
    var r = {"pl": {}, "er": {}};
    var canvas_node = {};
    var tables_node = {};
    var forms_node  = {};
    var workflows_node = {};
    var charts_node = {};

    var canvas_linkTo = ""
    var entity_keys = _.keys(m.pl);
    console.log("starting to find components ...." );
    if ((entity_keys.length > 0) && (m.pl[entity_keys[0]].ufid)) {
        return entity_model_map["canvas"].findOne({"ufid": m.pl[entity_keys[0]].ufid, "ac.c.oid": m.ac.oid, "ds": false}).exec().then(function success(canvas) {
             console.log("canvas %s", canvas);
             canvas_linkTo = "desktop.app.canvas({appName:'" + canvas.ufid +"',canvasName:'" + canvas.ufid +"'})";
             canvas_node = {
                    'id': canvas.ufid,
                    'title':canvas.name,
                    'linkTo':'' ,
                    'nodes': []
             };
             tables_node = {
                'id': "tables" + canvas.ufid,
                'title':"Tables",
                'linkTo': canvas_linkTo,
                'nodes': []
            };
             forms_node = {
                'id': "forms" + canvas.ufid,
                'title':"Forms",
                'linkTo': canvas_linkTo,
                'nodes': []
            };

             workflows_node = {
                'id': "workflows" + canvas.ufid,
                'title':"Workflows",
                'linkTo': canvas_linkTo,
                'nodes': []
            };
             charts_node = {
                'id': "charts" + canvas.ufid,
                'title':"Charts",
                'linkTo': canvas_linkTo,
                'nodes': []
            };
            var charts_promise = entity_model_map["chart"].find({"parent": canvas.eid , "ac.c.oid": m.ac.oid, "ds": false}).exec();
            var tables_promise = entity_model_map["table"].find({"parent": canvas.eid , "ac.c.oid": m.ac.oid, "ds": false}).exec();
            return q.all([charts_promise,tables_promise]);
        }).then(function success(reply){
            //console.log("canvas promise reply %s", reply[1][1])
            var charts = reply[0];
            if(charts.length >0){
                charts.forEach(function(chart){
                    var chart_node = {
                        'id': chart.ufid,
                        'title':chart.name,
                        'linkTo': canvas_linkTo,
                        'nodes': []
                    };
                    charts_node.nodes.push(chart_node);
                });
            }


            var tables = reply[1];
            if(tables.length >0){
                tables.forEach(function(table){
                    var table_node = {
                        'id': table.ufid,
                        'title':table.name,
                        'linkTo': canvas_linkTo,
                        'nodes': []
                    };
                    tables_node.nodes.push(table_node);
                    console.log ("tables length  %s", JSON.stringify(tables_node));

                    if(table.forms.length > 0){
                        table.forms.forEach(function(form){
                            var form_node = {
                                'id': form.ufid,
                                'title':form.name,
                                'linkTo': canvas_linkTo,
                                'nodes': []
                            };
                            forms_node.nodes.push(form_node);
                        })
                    }

                    if(table.workflows.length > 0){
                        table.workflows.forEach(function(workflow){
                            var workflow_node = {
                                'id': workflow.ufid,
                                'linkTo': canvas_linkTo,
                                'title':workflow.name,
                                'nodes': []
                            };
                            workflows_node.nodes.push(workflow_node);
                        })
                    }
                });
            }

            canvas_node.nodes.push(tables_node);
            canvas_node.nodes.push(forms_node);
            canvas_node.nodes.push(workflows_node);
            canvas_node.nodes.push(charts_node);

            console.log("canvas components to reply %s", canvas_node);
            r.pl.canvas_node = canvas_node;
            return r;
        }).then(null, function failure(err) {
            r.er = {ec: 9017, em: err};
            return r;
        });
    }
    else {
        r.er = {ec: 9021, em: "invalid entity or eid"};
        return q.reject(r);
    }
}

function ams_get_user_desktop_apps(m){
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    console.log("starting to find user desktop with message .... %s", JSON.stringify(m));
    if (entity_keys.length > 0) {
         return entity_model_map["app"].find({"ac.c.oid": m.ac.oid, "ds": false}).exec().then(function success(reply) {
            r.pl["apps"] = JSON.parse(JSON.stringify(reply));
            console.log("AMS: returning desktop", r);
            return r;
        }).then(null, function failure(err) {
            r.er = {ec: 9017, em: err};
            console.log("AMS: error getting desktop %s", err);
            return r;
        });
    }
    else {
        r.er = {ec: 9021, em: "invalid entity or eid"};
        console.log("AMS: error getting desktop %s", r.er.em);
        return q.reject(r);
    }
}

function ams_get_user_top_nav(m){
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);
    console.log("starting to find user desktop with message .... %s", JSON.stringify(m));
    if (entity_keys.length > 0) {
        //"oc.o.uid": m.ac.uid,
        return entity_model_map["navigationtop"].find({"ac.c.oid": m.ac.oid, "ds": false}).exec().then(function success(reply) {
            r.pl["navigationtop"] = JSON.parse(JSON.stringify(reply));
            console.log("AMS: returning navigationtop", r);
            return r;
        }).then(null, function failure(err) {
            r.er = {ec: 9017, em: err};
            console.log("AMS: error getting navigationtop %s", err);
            return r;
        });
    }
    else {
        r.er = {ec: 9021, em: "invalid entity or eid"};
        console.log("AMS: error getting navigationtop %s", r.er.em);
        return q.reject(r);
    }
}

//
//function ams_get_user_desktop_apps_backup(m){
//    var r = {"pl": {}, "er": {}};
//    var entity_keys = _.keys(m.pl);
//    console.log("starting to find user desktop with message .... %s", JSON.stringify(m));
//    if ((entity_keys.length > 0) && (m.pl[entity_keys[0]].eid)) {
//        //var p0 = entity_model_map["app"].findOne({"ac.c.oid": m.ac.oid, "ds": false}).exec();
//        var p1 = entity_model_map["app"].find({"ac.c.oid": m.ac.oid, "ds": false}).exec();
//        //var p2 = entity_model_map["navigationtop"].findOne({ "oc.o.uid": m.oc.uid, "oc.o.oid": m.oc.oid, "ds": false}).exec();
//        return q.all([p1]).then(function success(reply) {
//            var apps_storage = JSON.parse(JSON.stringify(reply[0]));
//            r.pl["apps"] = apps_storage;
//            console.log("AMS: returning desktop", r);
//            return r;
//        }).then(null, function failure(err) {
//            r.er = {ec: 9017, em: err};
//            console.log("AMS: error getting desktop %s", err);
//            return r;
//        });
//    }
//    else {
//        r.er = {ec: 9021, em: "invalid entity or eid"};
//        console.log("AMS: error getting desktop %s", r.er.em);
//        return q.reject(r);
//    }
//}