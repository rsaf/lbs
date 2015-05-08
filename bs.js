
module.exports.startBS = function(){

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
    var esb = require('esb');

    var oHomeRouter ;               // home
    var oSearchRouter ;               // home
    var oUserNotificationRouter;    // workspace/notifications  ==>  mdh.js  mdm
    var oUserRouter;                // workspace/users          ==>  sch.js  scm ///
    var oProfileRouter;             // workspace/profile        ==>  uph.js  upm
    var oRequestRouter;             // workspace/requests       ==>  rmh.js  rmm
    var oStandardsRouter;           // workspace/standards      ==>  pmh.js  pmm
    var oPhotosRouter;              // workspace/photos         ==>  dmh.js  dmm
    var oInspectionRouter;          // workspace/inspection     ==>  pmh.js  pmm //
    var oCorrectionsRouter;         // workspace/corrections    ==>  pmh.js  pmm //
    var oServiceRouter ;            // workspace/services       ==>  smh.js  smm //
    var oActivitiesRouter;          // workspace/activities.old     ==>  bmh.js  bmm ///
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

    console.log('\nBS: Loading ESB ...');
    return esb.startESB().then(function(r){
    console.log('\nBS: ESB is fully loaded ...');
        esbMessageFunction = r.pl.fn;

        var p0 = esbMessageFunction({
            op: 'dependency',
            pl: {dn: 'bsport'}
        });

        var p1 = esbMessageFunction({
            ns: 'scm',
            op: 'getPassport'
        });

        var p2 = esbMessageFunction({
            ns: 'olm',
            op: 'getLogRequest'
        });

        var p3 = esbMessageFunction({
            ns: 'scm',
            op: 'getUserIsAuthorizedChecker'
        });

        var p4 = esbMessageFunction({
            op: 'dependency',
            ns:  'bs',
            pl: {dn:'redis'}
        });

        return Q.all([p0, p1, p2, p3,p4]).then(function (r) {
            console.log('\nBS: getting BS dependencies ...');
          //  console.log(r);

            bsPort = r[0].pl.fn;
            scmPassportObject = r[1].pl.fn;
            olmRequestLoggerFunction = r[2].pl.fn;
            scmCheckUserFunction = r[3].pl.fn;
            redisClient = r[4].pl.fn;

            oHomeRouter = require('./handlers/hh.js')(exp, esbMessageFunction);                // home
            oSearchRouter = require('./handlers/ish.js')(exp, esbMessageFunction);             // details/search
            oUserNotificationRouter = require('./handlers/mdh.js')(exp, esbMessageFunction);   // workspace/notifications
            oUserRouter = require('./handlers/sch.js')(exp, esbMessageFunction);               // workspace/users
            oProfileRouter = require('./handlers/uph.js')(exp, esbMessageFunction);            // workspace/profile
            oRequestRouter = require('./handlers/rmh.js')(exp, esbMessageFunction);            // workspace/requests
            oStandardsRouter =  require('./handlers/pmh.js')(exp, esbMessageFunction);         // workspace/standards
            oPhotosRouter= require('./handlers/dmh.js')(exp, esbMessageFunction);              // workspace/photos
            oInspectionRouter = require('./handlers/pmh.js')(exp, esbMessageFunction);         // workspace/inspection
            oCorrectionsRouter = require('./handlers/pmh.js')(exp, esbMessageFunction);        // workspace/corrections
            oServiceRouter = require('./handlers/smh.js')(exp, esbMessageFunction);            // workspace/services
            oActivitiesRouter = require('./handlers/bmh.js')(exp, esbMessageFunction);         // workspace/activities.old
            oResponsesRouter  =  require('./handlers/bmh.js')(exp, esbMessageFunction);        // workspace/responses
            oFinanceRouter = require('./handlers/fmh.js')(exp, esbMessageFunction);            // workspace/finance
            oInterfacesRouter = require('./handlers/sch.js')(exp, esbMessageFunction);         // workspace/interfaces
            oOperationsLogRouter = require('./handlers/olh.js')(exp, esbMessageFunction);      // workspace/operationslog

            oPhotoServiceRouter = require('./handlers/pmh.js')(exp, esbMessageFunction);       // workspace/photoservices

            console.log('BS: self configuring with injected dependencies ....');
            //bs.set('port', bsPort);
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
            //bs.use('/ecv', ); //use for local testing only


            bs.use(errorHandler());
            bs.use(logger('dev'));

            console.log('\nBS: configuring security middleware...');
            bs.use(scmPassportObject.initialize());
            bs.use(scmPassportObject.session());
            console.log('BS: configuring user requests logger middleware...');

            bs.use(olmRequestLoggerFunction());

            bs.use('/home', oHomeRouter);  // home
            console.log('BS: configuring user acl middleware...');
            bs.use('/details/search', oSearchRouter);                     // details/search

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
            bs.use('/workspace/blobs', oPhotosRouter);                    // workspace/blobs , newly added
            bs.use('/workspace/inspection', oInspectionRouter);           // workspace/inspection
            bs.use('/workspace/corrections',  oCorrectionsRouter );       // workspace/corrections
            bs.use('/workspace/services', oServiceRouter);                // workspace/services
            bs.use('/workspace/activities', oActivitiesRouter);           // workspace/activities.old
            bs.use('/workspace/responses',  oResponsesRouter);            // workspace/responses
            bs.use('/workspace/finance',  oFinanceRouter);                // workspace/finance
            bs.use('/workspace/interfaces',  oInterfacesRouter);          // workspace/interfaces
            bs.use('/workspace/operationslog', oOperationsLogRouter);     // workspace/operationslog
            bs.use('/workspace/photoservices',   oPhotoServiceRouter);    // workspace/photoservices

            //Run inits
            oActivitiesRouter._prepopulateSpecialCaseActivities();
            oServiceRouter._prepopulateSpecialCaseServices();

            bs.all('*', oHelpers.four_oh_four);

            //var bsInstance =  bs.listen(bs.get('port'));
            console.log('BS: bs is fully configured...');
            //return Q({pl: {fn: bsInstance}, er: null});

            return Q({pl: {fn: bs, pt: bsPort}, er: null});

        })
        .fail(function (r) {
                console.log('BS: configuring bs failed with failure message: ' + r);
                return Q({pl: null, er: {ec: null, em: r}})
         });

    }).fail(function(r){
        console.log('starting ESB failed with error message: ' + r )
        return Q({pl: null, er: {ec: null, em: r}})
    });

};
