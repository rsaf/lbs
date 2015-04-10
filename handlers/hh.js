var q = require('q');
var oHelpers = require('../utilities/helpers.js');
var formidable = require('formidable');
var fs = require('fs');

module.exports = function (paramService, esbMessage) {
  var homeRouter = paramService.Router();

  homeRouter.get('/search/:keyword.json', function (paramRequest, paramResponse, paramNext) {

    var keyword = paramRequest.params.keyword;

    var promiseAD = esbMessage({
      "ns": "bmm",
      "op": "bmm_searchActivityDetail",
      "pl": {
        "keyword": keyword
      }
    });

    var promiseCD = esbMessage({
      "ns": "upm",
      "op": "upm_searchCorporateDetail",
      "pl": {
        "keyword": keyword
      }
    });


    q.all([promiseAD, promiseCD]).then(function (r) {
      var results = [];
      results.push(r[0].pl);
      results.push(r[1].pl);

      console.log('success return:', results);

      oHelpers.sendResponse(paramResponse, 200, results);

    }).fail(function (rv) {

      var r = {
        pl: null,
        er: {
          ec: 404,
          em: "search is temporary unavailable"
        }
      };

      oHelpers.sendResponse(paramResponse, 404, r);

      console.log('failure return', rv);
    });

  });




  var userloginVerifier = null;
  var registerUzer = null;
  var sessionUser = null;
  var logoutUser = null;
  var createUser = null;
  var APILoginVerifier = null;
  var organizationUsers = null;

  var m1 = {
    "ns": 'scm',
    "op": 'getVerifyUserLogin',
    "pl": null
  };
  var p1 = esbMessage(m1);
  var m2 = {
    "ns": 'scm',
    "op": 'getRegisterUser',
    "pl": null
  };
  var p2 = esbMessage(m2);
  var m3 = {
    "ns": 'scm',
    "op": 'getSessionUser',
    "pl": null
  };
  var p3 = esbMessage(m3);
  var m4 = {
    "ns": 'scm',
    "op": 'getLogoutUser',
    "pl": null
  };
  var p4 = esbMessage(m4);

  var m5 = {
    "ns": 'scm',
    "op": 'getCreateUser',
    "pl": null
  };
  var p5 = esbMessage(m5);

  var m6 = {
    "ns": 'scm',
    "op": 'getVerifyAPILogin',
    "pl": null
  };
  var p6 = esbMessage(m6);


  var m7 = {
    "ns": 'scm',
    "op": 'getOrganizationUsers',
    "pl": null
  };
  var p7 = esbMessage(m7);


  //console.log('\nsch: getting security dependencies ...');
  q.all([p1, p2, p3, p4, p5, p6, p7]).then(function (r) {

      //console.log(r);
      userloginVerifier = r[0].pl.fn;
      registerUzer = r[1].pl.fn;
      sessionUser = r[2].pl.fn;
      logoutUser = r[3].pl.fn;
      createUser = r[4].pl.fn;
      APILoginVerifier = r[5].pl.fn;
      organizationUsers = r[6].pl.fn;

      homeRouter.post('/login.json', userloginVerifier());
      homeRouter.post('/registration.json',  registerUzer());
      //@todo: have this endpoint change owner ship of the response using
      //  a not yet created function in bmm to change ownership of response
      homeRouter.post('/registrationandaccociate.json',  registerUzer());
      homeRouter.get('/user.json', sessionUser());
      homeRouter.get('/logout.json', logoutUser());
      homeRouter.post('/user.json', createUser());
      homeRouter.post('/apilogin.json'/* jshint ignore:start */
                      , APILoginVerifier()
                      /* jshint ignore:end */);
      homeRouter.get('/act.json', function (paramRequest, paramResponse, paramNext) {
        var m = {};
        //formHtml
        q().then(function () {
          m.pl = {};
          m.op = 'bmm_getActivities';
          return esbMessage(m);
        }).then(function resolve(msg) {
          paramResponse.writeHead(200, {
            "Content-Type": "application/json"
          });
          paramResponse.end(JSON.stringify(msg));
        }, function reject(er) {
          paramResponse.writeHead(501, {
            "Content-Type": "application/json"
          });
          paramResponse.end(JSON.stringify(er));
        });
      });

      //response routes preventing the login popup
      function _getPriceList(response){
        return q()
        .then(function(){
        //get the response/activity so we can use the query
          return esbMessage({
              op:'bmm_getResponse'
              ,pl:{
                _id:response._id
              }
          });
        })
        .then(function(msg){
          //use the service query from the activity with the added uniqueplid to get
          //  the pricelist the user selected
          var query = msg.dp.ac.sqc;
          //add uniqueplid to the query and get the pricelist
          query.push({uniqueplid:response.sb.plid,sn:response.sb.snid});
          return esbMessage({
            op:'smm_queryServices'
            ,pl:{
              query:query
            }
          });
        })
        .then(function(msg){
          var priceList = msg.pl.results[0][0];
          //set the values to be used as service booking (values in pricelist are named different than values in service booking)
          return {
            plid: priceList._id,
            svid: priceList.service._id,
            svn: priceList.serviceName.text,
            svp: priceList.servicePrices,
            sdp: priceList.discountedPrice,
            spn: priceList.servicePoint.servicePointName,
            spid: priceList.servicePoint._id,
            spc: priceList.servicePoint.ct.oID
          };
        })
        .then(null,function reject(err){
          console.log('having error:',err);
        });
      }
      function _persistRespose(req, res, pnext) {
          var m = {},
          transactionid = false,
          response = {};          //formHtml
          q().then(function () {
            m.pl = JSON.parse(req.body.json).pl;
            // is user not set then use req.sessionID
            if(m.pl.response){
              delete m.pl.response.rs;
              if(m.pl.response.sp && m.pl.response.sp.ps){
                delete m.pl.response.sp.ps;
              }
            }
            if(m.pl.response&&m.pl.response.sb){
              //get details for this pricelist
              return _getPriceList(m.pl.response);
            }
          })
          .then(function (priceList) {
            if(priceList){
              //set the m.pl.response.sb with the priceList so the user cannot send fake data
              m.pl.response.sb=priceList;
            }
            m.pl.loginName = (req.user && req.user.lanzheng && req.user.lanzheng.loginName) || req.sessionID;
            m.pl.currentOrganization = (req.user && req.user.currentOrganization) || false;
            m.op = 'bmm_persistResponse';
            return esbMessage(m);
          })
          .then(
            function resolve(msg) {
              oHelpers.sendResponse(res, 200, msg);
            },
            function fail(er) {
              oHelpers.sendResponse(res, 501, er);
            }
          );
        }
        //gets a list of responses (based on login or session id)
      homeRouter.post('/responses.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
          pl: {}
        };
        //formHtml
        q().then(function () {
          m.pl.loginName = (paramRequest.user && paramRequest.user.lanzheng && paramRequest.user.lanzheng.loginName) || paramRequest.sessionID;
          m.pl.currentOrganization = (paramRequest.user && paramRequest.user.currentOrganization) || false;
          m.op = 'bmm_getResponses';
          return esbMessage(m);
        }).then(function (msg) {
          oHelpers.sendResponse(paramResponse, 200, {
            pl: msg
          });
        }).fail(function (er) {
          oHelpers.sendResponse(paramResponse, 501, er);
        });
      });
      homeRouter.get('/response.json', function (paramRequest, paramResponse, paramNext) {
        var m = {};
        //formHtml
        q().then(function () {
          m.pl = {
            code: paramRequest.query.code
          };
          m.pl._id = paramRequest.query._id;
          m.op = 'bmm_getResponse';
          return esbMessage(m);
        }).then(function (msg) {
          oHelpers.sendResponse(paramResponse, 200, {
            pl: msg
          });
        }).fail(function (er) {
          oHelpers.sendResponse(paramResponse, 501, er);
        });
      });
      homeRouter.post('/response.json', function (req, res, pnext) {
        _persistRespose(req, res, pnext);
      });
      homeRouter.put('/response.json', function (req, res, pnext) {
        _persistRespose(req, res, pnext);
      });
      //query for services used in a response, put here to prevent login popup
      homeRouter.post('/services.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
          "op": "smm_queryServices",
          "pl": {}
        };
        q().then(function () {
            m.pl = JSON.parse(paramRequest.body.json);
            return esbMessage(m);
          })
          .then(function (r) {
            paramResponse.writeHead(200, {
              "Content-Type": "application/json"
            });
            paramResponse.end(JSON.stringify(r));
          })
          .fail(function (r) {
            paramResponse.writeHead(501, {
              "Content-Type": "application/json"
            });
            if (r.er && r.er.ec && r.er.ec > 1000) {
              r.er.em = 'Server poblem....';
            }
            paramResponse.end(JSON.stringify(r));
          });
      });
      homeRouter.post('/uploadphoto.json', function(paramRequest, paramResponse){
        q()
        .then(function(){
          var form = new formidable.IncomingForm();
          form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
            file_ext = files.file.name.split('.').pop();
            fs.readFile(old_path, function(err, data) {
              var m = {op:"bmm_uploadPhoto",pl:{}};
              m.pl.photoData= data;
              m.pl.ifm = file_ext;
              esbMessage(m)
              .then(function(r) {
                  oHelpers.sendResponse(paramResponse,200,r);
              })
              .then(null,function reject(r) {
                  console.log('bmh error:-----',r);
                  r = {pl:null, er:{ec:100012,em:"Unable to upload photo."}};
                  oHelpers.sendResponse(paramResponse,501,r);
              });
            });
          });
        });
      });
    })
    .fail(function (err) {
      console.log('error: ' + err);
    });

  return homeRouter;
};