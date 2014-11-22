
var express = require('express');
var as = express();
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
as.set('port', process.env.PORT || 80);
as.use(logger('dev'));
as.use(session({ resave: true,saveUninitialized: true,secret: 'uwotm8' }));
as.use(bodyParser.json());
as.use(bodyParser.urlencoded({ extended: true }));
as.use(express.static(__dirname + '/static'));

// development only
if ('development' === as.get('env')) {
  as.use(errorHandler());
}
//as.use(oOLM.initialize());                
oSMM.initiat(as); // pass in the application to be secured... must appear after express session


as.use(oSMM.userIsAuthorized);

//REST API Interface




as.get('/', oWASRouter.generateHome);
//as.get('/', oWASRouter.generateBackendHome);// --> /home/home.html
as.post('/home/login',oSMM.loginUser);
as.get("/:pathLevel1/:pathLevel2?/:pathLevel3?", oSMM.userIsAuthorized, oWASRouter.generate);



//as.post('/admin/login',oSMM.loginUser);
//as.post('/admin/login', Auth_user.CheckAdminUser);

as.get('*', four_oh_four);

as.listen(as.get('port'), function(){
  console.log(" Dynamic content server started on port: "  + as.get('port'));
});

function four_oh_four(req, res) {
    res.writeHead(404, { "Content-Type" : "application/json" });
    res.end(JSON.stringify(oHelpers.invalid_resource()) + "\n");
}
