

var express = require('express');
var bs = express();
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');
var oWASRouter = require('./utilities/wasrouter.js');
var oSMM = require('smm');
var oUPM = require('upm');
var oOLM = require('olm');

// all environments
bs.set('port', process.env.PORT || 80);
bs.use(logger('dev'));
bs.use(session({ resave: true,saveUninitialized: true,secret: 'uwotm8' }));
bs.use(bodyParser.json());
bs.use(bodyParser.urlencoded({ extended: true }));
bs.use(express.static(__dirname + '/static'));

// development only
if ('development' === bs.get('env')) {
  bs.use(errorHandler());
}
bs.use(oOLM.initialize());
oSMM.initiat(bs); // pass in the application to be secured... must appear after express session

bs.get('/', oWASRouter.generateHome);// --> /home/home.html
bs.post('/home/login', oSMM.loginUser);
bs.post('/home/registration',oSMM.registerUser);

bs.use(oSMM.userIsAuthorized);

//REST API Interface

bs.get('/personal/operationslog/all.json', oWASRouter.getOperationsLogAll);// --> /home/home.html
bs.get('/personal/operationslog/business.json', oWASRouter.getOperationsLogBusiness);
bs.get('/personal/operationslog/access.json', oWASRouter.getOperationsLogAccess);


//bs.use(express.bodyParser());    //why require body parser when we can access it from express.bodyparser as done previously?
//bs.use(express.cokiesPaser());
//bs.post('/home/login', Auth_user.CheckUser);
//bs.post('/home/registration',oWRegister.registerUser);//Rolland fs

//bs.post('/home/userRegistration', oAuthenticator.registerUser);// Leo API
//bs.post('/home/forgotPassword', oWRegister.getUserResetEmail);
//bs.post('/home/forgotPwConfirmEmail', oWRegister.uerConfirmEmail);
//bs.post('/home/forgotPwNewPassword', oWRegister.saveNewPassword);

bs.get("/:pathLevel1/:pathLevel2?/:pathLevel3?", oSMM.userIsAuthorized, oWASRouter.generate);

//bs.get('/home/forgotPassword',oWRegister.getUserResetEmail);
//bs.get("/:pathLevel1/:pathLevel2?/:pathLevel3?", oWASRouter.generate);


bs.get('*', four_oh_four);

bs.listen(bs.get('port'), function(){
  console.log(" Dynamic content server started on port: "  + bs.get('port'));
});

function four_oh_four(req, res) {
    res.writeHead(404, { "Content-Type" : "application/json" });
    res.end(JSON.stringify(oHelpers.invalid_resource()) + "\n");
}

/*
bs.listen(80);

  console.log(" Dynamic Content Server Started on Port: 80 " );*/
