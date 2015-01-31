var exp = require('express');
var bs = exp();
var logger = require('morgan');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');


var oHomeRouter ;               //  home
var oUserNotificationRouter;    // workspace/notifications  ==>  mdh.js  mdm
var oUserRouter;                // workspace/users          ==>  sch.js  scm ///
var oProfileRouter;             // workspace/profile        ==>  uph.js  upm
var oRequestRouter;             // workspace/requests       ==>  rmh.js  rmm
var oStandardsRouter;           // workspace/standards      ==>  pmh.js  pmm
var oPhotosRouter;              // workspace/photos         ==>  dmh.js  dmm
var oInspectionRouter;          // workspace/inspection     ==>  pmh.js  pmm //
var oCorrectionsRouter;         // workspace/corrections    ==>  pmh.js  pmm //
var oServiceRouter ;            // workspace/services       ==>  smh.js  smm //
var oActivitiesRouter;          // workspace/activities     ==>  bmh.js  bmm ///
var oResponsesRouter;           // workspace/responses      ==>  bmh.js  bmm ///
var oFinanceRouter;             // workspace/finance        ==>  fmh.js  fmm
var oInterfacesRouter           // workspace/interfaces     ==>  sch.js  scm
var oOperationsLogRouter ;      // workspace/operationslog  ==>  olh.js  olm

var oPhotoServiceRouter ;       // workspace/photoservices  ==>  pmh.js  pmm


var Q = require('q');

var scmPassportObject = null;
var olmRequestLoggerFunction = null;
var scmCheckUserFunction = null;
var esbMessageFunction = null;
var bsPort = null;
var p0 = null;
var p1 = null;
var p2 = null;
var p3 = null;


module.exports.startBS = function(paramESBMessage){

try {
    esbMessageFunction = paramESBMessage;
    // the promise for this init is completed once we get mongoose
    p0 = esbMessageFunction({
        op: 'dependency',
        pl: {dn: 'bsport'}
    });

    p1 = esbMessageFunction({
        ns: 'scm',
        op: 'getPassport'
    });

    p2 = esbMessageFunction({
        ns: 'olm',
        op: 'getLogRequest'
    });

    p3 = esbMessageFunction({
        ns: 'scm',
        op: 'getUserIsAuthorizedChecker'
    });

    console.log('\nBS: getting BS dependencies ...');
    return Q.all([p0, p1, p2, p3]).then(function (r) {

        //console.log(r);
        bsPort = r[0].pl.fn;
        scmPassportObject = r[1].pl.fn;
        olmRequestLoggerFunction = r[2].pl.fn;
        scmCheckUserFunction = r[3].pl.fn;

        oHomeRouter = require('./handlers/hh.js')(exp, paramESBMessage);                // home
        oUserNotificationRouter = require('./handlers/mdh.js')(exp, paramESBMessage);   // workspace/notifications
        oUserRouter = require('./handlers/sch.js')(exp, paramESBMessage);               // workspace/users
        oProfileRouter = require('./handlers/uph.js')(exp, paramESBMessage);            // workspace/profile
        oRequestRouter = require('./handlers/rmh.js')(exp, paramESBMessage);            // workspace/requests
        oStandardsRouter =  require('./handlers/pmh.js')(exp, paramESBMessage);         // workspace/standards
        oPhotosRouter= require('./handlers/dmh.js')(exp, paramESBMessage);              // workspace/photos
        oInspectionRouter = require('./handlers/pmh.js')(exp, paramESBMessage);         // workspace/inspection
        oCorrectionsRouter = require('./handlers/pmh.js')(exp, paramESBMessage);        // workspace/corrections
        oServiceRouter = require('./handlers/smh.js')(exp, paramESBMessage);            // workspace/services
        oActivitiesRouter = require('./handlers/bmh.js')(exp, paramESBMessage);         // workspace/activities
        oResponsesRouter  =  require('./handlers/bmh.js')(exp, paramESBMessage);        // workspace/responses
        oFinanceRouter = require('./handlers/fmh.js')(exp, paramESBMessage);            // workspace/finance
        oInterfacesRouter = require('./handlers/sch.js')(exp, paramESBMessage);         // workspace/interfaces
        oOperationsLogRouter = require('./handlers/olh.js')(exp, paramESBMessage);      // workspace/operationslog

        oPhotoServiceRouter = require('./handlers/pmh.js')(exp, paramESBMessage);       // workspace/photoservices

        console.log('BS: self configuring with injected dependencies ....');
        bs.set('port', bsPort);
        bs.use(expressSession({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
        bs.use(bodyParser.json());
        bs.use(bodyParser.urlencoded({extended: true}));

        bs.get('/favicon.ico', oOperationsLogRouter); // this is messing our logger
        bs.get('/', oHelpers.testStartPage); //use for local testing only
        bs.use(exp.static('./static')); //use for local testing only
        bs.use('/photos', exp.static('./photos')); //use for local testing only

        bs.use(errorHandler());
        bs.use(logger('dev'));

        console.log('BS: configuring security middleware...');
        bs.use(scmPassportObject.initialize());
        bs.use(scmPassportObject.session());
        console.log('BS: configuring user requests logger middleware...');

        bs.use(olmRequestLoggerFunction());

        bs.use('/home', oHomeRouter);
        console.log('BS: configuring user acl middleware...');
        bs.use(scmCheckUserFunction());

        console.log('BS: configuring REST endpoints request handles middleware...');
        //REST API Interface
        //Business functions expose from here

        bs.use('/workspace/notifications', oUserNotificationRouter);
        bs.use('/workspace/users', oUserRouter);
        bs.use('/workspace/profiles/v1',oProfileRouter);
        bs.use('/workspace/requests', oRequestRouter);
        bs.use('/workspace/standards', oStandardsRouter );
        bs.use('/workspace/photos', oPhotosRouter);
        bs.use('/workspace/inspection', oInspectionRouter);
        bs.use('/workspace/corrections',  oCorrectionsRouter );
        bs.use('/workspace/services', oServiceRouter);
        bs.use('/workspace/activities', oActivitiesRouter);
        bs.use('/workspace/responses',  oResponsesRouter);
        bs.use('/workspace/finance',  oFinanceRouter);
        bs.use('/workspace/interfaces',  oInterfacesRouter);
        bs.use('/workspace/interfaces',  oInterfacesRouter);
        bs.use('/workspace/operationslog', oOperationsLogRouter);
        bs.use('/workspace/photoservices',   oPhotoServiceRouter);

        bs.all('*', oHelpers.four_oh_four);

        var bsInstance =  bs.listen(bs.get('port'));

        console.log('BS: bs is fully configured ...');
        return Q({pl: {fn: bsInstance}, er: null});
    })
    .fail(function (r) {
        console.log('BS: starting bs failed with failure message: ' + r);
        return Q({pl: null, er: {ec: null, em: r}})
    });
}
catch(ex){
    console.log(ex);
}

};
