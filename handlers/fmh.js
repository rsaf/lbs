/**
 * endpoints for /workspace/finance
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');
var q = require('q');
var lib = require('lib');

module.exports = function(paramService, esbMessage)
{
  
  //these could be in the oHelpers
  function _commitTransaction(m){
    m.pl.transaction = {
      _id:m.pl.transactionid
    };
    m.op='commitTransaction';
    return esbMessage(m);
  }
  function _rollBackTransaction(m){
    return q()
    .then(function(){
        return q.all([
          esbMessage({op:'wmm_rollBackTransaction',pl:{transaction:{_id:m.pl.transactionid}}})
          ,esbMessage({op:'bmm_rollback',pl:{transactionid:m.pl.transactionid}})
        ]);
    })
    .then(function(){
      return q.resolve('ok');
    })
    .then(null,function reject(err){
      return q.reject('In bmh _rollBackTransaction:',err);
    });
  }
  
  
  var fmmRouter = paramService.Router();

     fmmRouter.get('/history.json', function(paramRequest, paramResponse, paramNext){
         /*
          * fmm_getTransactionHistory
          * Queries the transactionHistory table for all the transactions of a given accountId.
          * @param {type} m {filter (optional)}
          * @returns {Q@call;defer.promise} r[] {transactionId,transactionAmount,paymentOrderId,sourceAccountId,destinationAccountId,accountBalance}
          */

         var varAccountID  = null;
         if(paramRequest.user.userType==='admin'){
             varAccountID = "F00001";
         }
         else {
             varAccountID = paramRequest.user.lanzheng.loginName;
         }

         var m = {
             "ns":"fmm",
             "op": "fmm_getTransactionHistory",
             "pl": {"accountId": varAccountID}
         };
        // console.log(m);
         esbMessage(m)
             .then(function(r) {
                 //console.log('success return: ', r);
                 oHelpers.sendResponse(paramResponse, 200,r);
             })
             .fail(function(rv) {
                 var r = {pl:null, er:{ec:404,em:"could not get user balance"}};
                 oHelpers.sendResponse(paramResponse,404,r);
                 //console.log('failure return',rv.er);
             });
    });

    //fmm_getUserBalance
    //workspace/finance/balance.json
    fmmRouter.get('/balance.json', function(paramRequest, paramResponse, paramNext){
        //* @param {type} m {accountId(required), accountType(optional)}
        //* @returns {Q@call;defer.promise} r{pl:{accountId , accountBalance},er:error}
        //userType
        var varAccountID  = null;
        if(paramRequest.user.userType==='admin'){
            varAccountID = "F00001";
        }
        else {
            varAccountID = paramRequest.user.lanzheng.loginName;
        }
        var m = {
            "ns":"fmm",
            "op": "fmm_getUserBalance",
            "pl": {"accountId": varAccountID, "accountType":paramRequest.user.userType}
        };
       // console.log(m);
        esbMessage(m)
            .then(function(r) {
               // console.log('success return: ', r);
                oHelpers.sendResponse(paramResponse, 200,r);
            })
            .fail(function(rv) {
                var r = {pl:null, er:{ec:404,em:"could not get user balance"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });
    });

/*
 * Makes payment for a response and creates the order
 * use the response code (or id) to get the response (m.pl.responseCode or m.pl.responseid)
 * Creates an order for each selected service in the response
 * makes payment to account ?? for all the services
 */
  fmmRouter.post('/responsepayment.json', function(paramRequest, paramResponse, paramNext){
    var varAccountID  = null,
        m = {},
        transactionid = false,
        responseInfo = null,
        r = {er:null,pl:null},
        phone = undefined,
        reqPayload=false,
        refCode = undefined;
    q().then(function(){
      //get a transaction id from wmm
      reqPayload = JSON.parse(paramRequest.body.json);
        phone = reqPayload.pl.phone;
        refCode = lib.generateResponseReferenceCode();
      m.pl=reqPayload.pl;
      m.op='bmm_getResponse';
      return q.all([
        esbMessage(m), //get the response details
        esbMessage({  //and a transactionid
          op:"createTransaction",
          pl:{
            loginName : paramRequest.user.lanzheng.loginName,
            currentOrganization : paramRequest.user.currentOrganization,
            transaction:{
              description:'Pay for response'
              ,modules:['bmm']
            }
          }
        })
      ]);
    })
    .then(function(msg){
      responseInfo = msg[0];
      transactionid = msg[1].pl.transaction._id;
      var serviceBookings = msg[0].sb,
          orders = [],
          i = serviceBookings.length;
      if(paramRequest.user.userType==='admin'){
          varAccountID = "F00001";
      }
      else {
          varAccountID = paramRequest.user.lanzheng.loginName;
      }
      //create an order for each selected pricelist in this activity (service booking)
      while((i-=1)>-1){
        orders.push({
            "transactionId" : msg[0].rc,
            "serviceId" : serviceBookings[i].plid,//serviceid is the pricelist id
            "serviceType" : "ACTIVITY",
            "serviceName" : serviceBookings[i].svn,
            "serviceProviderId" : serviceBookings[i].spid,
            //"agentId" : "not implemented",
            "orderAmount" : serviceBookings[i].sdp,
            "platformCommissionAmount" : 0,//@todo: not implented
            "agentCommissionAmount" : 0,//@todo: not implented
            "corporationId" : serviceBookings[i].spc,//creator of the service point
            "userAccountId" : varAccountID,// login name not the id
            "paymentType" : "online"
          });
      }
      //update response sp and set payment status to paid
      m = {
          "ns":"fmm",
          "op": "fmm_makeDirectPayment",
          "pl": {orders : orders}
      };

      var m1 = {  //update the response and set payment status to 'paid'
          op : "bmm_persistResponse",
          pl:{
              transactionid : transactionid,
              loginName : paramRequest.user.lanzheng.loginName,
              currentOrganization : paramRequest.user.currentOrganization,
              response : {
                  _id : msg[0]._id,
                  rs:30,
                  sp:{
                      ps:'paid'
                  },
                  rfc:refCode
              }
          }
      };
            if(orders && orders.length == 0)
            {
                m = m1;
            }
            else m = esbMessage(m);
      return q.all([
        m,//parameters to save orders and insert payment records
        esbMessage(m1)
      ]);
    })
    .then(function(msg){
      //create orders and move money around, if this fails we can roll back the response
      return lib.digFor(msg,"0.op")?esbMessage(msg[0]):msg[0];
    })
    .then(function(msg){
      r.pl = msg[0];
      return _commitTransaction({pl:{transactionid : transactionid}});
    })
    .then(function() {
      return _issueOrders(responseInfo, paramRequest, transactionid);
    })
    .then(function(){
      var mail = paramRequest.user.lanzheng.loginName;
      _sendSMS(mail, phone, refCode);
      oHelpers.sendResponse(paramResponse,200,r);
    })
    .then(null,function reject(err){
      var code = 501;
      r.er={ec:10012,em:"Could not make payment"};
      //http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      if(err.er && err.er ==='Insufficient funds'){
        r.er={ec:10011,em:err.er};
        code = 403;
      }else{
        _rollBackTransaction({pl:{transactionid : transactionid}});
      }
      oHelpers.sendResponse(paramResponse,code,r);
    });
  });
    function _sendSMS(mail, phone, refCode){
        var m = {
            ns: 'mdm',
            vs: '1.0',
            op: 'sendNotification',
            pl: {
                recipients: [{
                    inmail: {to: mail},
                    weixin: {to: null},
                    sms: {to: phone},
                    email: {to: null}
                }]
                , notification: {}
            }
        };

        m.pl.notification.subject = '您事务响应蓝正吗为';
        m.pl.notification.notificationType = '事务通知';
        m.pl.notification.from = '系统';
        m.pl.notification.body = refCode;

        esbMessage(m)
            .then(function (r) {
                console.log("Sent sms... r = ",r);
            });
    }
    function _issueOrders(responseObj, request, transactionid){
        var specialCases = [
                {ac:"LZB101",sv:"LZS101",fn:_handleSingleIdValidationResponse},
                {ac:"LZB102",sv:"LZS101",fn:_handlePhotoValidationResponse}
            ],
            ac_code = lib.digFor(responseObj,"acn");
            sv_code = lib.digFor(responseObj,"sb.0.svn"),
            isSpecial = -1;

        for(var i = 0; i < specialCases.length; i++)
        {
            var tgt = specialCases[i];
            if(!ac_code || tgt.ac != ac_code /*|| !sv_code  || tgt.sv != sv_code*/) continue;
            isSpecial = i;
            break;
        }
        if(isSpecial >= 0)
            return _issueFirstOrderForResponse(request)
                .then(function(){
                    return specialCases[isSpecial].fn(request,responseObj,transactionid);
                })
                //Update response Status
                .then(function (r){
                    var mypl = {
                        transactionid : transactionid,
                            loginName : request.user.lanzheng.loginName,
                            currentOrganization : request.user.currentOrganization,
                            response : {
                                _id : responseObj._id,
                                rs:45,
                                rfc:responseObj.rfc,
                                fd:r && r.pl ? {fields:{heyanjieguo: r.pl.LZBIZDESC}} : undefined
                            }
                    };
                    return esbMessage({
                        "ns": "bmm",
                        "op": "bmm_persistResponse",
                        "pl": mypl
                    })
                })
                //Fetch business record status
                .then(function(r){
                    return esbMessage({
                        "ns":"smm",
                        "op":"smm_fetchBusinessRecord",
                        "pl":{
                            ac_code : ac_code,
                            rc_code : responseObj.rc
                        }
                    })
                })
                //Update business record status
                .then(function (r){
                    var myr = r;
                    myr.st = 50;
                    var mypl = {
                        query:{
                            "ac":ac_code,
                            "rc":responseObj.rc
                        },
                        response:myr,
                        transactionid:{
                            _id : transactionid
                        }
                    };
                    return esbMessage({
                        "ns":"smm",
                        "op":"smm_spawnBusinessRecord",
                        "pl":mypl
                    })
                })
                .then(function success(r){
                    console.log("SUCCESS with handling special case order",r);
                    return r;
                }  ,  function failure(err){
                    console.log("FAILED WITH ERROR handling special case order",err);
                    throw err;
                })
        else
            return _issueFirstOrderForResponse(request);
    }
    function _handleSingleIdValidationResponse(request,responseObj,transactionid){
        return q()
            //Hit UPM to validate
            .then(function(){
                return esbMessage({
                    ns:"upm",
                    op:"upm_validateUserInfo",
                    pl:{
                        "transactionid":transactionid,
                        "method":"validateID",
                        "sfz": responseObj.fd.fields["shenfenzhenghaoma"], //shenfenzheng or user national id number
                        "xm": responseObj.fd.fields["xingming"],  //xingming or user full name
                        "zz": ""   //zhengzhao or user id photo buffer //must be provided when executing the validatePhoto method.
                    }
                });
            })
            //Update Business Record on Success
            .then(function (r){
                //TODO: should I fork logic path if id validation returns 'incorrect'?
                if(r.pl && !r.er)
                {
                    console.log("INFO VALID");
                }
                else if(r.pl){
                    console.log("INFO INVALID:", r.pl.er);
                }
                return r;
            })
            //EXIT
            .then(function resolve(r){
                return r;
            }  ,  function failure(r){
                console.log("Unable to issue (special case) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
    }
    function _handlePhotoValidationResponse(request,responseObj, transactionid){
        return q()
            .then(function(){
                return esbMessage({
                    "transactionid" : transactionid,
                    ns:"upm",
                    op:"upm_validateUserInfo",
                    pl:{
                        "method":"validatePhoto",
                        "sfz": responseObj.fd.fields["shenfenzhenghaoma"],
                        "xm" : responseObj.fd.fields["xingming"],
                        "zz" : responseObj.pt[0].pp
                    }
                })
            })
            //EXIT
            .then(function resolve(r){
                return r;
            }  ,  function failure(r){
                console.log("Unable to issue (special case) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
    }
    function _issueFirstOrderForResponse(request){
        var ln = request.user.lanzheng.loginName,
            org = request.user.currentOrganization,
            json = JSON.parse(request.body.json),
            responseCode = json.pl.code,
            transactionid,
            dbEntity,
            jsonEntity,
            service,
            responseInfo;

        return q()
            //INIT TRANSACTION
            .then(function(){
                return esbMessage({  //and a transactionid
                    op:"createTransaction",
                    pl:{
                        loginName : ln,
                        currentOrganization : org,
                        transaction:{
                            description:'Notify service point of response intent'
                            ,modules:['bmm','smm']
                        }
                    }
                })
            })
            //FETCH RESPONSE STATUS FROM CODEs
            .then(function(tid){
                transactionid = tid;
                return esbMessage({
                    ns : "bmm",
                    op : "bmm_getResponse",
                    pl : {
                        code : responseCode,
                        loginName : ln,
                        currentOrganization : org,
                        transactionid : transactionid
                    }
                });
            })
            //FETCH SERVICE INFO
            .then(function(esbResponse) {
                responseInfo = esbResponse;
                if(responseInfo.sb.length <= 0) return false;//no service to issue
                return esbMessage({
                    ns : "smm",
                    op : "smm_getService",
                    pl : {
                        qid : responseInfo.sb[0].svid,
                        loginName : ln,
                        currentOrganization : org,
                        transactionid : transactionid
                    }
                })
            })
            //SPAWN BUSINESS RECORD
            .then(function(serviceResponse){
                if(!serviceResponse) return false;//no service to issue
                service = serviceResponse.pl;
                return esbMessage({
                    ns: "smm",
                    op: "smm_spawnBusinessRecord",
                    pl: {
                        response: {
                            acn:responseInfo.acn//activity code
                            ,rc:responseCode//response code
                            ,serviceCode:service.serviceCode// service code
                            ,svn:service.serviceName// service name code
                            ,st:20// status
                            ,uid:ln// user login account , customer who bought the service
                            ,usn:responseInfo.ow.uid// user name , customer who bought the service
                            ,svp:responseInfo.sb[0].svp//
                            ,service:service._id//{ type: paramMongoose.Schema.Types.ObjectId, ref: 'services',required:true }
                            ,oID:service.ct.oID
                        },
                        loginName: ln,
                        currentOrganization: org,
                        transactionid: transactionid
                    }
                })
            })
            //SET FIRST SERVICE TO 'ISSUED'
            .then(function(businessRec){
                if(lib.digFor(responseInfo,"sb.length") <= 0) return false;//no service
                responseInfo.sb[0].cvs = 20;
                responseInfo.sb = responseInfo.sb[0];
                return esbMessage({
                    "ns": "bmm",
                    "op": "bmm_persistResponse",
                    "pl": {
                        response: responseInfo,
                        loginName : ln,
                        currentOrganization : org
                    }
                })
            })
            //COMMIT TRANSACTION
            //TODO handle no-service case
            .then(function (){
                if(transactionid){
                    return _commitTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
                }
                return false;
            })
            //EXIT
            .then(function resolve(r){
                return r;
            }  ,  function failure(r){
                console.log("Unable to issue order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
    }
  return fmmRouter;
};
