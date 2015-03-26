
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
    var organizationUsers = null;

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


    var m7 = {
        "ns":'scm',
        "op": 'getOrganizationUsers',
        "pl": null
    };
    var p7 = esbMessage(m7);


    //console.log('\nsch: getting security dependencies ...');
    Q.all([p1, p2, p3, p4, p5, p6,p7]).then(function (r) {

        //console.log(r);
        userloginVerifier = r[0].pl.fn;
        registerUzer = r[1].pl.fn;
        sessionUser = r[2].pl.fn;
        logoutUser = r[3].pl.fn;
        createUser =  r[4].pl.fn;
        APILoginVerifier =  r[5].pl.fn;
        organizationUsers = r[6].pl.fn;

        homeRouter.post('/login.json', userloginVerifier());
        homeRouter.post('/registration.json', registerUzer());
        homeRouter.get('/user.json', sessionUser());
        homeRouter.get('/logout.json', logoutUser());
        homeRouter.post('/user.json', createUser());
        homeRouter.post('/apilogin.json', APILoginVerifier());
        homeRouter.get('/act.json', function(paramRequest, paramResponse, paramNext){
          var m = {};
          //formHtml
          Q().then(function(){
            m.pl={}
            m.op='bmm_getActivities';
            return esbMessage(m);
          }).then(function resolve(msg){
            paramResponse.writeHead(200, {"Content-Type": "application/json"});
            paramResponse.end(JSON.stringify(msg));
          },function reject(er){
            paramResponse.writeHead(501, {"Content-Type": "application/json"});
            paramResponse.end(JSON.stringify(er));
          });
        });
        
        //response routes preventing the login popup
        function _persistRespose(req, res,pnext){
    var m = {},transactionid=false,response={};
    //formHtml
    Q().then(function(){
      m.pl=JSON.parse(req.body.json).pl;
      //@todo: is user not set then use req.sessionID
      m.pl.loginName=(req.user&&req.user.lanzheng&&req.user.lanzheng.loginName)||req.sessionID;
      m.pl.currentOrganization=(req.user&&req.user.currentOrganization)||false;
      m.op='bmm_persistResponse';
      return esbMessage(m);
    })
    .then(
      function resolve(msg){
        oHelpers.sendResponse(res,200,msg); 
      },function fail(er){
        oHelpers.sendResponse(res,501,er);
      }
    );
  }
        //gets a list of responses (based on login or session id)
        homeRouter.post('/responses.json', function(paramRequest, paramResponse, paramNext){
          var m = {pl:{}};
          //formHtml
          Q().then(function(){
            m.pl.loginName=(paramRequest.user&&paramRequest.user.lanzheng&&paramRequest.user.lanzheng.loginName)||paramRequest.sessionID;
            m.pl.currentOrganization=(paramRequest.user&&paramRequest.user.currentOrganization)||false;
            m.op='bmm_getResponses';
            return esbMessage(m);
          }).then(function(msg){
            oHelpers.sendResponse(paramResponse,200,{pl:msg});
          }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);      
          });    
        });
        homeRouter.get('/response.json', function(paramRequest, paramResponse, paramNext){
          var m = {};
          //formHtml
          Q().then(function(){
            m.pl={code:paramRequest.query.code};
            m.pl._id=paramRequest.query._id;
            m.op='bmm_getResponse';
            return esbMessage(m);
          }).then(function(msg){
            oHelpers.sendResponse(paramResponse,200,{pl:msg});
          }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);      
          });    
        });
        homeRouter.post('/response.json',function(req,res,pnext){
          _persistRespose(req,res,pnext);
        });
        homeRouter.put('/response.json',function(req,res,pnext){
          _persistRespose(req,res,pnext);
        });
        //query for services used in a response, put here to prevent login popup
        homeRouter.post ('/services.json', function(paramRequest, paramResponse, paramNext){
          var m = {
            "op": "smm_queryServices",
            "pl": {}
          };
          Q().then(function(){
            m.pl=JSON.parse(paramRequest.body.json);
            return esbMessage(m);
          })
          .then(function(r) {
            paramResponse.writeHead(200, {"Content-Type": "application/json"});
            paramResponse.end(JSON.stringify(r));
          })
          .fail(function(r) {
            paramResponse.writeHead(501, {"Content-Type": "application/json"});
            if(r.er && r.er.ec && r.er.ec>1000){
              r.er.em='Server poblem....';
            }
            paramResponse.end(JSON.stringify(r));
          });
        });

    })
     .fail(function(err) {
            console.log('error: ' + err);
     });

    return homeRouter;
};

