var exp = require('express');
var bs = exp();
var logger = require('morgan');
var expressSession = require('express-session');
var redisStore = require('connect-redis')(expressSession);
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');
var cookieParser = require('cookie-parser');
var Q = require('q');

var oHomeRouter ;               // home
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

var scmPassportObject = null;
var olmRequestLoggerFunction = null;
var scmCheckUserFunction = null;
var esbMessageFunction = null;
var bsPort = null;
var redisClient = null;
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

    p4 = esbMessageFunction({
        op: 'dependency',
        ns:  'bs',
        pl: {dn:'redis'}
    });

    console.log('\nBS: getting BS dependencies ...');
    return Q.all([p0, p1, p2, p3,p4]).then(function (r) {

        //console.log(r);
        bsPort = r[0].pl.fn;
        scmPassportObject = r[1].pl.fn;
        olmRequestLoggerFunction = r[2].pl.fn;
        scmCheckUserFunction = r[3].pl.fn;
        redisClient = r[4].pl.fn;

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
        //bs.use(expressSession({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
        bs.use(cookieParser('uwotm8'));
        bs.use(expressSession(
            {
                secret: 'uwotm8',
                store: new redisStore({client: redisClient}),
                saveUninitialized: false, // don't create session until something stored,
                resave: false // don't save session if unmodified
            }
        ));

        bs.use(bodyParser.json());
        bs.use(bodyParser.urlencoded({extended: true}));

        bs.get('/favicon.ico', oOperationsLogRouter); // this is messing our logger
        bs.get('/', oHelpers.testStartPage); //use for local testing only
        bs.use(exp.static('./static')); //use for local testing only
        bs.use('/photos', exp.static('./photos')); //use for local testing only
        bs.use('/forms', exp.static('./forms')); //use for local testing only
        bs.use('/files', exp.static('./files')); //use for local testing only

        bs.use(errorHandler());
        bs.use(logger('dev'));

        console.log('BS: configuring security middleware...');
        bs.use(scmPassportObject.initialize());
        bs.use(scmPassportObject.session());
        console.log('BS: configuring user requests logger middleware...');

        bs.use(olmRequestLoggerFunction());

        bs.use('/home', oHomeRouter);  // home
        console.log('BS: configuring user acl middleware...');
        bs.use(scmCheckUserFunction());

        console.log('BS: configuring REST endpoints request handles middleware...');
        //REST API Interface
        //Business functions expose from here

        bs.use('/workspace/notifications', oUserNotificationRouter);  // workspace/notifications
        bs.use('/workspace/users', oUserRouter);                      // workspace/users
        bs.use('/workspace/profiles/v1',oProfileRouter);              // workspace/profile
        bs.use('/workspace/requests', oRequestRouter);                // workspace/requests
        bs.use('/workspace/standards', oStandardsRouter );            // workspace/standards
        bs.use('/workspace/photos', oPhotosRouter);                   // workspace/photos
        bs.use('/workspace/inspection', oInspectionRouter);           // workspace/inspection
        bs.use('/workspace/corrections',  oCorrectionsRouter );       // workspace/corrections
        bs.use('/workspace/services', oServiceRouter);                // workspace/services
        bs.use('/workspace/activities', oActivitiesRouter);           // workspace/activities
        bs.use('/workspace/responses',  oResponsesRouter);            // workspace/responses
        bs.use('/workspace/finance',  oFinanceRouter);                // workspace/finance
        bs.use('/workspace/interfaces',  oInterfacesRouter);          // workspace/interfaces
        bs.use('/workspace/operationslog', oOperationsLogRouter);     // workspace/operationslog
        bs.use('/workspace/photoservices',   oPhotoServiceRouter);    // workspace/photoservices

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
