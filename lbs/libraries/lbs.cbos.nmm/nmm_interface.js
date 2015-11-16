/**
 * Created by leo on 8/1/15.
 */

module.exports.q = function(){
    //console.log ("GETTING q LIBRARY..");
    return require('q');
}

module.exports.express = function(){
    //console.log ("GETTING express LIBRARY..");
    var  exp =require('express');
    return exp();
}

module.exports.express_session = function(){
    //console.log ("GETTING express-session LIBRARY..");
    return require('express-session');
}

module.exports.morgan = function(){
    //console.log ("GETTING morgan LIBRARY..");
    return  require('morgan');
}

module.exports.connect_redis = function(param_express_session){
    //console.log ("GETTING connect-redis LIBRARY..");
 return require('connect-redis')(param_express_session);
}

module.exports.body_parser = function(){
    //console.log ("GETTING body-parser LIBRARY..");
  return   require('body-parser');
}

module.exports.cookie_parser = function(){
    //console.log ("GETTING cookie-parser LIBRARY..");
    return require('cookie-parser');
}

module.exports.error_handler = function(){
    //console.log ("GETTING errorhandler LIBRARY..");
    return require('errorhandler');
}

module.exports.debug = function(){
    return require('debug');
}

module.exports.formidable = function(){
    return require('formidable');
}

module.exports.soap = function(){
    return require('soap')
}

module.exports.md5 = function(){
    return require('md5');
}

module.exports.xml2js = function(){
    return require('xml2js');
}

module.exports.node_uuid = function(){
    return require('node-uuid');
}

module.exports.lodash = function(){
    return require('lodash');
}

module.exports.js_fsm = function(){
    return require('javascript-state-machine');
}

module.exports.passport = function(){
    return require('passport');
}

module.exports.passport_local_strategy = function(){
    return require('passport-local').Strategy;
}

module.exports.bcrypt  = function(){
    return require('bcrypt-nodejs');
}

module.exports.chai  = function(){
    return require('chai');
}

module.exports.parse5  = function(){
    return require('parse5');
}

module.exports.cheerio  = function(){
    return require('cheerio');
}



