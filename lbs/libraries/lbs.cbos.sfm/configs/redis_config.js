/**
 * Created by LBS006 on 3/4/15.
 */




var redis_clients = [];
var redis_client = null;

module.exports.get_redis_client  = function(paramNamespace){

    // initialize database connection
    var  redis_config = require('./cbos.json').external_services.rdconfig;
    if(redis_config.pass){
        //console.log("SFM: redis password", redis_config.pass);
        redis_client = require('redis').createClient(redis_config.port, redis_config.host,{auth_pass: redis_config.pass});
    }
    else{
        redis_client = require('redis').createClient(redis_config.port, redis_config.host,{});
    }

    redis_clients.push(redis_client);

    console.log('SFM: connecting to redis db for ' + paramNamespace);
    return redis_client;
};

process.on('SIGINT', function(){

    for (var i in redis_clients){
        console.log('SFM: Closing redis connection...');
        redis_clients[i].quit();
    }
    process.exit(0);
});

