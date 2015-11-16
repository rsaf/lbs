
var q = null;

var mongoose_config = require('./configs/mongoose_config.js');
var redis_configs = require('./configs/redis_config.js');

var smsConfigs = require('./configs/sms_configs.js');
var smtpConfigs = require('./configs/smtp_configs.js');

//var alipayConfigs = require('./configs/alipayConfigs.js');
//var navigationConfigs = require('./configs/navigationConfigs.js');

exports.init = function (m){
    var nmm = m.pl.dep.nmm;
    q = nmm.q();
    var clm = m.pl.dep.clm;
    return this;
}

exports.get_app_config = function(m){
    var r ={"pl":null, "er":null};
    var config = require('./configs/cbos.json');
    r.pl = {ac: config}; //app config
    //console.log (r);
    return q(r);
}

exports.get_mongoose = function(m){
    var r ={"pl":null, "er":null};
    var deferred = q.defer();
    var mongoose_odm  = mongoose_config.get_mongoose(m.sns);
    mongoose_odm.connection.on('connected', function(){
        r.pl = {so: mongoose_odm};
        console.log('\nSFM: sending mongodb dependency to ' + mongoose_odm.connection.name);
        deferred.resolve(r);
    });
    return deferred.promise;
}

exports.get_redis = function(m){
    var r ={"pl":null, "er":null};
    var deferred = q.defer();
    var redis_client = redis_configs.get_redis_client(m.sns);
    redis_client.on("connect", function () {
        r.pl = {so: redis_client};
        console.log('SFM: sending redis dependency to ' + m.sns);
        deferred.resolve(r);
    });
    return deferred.promise;
}

//
//exports.get_alipay_config = function(paramNameSpace){
//    r.pl = {fn: alipayConfigs.getAlipayConfig()};
//}
//
//exports.get_navigation = function(){
//    r.pl = {fn:navigationConfigs.getNavigations()};
//}
//

exports.get_smtp_client = function(m){
    var r ={"pl":{}, "er":{}};
    var smtp_client = smtpConfigs.get_smtp_client(m.sns);
    r.pl = {so: smtp_client};
    return q(r);
}

exports.get_sms_client = function(m){
    var r ={"pl":{}, "er":{}};
    var sms_client = smsConfigs.get_sms_client(m.sns);
    r.pl = {so: sms_client};
    return q(r);
}

