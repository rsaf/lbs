var exp = require('express');
var bs = exp();
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');

var oHomeRouter ;
var oOperationsLogRouter ;
var oServiceRouter ;


module.exports.startBS = function(scmPassport, scmCheckUserAccess, olmRequestLogger, paramESB){
console.log('\nBS: self configuring with injected dependencies ....');
try {

    oHomeRouter = require('./handlers/hh.js')(exp, paramESB);
    oOperationsLogRouter = require('./handlers/olh.js')(exp, paramESB);
    oServiceRouter = require('./handlers/smh.js')(exp, paramESB);

// all environments
    bs.set('port', process.env.PORT || 10000);
    bs.use(session({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
    bs.use(bodyParser.json());
    bs.use(bodyParser.urlencoded({extended: true}));

    bs.get('/favicon.ico', oOperationsLogRouter); // this is messing our logger
    bs.use(exp.static('./static'));

    bs.use(errorHandler());
    bs.use(logger('dev'));

    console.log('BS: configuring security middleware...');
    bs.use(scmPassport.initialize());
    bs.use(scmPassport.session());
    console.log('BS: configuring user requests logger middleware...');

    bs.use(olmRequestLogger());

    bs.use('/home', oHomeRouter);
    console.log('BS: configuring user acl middleware...');
    bs.use(scmCheckUserAccess());

    console.log('BS: configuring REST endpoints request handles middleware...');
    //REST API Interface
    //Business functions expose from here
    bs.use('/workspace/operationslog', oOperationsLogRouter);
    bs.use('/workspace/services', oServiceRouter);
    bs.all('*', oHelpers.four_oh_four);

    console.log('BS: bs is fully configured ...');
    return bs;
}
catch(ex){
    console.log(ex);
}

};
