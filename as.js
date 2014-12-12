var exp = require('express');
var as = exp();
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');

var oHomeRouter ;
var oOperationsLogRouter ;
var oServiceRouter ;


module.exports.startBS = function(scmPassport, scmCheckUserAccess, olmRequestLogger, paramESB){
console.log('\nAS: self configuring with injected dependencies ....');
try {

    oHomeRouter = require('./handlers/hh.js')(exp, paramESB);
    oOperationsLogRouter = require('./handlers/olh.js')(exp, paramESB);
    oServiceRouter = require('./handlers/smh.js')(exp, paramESB);

// all environments
    as.set('port', process.env.PORT || 9000);
    as.use(session({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
    as.use(bodyParser.json());
    as.use(bodyParser.urlencoded({extended: true}));

    as.get('/favicon.ico', oOperationsLogRouter); // this is messing our logger
    as.use(exp.static('./static'));

    as.use(errorHandler());
    as.use(logger('dev'));

    console.log('as: configuring security middleware...');
    as.use(scmPassport.initialize());
    as.use(scmPassport.session());
    console.log('as: configuring user requests logger middleware...');

    as.use(olmRequestLogger());

    as.use('/home', oHomeRouter);
    console.log('as: configuring user acl middleware...');
    as.use(scmCheckUserAccess());

    console.log('as: configuring REST endpoints request handles middleware...');
    //REST API Interface
    //Business functions expose from here
    as.use('/workspace/operationslog', oOperationsLogRouter);
    as.use('/workspace/services', oServiceRouter);
    as.all('*', oHelpers.four_oh_four);

    console.log('as: as is fully configured ...');
    return as;
}
catch(ex){
    console.log(ex);
}

};
