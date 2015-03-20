
var Q = require('q');
var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage){
    var homeRouter = paramService.Router();

    homeRouter.get('/search/:keyword.json', function(paramRequest, paramResponse, paramNext){

       var keyword =  paramRequest.params.keyword;

        var promiseAD = esbMessage({
            "ns": "bmm",
            "op": "bmm_searchActivityDetail",
            "pl": {"keyword": keyword}
        });

        var promiseCD = esbMessage({
            "ns": "upm",
            "op": "upm_searchCorporateDetail",
            "pl": {"keyword": keyword}
        });


        Q.all([promiseAD, promiseCD]).then(function(r){
            var results = [];
            results.push(r[0].pl);
            results.push(r[1].pl);

            console.log('success return:', results);

            oHelpers.sendResponse(paramResponse, 200,results);

        }).fail(function(rv){

            var r = {pl:null, er:{ec:404,em:"search is temporary unavailable"}};

            oHelpers.sendResponse(paramResponse,404,r);

            console.log('failure return',rv);
        });

    });




    var userloginVerifier = null;
    var registerUzer = null;
    var sessionUser = null;
    var logoutUser = null;
    var createUser =  null;
    var APILoginVerifier =  null;

    var m1 = {
        "ns":'scm',
        "op": 'getVerifyUserLogin',
        "pl": null
    };
    var p1 = esbMessage(m1);
    var m2 = {
        "ns":'scm',
        "op": 'getRegisterUser',
        "pl": null
    };
    var p2 = esbMessage(m2);
    var m3 = {
        "ns":'scm',
        "op": 'getSessionUser',
        "pl": null
    };
    var p3= esbMessage(m3);
    var m4 = {
        "ns":'scm',
        "op": 'getLogoutUser',
        "pl": null
    };
    var p4 = esbMessage(m4);

    var m5 = {
        "ns":'scm',
        "op": 'getCreateUser',
        "pl": null
    };
    var p5 = esbMessage(m5);

    var m6 = {
        "ns":'scm',
        "op": 'getVerifyAPILogin',
        "pl": null
    };
    var p6 = esbMessage(m6);


    //console.log('\nsch: getting security dependencies ...');
    Q.all([p1, p2, p3, p4, p5, p6]).then(function (r) {

        //console.log(r);
        userloginVerifier = r[0].pl.fn;
        registerUzer = r[1].pl.fn;
        sessionUser = r[2].pl.fn;
        logoutUser = r[3].pl.fn;
        createUser =  r[4].pl.fn;
        APILoginVerifier =  r[5].pl.fn;

        homeRouter.post('/login.json', userloginVerifier());
        homeRouter.post('/registration.json', registerUzer());
        homeRouter.get('/user.json', sessionUser());
        homeRouter.get('/logout.json', logoutUser());
        homeRouter.post('/user.json', createUser());
        homeRouter.post('/apilogin.json', APILoginVerifier());

    })
     .fail(function(err) {
            console.log('error: ' + err);
     });

    return homeRouter;
};

