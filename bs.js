var exp = require('express');
var bs = exp();
var logger = require('morgan');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var oHelpers= require('./utilities/helpers.js');

var oHomeRouter ;
var oOperationsLogRouter ;
var oServiceRouter ;
var oPhotoServiceRouter ;
var oProfileRouter ;

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

        oHomeRouter = require('./handlers/hh.js')(exp, paramESBMessage);
        oOperationsLogRouter = require('./handlers/olh.js')(exp, paramESBMessage);
        oServiceRouter = require('./handlers/smh.js')(exp, paramESBMessage);
        oPhotoServiceRouter = require('./handlers/psh.js')(exp, paramESBMessage);
        oProfileRouter = require('./handlers/uph.js')(exp, paramESBMessage);

        console.log('BS: self configuring with injected dependencies ....');
        bs.set('port', bsPort);
        bs.use(expressSession({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
        bs.use(bodyParser.json());
        bs.use(bodyParser.urlencoded({extended: true}));

        bs.get('/favicon.ico', oOperationsLogRouter); // this is messing our logger
        bs.get('/', oHelpers.testStartPage); //use for local testing only
        bs.use(exp.static('./static')); //use for local testing only

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
        bs.use('/workspace/operationslog', oOperationsLogRouter);
        bs.use('/workspace/services', oServiceRouter);
        bs.use('/workspace/photoservices/v1',oPhotoServiceRouter);
        bs.use('/workspace/profiles/v1',oProfileRouter);

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
