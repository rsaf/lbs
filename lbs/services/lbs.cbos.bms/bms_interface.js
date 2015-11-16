/**
 * Created by leo on 8/10/15.
 */

var q = null;
var esb_messenger = null;
var node_uuid = null;
var cbos_bucket1_root = null;
var cbos_bucket2_root = null;
var fs = require('fs');

function init(m) {
    var r = {"pl": null, "er": null};
    esb_messenger = m.pl.mc;
    q = m.pl.dep.nmm.q();
    node_uuid = m.pl.dep.nmm.node_uuid();
    _ = m.pl.dep.nmm.lodash();

    var deferred = q.defer();
    var p0 = m.pl.dep.sfm.get_app_config({"sns":"bms"});

    q.all([p0]).then(function (r) {
        var app_config = r[0].pl.ac;

        app_config.application.api.services.forEach(function (service){
            if(service.namespace==="bms"){
                cbos_bucket1_root = app_config.application.api.codebase_root + service.codebase + service.bucket1_location;
                cbos_bucket2_root = app_config.application.api.codebase_root + service.codebase + service.bucket2_location;
                console.log(cbos_bucket1_root);
                console.log(cbos_bucket2_root);
            }
        });

        deferred.resolve({pl: {"ss": "bms initiation done!"}, er: null});

    }).fail(function (err) {
        deferred.reject({pl: null, er: {ec: 1007, em: err}});
    })
    return deferred.promise;
}

function get_bucket(uuid) {
    var bucket1_pattern = /^[0-9][0-9a-f]{7}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    var bucket2_pattern = /^[a-f][0-9a-f]{7}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    var bucket = null;
    if (bucket1_pattern.test(uuid)){
        bucket = cbos_bucket1_root;
        console.log('returning bucket1', bucket, uuid );
        return bucket;
    }
    else if (bucket2_pattern.test(uuid)){
        bucket = cbos_bucket2_root;
        console.log('returning bucket2 %s %s', bucket, uuid );
        return bucket;
    } else {
        throw new Error('Invalid UUID: ' + uuid);
    }
}

function bms_create_blob (m){
    console.log("BMS: starting to create html for message %s ", JSON.stringify(m.pl))
    var r = {"pl": {}, "er": {}};
    var entity_keys = _.keys(m.pl);

    var blob_uuid = null;
    var blob_data = null;
    var blob_type = null;
    var blob_ext = null;

    if (entity_keys.length){
        blob_type = entity_keys[0];
    }
    else {
        r.er = {ec: 3009, em: " invalid payload.."}
        console.log("BMS erorr %s", JSON.stringify(r.er));
        return q.reject(r);
    }
    if (m.pl[blob_type].uuid){
        blob_uuid = m.pl[blob_type].uuid;
    }
    else {
        //@Todo this should be base on the bucket host
        blob_uuid = node_uuid.v4();
    }

    if(m.pl[blob_type].blob){
        blob_data = m.pl[blob_type].blob;
    }
    else {
        r.er = {ec: 3004, em: "invalid blob"}
        console.log("BMS erorr %s", JSON.stringify(r.er));
        return q.reject(r);
    }

    ////@Todo validate blob type
    //if((m.pl && m.pl.btype) && (true)){
    //    blob_type = m.pl.btype;
    //    blob_type = blob_type + 's';
    //}
    //else {
    //    r.er = {ec: 3004, em: "invalid blob type"}
    //    return q.reject(r);
    //}

    if(m.pl[blob_type].ext){
        blob_ext = m.pl[blob_type].ext;
    }
    else {
        r.er = {ec: 3004, em: "invalid blob extension"}
        console.log("BMS erorr %s", JSON.stringify(r.er));
        return q.reject(r);
    }

    var first_level = blob_uuid.substring(0,1);
    var second_level = blob_uuid.substring(1,2);
    var third_level = blob_uuid.substring(2,3);
    var first_level_path = get_bucket(blob_uuid) + '/' + blob_type + 's' + '/' + first_level;
    var second_level_path = first_level_path + '/' + second_level;
    var third_level_path = second_level_path + '/' + third_level;
    var file_path = third_level_path +  '/' + blob_uuid;
    var file_name = blob_uuid + '.' + blob_ext;

    if(!fs.existsSync(first_level_path)){
        fs.mkdirSync(first_level_path);
    }

    if(!fs.existsSync(second_level_path)){
        fs.mkdirSync(second_level_path);
    }

    if(!fs.existsSync(third_level_path)){
        fs.mkdirSync(third_level_path);
    }

    if(!fs.existsSync(file_path)){
        fs.mkdirSync(file_path);
    }
    console.log("BMS: starting to write to disk ...");
    fs.writeFileSync(file_path + '/' + file_name, blob_data );
    console.log("BMS: finished writing to disk ...");
    var blob_url = blob_type + 's' + '/' + file_name;
    r.pl[blob_type] = {uuid: blob_uuid, ext: blob_ext, name: file_name, url:blob_url};

    console.log("BMS: return reply");
    return q(r);
}

function bms_update_blob(m){
    return bms_create_blob(m);
}

function bms_read_blob(m){
    return
};

function bms_delete_blob(m){
    return;
}

exports.operations = [
    init,
    bms_create_blob,
    bms_update_blob,
    bms_read_blob,
    bms_delete_blob
];

exports.operations.forEach(function (op) {
    exports[op.name] = op;
});