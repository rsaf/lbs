var q = require('q');
var oHelpers = require('../utilities/helpers.js');
var formidable = require('formidable');
var lib = require('lib');
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



    //home/user/recover/verification/:mobile.json
    homeRouter.post('/user/recover/verification/:mobile.json', function(paramRequest, paramResponse){


        var mobile = paramRequest.params.mobile;

        var code = lib.generateRandomValue();

        console.log(' sch send verification code--------------',mobile,code);




        var m = {
            "ns": "scm",
            "op": "scm_getUserByLoginInfo",
            "pl": {loginInfo:mobile}
        };





        esbMessage(m)
            .then(function (r) {
                console.log('verification code saved');


                if(r&&r.pl) {

                    var user = r.pl;

                    var m = {
                        ns: 'scm',
                        vs: '1.0',
                        op: 'scm_saveVerificationCode',
                        pl: {
                            code: code,
                            userInfo:user.lanzheng.loginName
                        }
                    };


                    esbMessage(m).then(function () {

                        var m = {
                            ns: 'mdm',
                            vs: '1.0',
                            op: 'sendNotification',
                            pl: {
                                recipients: [{
                                    inmail: {to: null},
                                    weixin: {to: null},
                                    sms: {to: user.lanzheng.mobile},
                                    email: {to: null}
                                }]
                                , notification: {}
                            }
                        };

                        m.pl.notification.subject = '蓝证验证码:';
                        m.pl.notification.notificationType = '事务通知';
                        m.pl.notification.from = '系统';
                        m.pl.notification.body = '您验证码是:' + code;


                        esbMessage(m)
                            .then(function (r) {

                                var r = {pl:{status:true}};


                                console.log('sch sent verification code-------', r);
                                oHelpers.sendResponse(paramResponse, 200, r);
                            })

                    })

                }
                else{

                    var r = {pl:{status:false}};


                    console.log('hh user not found by phone-------', r);
                    oHelpers.sendResponse(paramResponse, 200, r);
                }
            })
            .fail(function (r) {

                console.log('hh error-----',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });


    //home/user/verification/:mobile.json
    homeRouter.post('/user/recover/verification/code/:code.json', function(paramRequest, paramResponse){


        var code = paramRequest.params.code;
        var mobile = paramRequest.body.mobile;
        var userInfo = paramRequest.body.userInfo;
        var newPassword = paramRequest.body.newPassword

        console.log(' sch verify code--------------',code,mobile,userInfo,newPassword);

        var m = {
            ns: 'scm',
            vs: '1.0',
            op: 'scm_checkVerificationCodeAndSavePassword',
            pl: {
                code:code,
                mobile:mobile,
                userInfo:userInfo,
                newPassword:newPassword
            }
        };



        esbMessage(m)
            .then(function(r){

                console.log('hh verification code checked-------',r);
                oHelpers.sendResponse(paramResponse, 200, r);


            })
            .fail(function (r) {

                console.log('hh error-----',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });


    console.log('\nsch: getting security dependencies ...');
  var userloginVerifier = null;
  var registerUzer = null;
  var sessionUser = null;
  var logoutUser = null;
  var createUser = null;
  var APILoginVerifier = null;
  var organizationUsers = null;
  var registerAndAssociateUser = null;

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

  var m8 = {
    "ns": 'scm',
    "op": 'getRegisterWithCallback',
    "pl": null
  };
  var p8 = esbMessage(m8);

  q.all([p1, p2, p3, p4, p5, p6, p7, p8]).then(function (r) {


      //console.log(r);
      userloginVerifier = r[0].pl.fn;
      registerUzer = r[1].pl.fn;
      sessionUser = r[2].pl.fn;
      logoutUser = r[3].pl.fn;
      createUser = r[4].pl.fn;
      APILoginVerifier = r[5].pl.fn;
      organizationUsers = r[6].pl.fn;
      registerAndAssociateUser = r[7].pl.fn;

      homeRouter.post('/login.json', userloginVerifier());

      homeRouter.post('/registration.json',  function(paramRequest, paramResponse,paramNext) {
          return q().then(function () {
              console.log("creating user handler");
              return registerUzer()(paramRequest, paramResponse, paramNext)
          })
              .then(function (reqFromReg) {
                  paramRequest = reqFromReg;
                  var varAccountID = null;
                  if (paramRequest.user.userType === 'admin') {
                      //varAccountID = "F00001";
                      varAccountID = 'admin';
                  }
                  else {
                      varAccountID = paramRequest.user.lanzheng.loginName;
                  }
                  var m = {
                      "ns": "fmm",
                      "op": "fmm_getUserBalance",
                      "pl": {"accountId": varAccountID, "accountType": paramRequest.user.userType}
                  };
                  // console.log(m);
                  esbMessage(m)
                      .then(function (r) {
                          console.log('success return: ', r);
                      })
                      .fail(function (rv) {
                          console.log("fail return:", rv);
                      });
              });
      });
      //@todo: have this endpoint change owner ship of the response using
      //@todo: you can not pass the entire user object to front end
      //  a not yet created function in bmm to change ownership of response
      homeRouter.post('/registrationandassociate/:responseCode.json',  function(paramRequest, paramResponse){
        registerAndAssociateUser()(paramRequest, paramResponse, function(req,res,user){
          var code = paramRequest.params.responseCode;
          if(code && user)
          {
            esbMessage({
              "ns": 'bmm',
              "op": 'bmm_associate_response_with_user',
              "pl": {
                rc:code,
                user:user.pl,
                registerResponse:user
              }
            }).then(function resolve(r){
              //paramResponse.writeHead(200, {"Content-Type": "application/json"});
              //paramResponse.end(JSON.stringify(r.pl.registerResponse));
                oHelpers.sendResponse(paramResponse, 200, r.pl.registerResponse);

            }  ,  function fail(r){
              //paramResponse.writeHead(1005, {"Content-Type": "application/json"});
              //paramResponse.end(JSON.stringify(r.pl.registerResponse));
                oHelpers.sendResponse(paramResponse, 1005, r.pl.registerResponse);
            });
          }
          else
          {

          }
        });
      });
      homeRouter.post('/:activity_code/response.json', APILoginVerifier() ,function(paramRequest, paramResponse, paramNext) {
          var app_secret, app_id, ip;
          console.log('Endpoint hit with', paramRequest);

      });
      //@todo: have this endpoint change owner ship of the response using
      //  a not yet created function in bmm to change ownership of response
      homeRouter.post('/associateResponse/:responseCode.json',  function(paramRequest, paramResponse){
          var code = paramRequest.params.responseCode;
          console.log("Associate Resdponse user:",paramRequest.user);
          if(code && paramRequest.user)
          {

              var myUsr = {
                  status: true,
                  userType: paramRequest.user.userType,
                  loginName: paramRequest.user.lanzheng.loginName,
                  loginCount: paramRequest.user.lanzheng.loginCount
              };
              esbMessage({
                  "ns": 'bmm',
                  "op": 'bmm_associate_response_with_user',
                  "pl": {
                      rc:code,
                      user:myUsr,
                      registerResponse:myUsr
                  }
              }).then(function resolve(r){
                  //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                  //paramResponse.end(JSON.stringify(r.pl.registerResponse));
                  oHelpers.sendResponse(paramResponse, 200, r.pl.registerResponse);
              }  ,  function fail(r){
                  //paramResponse.writeHead(1005, {"Content-Type": "application/json"});
                  //paramResponse.end(JSON.stringify(r.pl.registerResponse));
                  oHelpers.sendResponse(paramResponse, 1005, r.pl.registerResponse);
              });
          }
          else{

          }
      });
      homeRouter.get('/user.json', sessionUser());
      homeRouter.get('/logout.json', logoutUser());
      homeRouter.post('/user.json', createUser());


      homeRouter.post('/apilogin.json', APILoginVerifier(),  function(paramRequest, paramResponse){
              // Show the upload form

              console.log('in done function ...');
              var m = {ns: 'dmm',op:'dmm_uploadPhoto', pl: null};
              m.pl = {
                  //uID:paramRequest.user.lanzheng.loginName,
                 // oID:paramRequest.user.currentOrganization,
                  photoData:null,
                  sgc:10,
                  stc:100,
                  pp:{ //other photos properties
                      ign:null, // 照片名称: image name                                      ===
                      igt:null, // 主题类型: 旅游照片 image type                              ===
                      igs:null, // 拍摄方式: 单板相机 image source                            ===
                      isl:null, // 拍摄地点:  image shooting location                        ===
                      rm:null,  // 照片描述: // 30 remarks 备注                               ===
                      isd:null, // 拍摄日期: // image shooting date                          ?
                      irs:null, // 像素尺寸:84mmX105mm image resolution size                  ?
                      ofs:null, // 文件大小:86Kb //28 original photo size 初始照片文件大小      ===
                      ifm:null  // 27 initial format 初始照片格式                              ===
                  },
                  uri: null // String to physical photo location // AC1279908_SCM15900655434_UC12996987669_OC_2079877898.jpg
              };
              var r = {pl: null, er: null};
              r.pl = {rs:false};


              var form = new formidable.IncomingForm();
              form.parse(paramRequest, function(err, fields, files) {
                  console.log(fields);
                  console.log(files);


                  var old_path = files.file.path,
                      file_size = files.file.size,
                      file_ext = files.file.name.split('.').pop(),
                      file_name =files.file.name;

                  console.log(fields);

                  fs.readFile(old_path, function(err, data) {
                      console.log(data);
                      m.pl.photoData= data;
                      //m.pl.pp.ifm = file_ext;
                      m.pl.pp.ofs = file_size;
                      m.pl.pp.ign = file_name;
                      //m.pl.pp.igt = fields['imgInfo[1][value]'];
                      //m.pl.pp.igs = fields['imgInfo[2][value]'];
                      //m.pl.pp.isl = fields['imgInfo[3][value]'];
                      //m.pl.pp.rm  = fields['imgInfo[4][value]'];
                      //m.pl.pp.isd = Date.now();
                      //m.pl.pp.irs = fields['imgInfo[6][value]'];

                      console.log(data);


                      if (data){
                          r.pl.rs = true;
                      }
                      else {
                          r.pl.rs = false
                      }
                      oHelpers.sendResponse(paramResponse, 200, r);

                      //    esbMessage(m)
                      //        .then(function (r) {
                      //            oHelpers.sendResponse(paramResponse, 200, r);
                      //        })
                      //        .fail(function (r) {
                      //            var r = {pl: null, er: {ec: 404, em: "could not save image"}};
                      //            oHelpers.sendResponse(paramResponse, 404, r);
                      //        });

                  });
              });

          });

      homeRouter.get('/act.json', function (paramRequest, paramResponse, paramNext) {
        var m = {};
        //formHtml
        q().then(function () {
          m.pl = {readyOnly:true};
          m.op = 'bmm_getActivities';
          m.mt={p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

          return esbMessage(m);
        }).then(function resolve(msg) {
          //paramResponse.writeHead(200, {"Content-Type": "application/json"});
          //paramResponse.end(JSON.stringify(msg));
            oHelpers.sendResponse(paramResponse, 200, msg);
        }, function reject(er) {
          //paramResponse.writeHead(501, {"Content-Type": "application/json"});
          //paramResponse.end(JSON.stringify(er));
            console.log("Error is",er);
            oHelpers.sendResponse(paramResponse, 501, er);

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
            svnid: priceList.serviceName._id,
            svn: priceList.serviceName.text,
            svp: priceList.servicePrices,
            sdp: priceList.discountedPrice,
            spn: priceList.servicePoint.servicePointName,
            spid: priceList.servicePoint._id,
            spc: priceList.servicePoint.ct.oID,
            serviceCode: priceList.service.serviceCode
          };
        })
        .then(null,function reject(err){
          console.log('having error:',err);
        });
      }
      function _persistRespose(req, res, pnext) {
          var m = {},
          transactionid = false,
          response = {},          //formHtml
          activity = {};
          q().then(function () {
              m.pl = JSON.parse(req.body.json).pl;
              // is user not set then use req.sessionID
              if (m.pl.response) {
                  delete m.pl.response.rs;
                  if (m.pl.response.sp && m.pl.response.sp.ps) {
                      delete m.pl.response.sp.ps;
                  }
              }
            if(m.pl.response && m.pl.response.sb){
              //get details for this pricelist
              return _getPriceList(m.pl.response);
            }
          })
          .then(function (priceList) {
            if(priceList) {
                //set the m.pl.response.sb with the priceList so the user cannot send fake data
                var activity = undefined;
                if (activity && activity.sqc && activity.sqc.length) {
                    priceList.sq = activity.sqc.reduce(function (agg, ele, idx) {
                        console.log("reducing");
                        if (agg == null && ele.sn == priceList.svnid)
                            return idx; //find first service index that matches the service name
                        return agg;
                    },null);
                }
                delete priceList.svnid;
                priceList.sq = m.pl.response.sb.sq;//todo I'm trusting the order here for sequence - should be from activity
                priceList.spm = m.pl.response.sb.spm
                console.log("SETTING SB TO",priceList);
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
          m.mt={p:paramRequest.body.p,ps:paramRequest.body.ps}
          return esbMessage(m);
        }).then(function (msg) {
          oHelpers.sendResponse(paramResponse, 200, msg);
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
          var usr = (req.user && req.user.lanzheng && req.user.lanzheng.loginName) || req.sessionID;
          var act = JSON.parse(req.body.json).pl.activityCode;
          console.log("WOOMOOFOO", act);
          esbMessage({
              "ns" : "bmm",
              "op" : "bmm_findUserResponse",
              "pl" : {
                  user : usr,
                  activity : act
              }
          }).then(function(msg){
              if(msg){
                  msg = {pl: msg}
                oHelpers.sendResponse(res, 200, msg);
              }
              else {
                  _persistRespose(req, res, pnext);
              }
          }  ,  function failure(err){
              oHelpers.sendResponse(res, 501, err);
          })
      });
      homeRouter.put('/response.json', function (req, res, pnext) {

        console.log('response update-----');

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
            //paramResponse.writeHead(200, {"Content-Type": "application/json"});
            //paramResponse.end(JSON.stringify(r));
            oHelpers.sendResponse(paramResponse, 200, r);
          })
          .fail(function (r) {
            //paramResponse.writeHead(501, {"Content-Type": "application/json"});
            if (r.er && r.er.ec && r.er.ec > 1000) {
              r.er.em = 'Server poblem....';
            }
            //paramResponse.end(JSON.stringify(r));
           oHelpers.sendResponse(paramResponse, 501, r);
          });
      });
      homeRouter.post('/uploadphoto.json', function(paramRequest, paramResponse){

        console.log('uploading image from response form--------');

        q()
        .then(function(){
          var form = new formidable.IncomingForm();
          form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
            file_ext = files.file.name.split('.').pop();
            var json = JSON.parse(fields.json);
            console.log('json-----',json);

            fs.readFile(old_path, function(err, data) {
              var m = {
                ns: 'pmm',
                op:"pmm_uploadPhoto",
                pl:{pp:{}}
              };

              m.pl.photoData= data;
              m.pl.ifm = file_ext;
              m.pl.ac = json.ac;
              m.pl.rc = json.rc;
              m.pl.ow = json.ow;
              m.pl.can = json.can;
              m.pl.cat = json.cat;
              m.pl.tpp = json.tpp;   



              esbMessage(m)
              .then(function(r) {


                      console.log('image uploaded from response++++++++++++++>>>>',r);

                      var tempImage = '/commons/images/IDPhotoSubmitedDemo.png';
                      var uri_swap = r.pl.uri;
                      r.pl.uri = tempImage;
                      r.status = true;

                    oHelpers.sendResponse(paramResponse,200,r);
/*

                      var m= {
                          ns: 'pmm',
                          op:"pmm_SubmitPhotoToInspection",
                          pl: r.pl
                          }
                      m.pl.uri = uri_swap;

                      esbMessage(m)
                          .then(function(r) {


                              console.log('sumited to inspection r= ',r);
                            //we do not need to send this response back to client browser... Response have already been sent..
                            //oHelpers.sendResponse(paramResponse,200,r);
                          })
                          .fail(null,function reject(r) {
                            console.log('hh error:Unable to submit photo to inspection-----',r);
                            r = {pl:null, er:{ec:100012,em:"Unable to submit photo to inspection----"}};
                            //oHelpers.sendResponse(paramResponse,501,r);
                            //we do not need to send this response back to client browser... Response have already been sent..
                          });
*/

                })
                .fail(null,function reject(r) {
                    console.log('hh error:Unable to upload photo-----',r);
                    r = {pl:null, er:{ec:100012,em:"Unable to upload photo."}};
                    oHelpers.sendResponse(paramResponse,501,r);
              });
            });
          });
        });
      });
    })
    .fail(function (err) {
      console.log('error getting security dependencies..: ' + err);
    });

  return homeRouter;
};