
var exp = require('express');
var bs = exp();
var esb = require('esb');

var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');
var oWASRouter = require('./utilities/wasrouter.js');
var oSCM = require('scm');
var oOLM = require('olm');

var oOperationsLogRouter = require('./handlers/olh.js')(exp,esb);
var oHomeRouter = require('./handlers/hh.js');

// all environments
bs.set('port', process.env.PORT || 80);
bs.use(session({ resave: true,saveUninitialized: true,secret: 'uwotm8' }));
bs.use(bodyParser.json());
bs.use(bodyParser.urlencoded({ extended: true }));

//local only
//if(process.env.STAGE=='local'){

bs.get('/favicon.ico', oOperationsLogRouter);
bs.use(exp.static(  './static'));
//bs.use(exp.static(__dirname +  '/static'));
//console.log(__dirname +  '/static');
//}

// local or development only
//if (process.env.STAGE == 'local'|| process.env.STAGE =='development') {
bs.use(errorHandler());
bs.use(logger('dev'));
//console.log(process.env.STAGE);
//}

bs.use(oSCM.initialize());
bs.use(oSCM.session());
bs.use(oOLM.logRequest());

bs.post('/home/login', oSCM.loginUser());
bs.post('/home/registration',oSCM.registerUser());


bs.use(oSCM.userIsAuthorized());

//REST API Interface
//Business functions expose from here
bs.use('/workspace/operationslog', oOperationsLogRouter);
bs.use('/workspace/finance', oOperationsLogRouter);

bs.get('*', oHelpers.four_oh_four);

module.exports = bs;
