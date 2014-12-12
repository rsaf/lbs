
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');

var express = require('express');
var ps = express();
var esb = require('./esb.js');

var psRouter = require('./handlers/psHandler.js')(ps,esb);

//Required for addressing the orthogonal concerns of security (authentication, authorization) and  user actions logging
//Only the ssm and olm modules have addresses orthogonal concerns
var oSSM = require('ssm');
var oOLM = require('olm');

//Set default environmental variables
bs.set('port', process.env.PORT || 80);
bs.set('env', process.env.TYPE || 'development');

bs.use(express.static(__dirname + '/static'));

//Development only
if ('development' === bs.get('env')) {
  bs.use(errorHandler());
  bs.use(logger('dev'));
}

bs.use(session({ resave: true,saveUninitialized: true,secret: 'uwotm8' }));
bs.use(bodyParser.json());
bs.use(bodyParser.urlencoded({ extended: true }));

bs.use(oOLM.logRequest());
oSMM.initiat(bs); // pass in the application to be secured... must appear after express session

//Addresses orthogonal concerns of authorizing users
bs.use(oSMM.userIsAuthorized);

//Functional modules routers
bs.use('/v1/ps', psRouter);


//All unkonwn REST requests
bs.all('*', oHelpers.four_oh_four);

bs.listen(bs.get('port'), function(){
  console.log(" Dynamic content server started on port: "  + bs.get('port'));
});
