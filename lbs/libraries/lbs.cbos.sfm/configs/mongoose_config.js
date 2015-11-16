/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mongooseODMs = [];

module.exports.get_mongoose  = function(paramDB){
        var  dbConfig = require('./cbos.json').external_services.mgconfig;
        var mongooseODM = require('mongoose');
        mongooseODM = new mongooseODM.Mongoose();
        mongooseODM.connect(dbConfig.uri + paramDB, dbConfig.options);
        mongooseODMs.push(mongooseODM);
        console.log('SFM: connecting to mongodb for '+ mongooseODM.connection.name);
        return mongooseODM;

};

process.on('SIGINT', function(){
    for (var i in mongooseODMs){
        console.log('db connection ready state: ' + mongooseODMs[i].connection.readyState );
        mongooseODMs[i].connection.close(function(){
            console.log('Mongoose disconnected due to application termination...');
    });
    }
    process.exit(0);
});

