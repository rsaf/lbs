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
      console.log(m.pl.transaction);
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
  function _initRequestMessage(paramRequest,type,code,adminOrg){
        var col,mod='upm',
            message,url;
        if(type==='Response'){
            col='responses';
            url='/workspace/activities/application/';
            message="事务 response validation";
        }
        return {
            rdo: adminOrg
            ,rc: 'code'
            ,rt: message + '申请 ' + code
            ,rsu: paramRequest.user.lanzheng.loginName
            ,rso: paramRequest.user.currentOrganization
            ,rs: 10
            ,rb: 'message'
            ,rtr: type
            ,ei:[{
                col:col
                ,mod:mod
                ,ei:code
            }]
            ,url:url,
            "md" : {
                "uID" : "a1ed",
                "oID" : "200000000000000000000000"
            },
            "ct" : {
                "uID" : "a1ed",
                "oID" : "200000000000000000000000"
            }
        };
    }
  
  var fmmRouter = paramService.Router();

    var _confirmAlipay = function _confirmAlipay(params, response){
        var finalResult = null,
            responseInfo,
            transactionid = response.tid,
            refCode = response.rfc,
            reqPayload = {pl:{code:response.rc}},
            r = {},
            skipping = false,
            specialCases = [
                {ac:"LZB101",sv:"LZS101",fn:_handleSingleIdValidationResponse},
                {ac:"LZB102",sv:"LZS102",fn:_handlePhotoValidationResponse},
                {ac:"LZB103",sv:"LZS103",fn:_handleCorporateValidationResponse},
                {ac:"LZB104",sv:"LZS104",fn:_handleCorporateCreditPurchaseResponse}
            ];
        params.body = {json : JSON.stringify(reqPayload)};
        console.log("CONFIRMING ALIPAY with",response);

        var deferred = q.defer();
         q().then(function getResponse(){
                return esbMessage({
                    op:"bmm_getResponse",
                    pl:reqPayload.pl
                })
            })
            .then(function confirmAlipay(res){
                console.log("verifying",res);
                if(res.rs == 30)//already confirmed
                {
                    console.log("ALREADY VERIFIED");
                    deferred.resolve({ok:"SKIP", res:res});
                    skipping = true;
                }
                responseInfo = res;
                return esbMessage({
                    "ns":"fmm",
                    "op":"fmm_verifyAliPayment",
                    "pl": {
                        transactionId : res.rc
                    }
                })
            })
            //UPDATE RESPONSE STATUS TO PAID
            .then(function(msg){
                 if(skipping) return;
                console.log("persisting");
                return esbMessage({  //update the response and set payment status to 'paid'
                    op : "bmm_persistResponse",
                    pl:{
                        transactionid : transactionid,
                        loginName : params.user.lanzheng.loginName,
                        currentOrganization : params.user.currentOrganization,
                        response : {
                            _id : responseInfo._id,
                            rs:30,
                            sp:{
                                ps:'paid'
                            },
                            rfc:refCode
                        }
                    }
                });
            })
            //COMMIT TRANSACTION
            .then(function(msg){
                 if(skipping) return;
                console.log("committing",transactionid);
                r.pl = msg;
                return _commitTransaction({pl:{transactionid : transactionid}});
            })
            //SCHEDULE/ACTIVATE SERVICES
            .then(function() {
                 if(skipping) return;
                console.log("scheduling");
                ac_code = lib.digFor(responseInfo,"acn"),
                    sv_code = responseInfo && responseInfo.sb && responseInfo.sb[0] ? responseInfo.sb[0].serviceCode : undefined;
                isSpecial = -1;

                for(var i = 0; i < specialCases.length; i++)
                {
                    var tgt = specialCases[i];
                    if(!sv_code  || tgt.sv != sv_code) continue;
                    console.log("SV_CODE SV:",sv_code,responseInfo);
                    isSpecial = i;
                    break;
                }
                return _issueFirstOrderForResponse(params)
                    //RUN AUTOMATION IF SPECIAL
                    .then(function(r){
                        console.log("SPECIAL CASE?",isSpecial,specialCases[isSpecial]);
                        if(isSpecial >= 0)
                            return specialCases[isSpecial].fn(params, responseInfo, transactionid);
                        return r
                    })
                    //EXIT
                    .then(function success(r) {
                        return r;
                    }, function failure(err) {
                        console.log("FAILED WITH ERROR handling special case order", err);
                        throw err;
                    })
            })
            //SEND SMS/MAIL/NOTIFICATIONs & EXIT
            .then(function(z) {
                 if(skipping) return;
                finalResult = z;
                console.log("notifyin");
                return esbMessage({
                    ns: 'mdm',
                    vs: '1.0',
                    op: 'sendNotification',
                    pl: {
                        recipients: [{
                            inmail: {to: params.user.lanzheng.loginName},
                            weixin: {to: null},
                            sms: {to: reqPayload.pl.phone},
                            email: {to: null}
                        }]
                        , notification: {
                            subject: '您事务响应蓝正吗为',
                            notificationType: '事务通知',
                            from: '系统',
                            body: refCode
                        }
                    }
                })
            })
            //EXIT
            .then(function(smsResponse){
                 if(skipping) finalResult = responseInfo;
                console.log("Completed Payment Click. Final Result:",finalResult);
                //oHelpers.sendResponse(response,200,finalResult);
                deferred.resolve({ok: true, res: finalResult});
            })
            //FAIL
            .then(null,function reject(err){
                console.log("ERR",err);
                var code = 501;
                r.er={ec:10012,em:"Could not make payment"};
                //http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                if(err.er && err.er ==='Insufficient funds'){
                    r.er={ec:10011,em:err.er};
                    code = 403;
                }else{
                    console.log('rolling back',transactionid);
                    _rollBackTransaction({pl:{transactionid : transactionid}});
                }
                //oHelpers.sendResponse(response,code,r);
                deferred.reject({ok: false, err: r});
            });
        return deferred.promise;
    }
    fmmRouter.post('/confirmAlipay.json', function(paramRequest, paramResponse, paramNext){
        var finalResult = null,
            responseInfo,
            transactionid = paramRequest.body.pl.info.tid,
            refCode = paramRequest.body.pl.info.refCode,
            reqPayload = paramRequest.body.pl.info.reqPayload,
            r = {},
            specialCases = [
                {ac:"LZB101",sv:"LZS101",fn:_handleSingleIdValidationResponse},
                {ac:"LZB102",sv:"LZS102",fn:_handlePhotoValidationResponse},
                {ac:"LZB103",sv:"LZS103",fn:_handleCorporateValidationResponse},
                {ac:"LZB104",sv:"LZS104",fn:_handleCorporateCreditPurchaseResponse}
            ];
        paramRequest.body.json = JSON.stringify(paramRequest.body.pl.info.reqPayload);

        return q()
            .then(function getResponse(){
                return esbMessage({
                    op:"bmm_getResponse",
                    pl:reqPayload.pl
                })
            })
            .then(function confirmAlipay(res){
                responseInfo = res;
                console.log("responseInfo:",res);
                return esbMessage({
                    "ns":"fmm",
                    "op":"fmm_verifyAliPayment",
                    "pl": {
                        transactionId : paramRequest.body.pl.transactionId
                    }
                })
            })
            //UPDATE RESPONSE STATUS TO PAID
            .then(function(msg){
                return esbMessage({  //update the response and set payment status to 'paid'
                    op : "bmm_persistResponse",
                    pl:{
                        transactionid : transactionid,
                        loginName : paramRequest.user.lanzheng.loginName,
                        currentOrganization : paramRequest.user.currentOrganization,
                        response : {
                            _id : responseInfo._id,
                            rs:30,
                            sp:{
                                ps:'paid'
                            },
                            rfc:refCode
                        }
                    }
                });
            })
            //COMMIT TRANSACTION
            .then(function(msg){
                r.pl = msg;
                return _commitTransaction({pl:{transactionid : transactionid}});
            })
            //SCHEDULE/ACTIVATE SERVICES
            .then(function() {
                ac_code = lib.digFor(responseInfo,"acn"),
                    sv_code = responseInfo && responseInfo.sb && responseInfo.sb[0] ? responseInfo.sb[0].serviceCode : undefined;
                isSpecial = -1;

                for(var i = 0; i < specialCases.length; i++)
                {
                    var tgt = specialCases[i];
                    console.log("SV_CODE SV:",sv_code,responseInfo);
                    if(!sv_code  || tgt.sv != sv_code) continue;
                    isSpecial = i;
                    break;
                }
                return _issueFirstOrderForResponse(paramRequest)
                    //RUN AUTOMATION IF SPECIAL
                    .then(function(r){
                        console.log("SPECIAL CASE?",isSpecial,specialCases[isSpecial]);
                        if(isSpecial >= 0)
                            return specialCases[isSpecial].fn(paramRequest, responseInfo, transactionid);
                        return r
                    })
                    //EXIT
                    .then(function success(r) {
                        return r;
                    }, function failure(err) {
                        console.log("FAILED WITH ERROR handling special case order", err);
                        throw err;
                    })
            })
            //SEND SMS/MAIL/NOTIFICATIONs & EXIT
            .then(function(z) {
                finalResult = z;
                return esbMessage({
                    ns: 'mdm',
                    vs: '1.0',
                    op: 'sendNotification',
                    pl: {
                        recipients: [{
                            inmail: {to: paramRequest.user.lanzheng.loginName},
                            weixin: {to: null},
                            sms: {to: reqPayload.pl.phone},
                            email: {to: null}
                        }]
                        , notification: {
                            subject: '您事务响应蓝正吗为',
                            notificationType: '事务通知',
                            from: '系统',
                            body: refCode
                        }
                    }
                })
            })
            //EXIT
            .then(function(smsResponse){
                console.log("Completed Payment Click. Final Result:",finalResult);
                oHelpers.sendResponse(paramResponse,200,finalResult);
                return finalResult;
            })
            //FAIL
            .then(null,function reject(err){
                console.log("ERR",err);
                var code = 501;
                r.er={ec:10012,em:"Could not make payment"};
                //http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                if(err.er && err.er ==='Insufficient funds'){
                    r.er={ec:10011,em:err.er};
                    code = 403;
                }else{
                    console.log('rolling back',transactionid);
                    _rollBackTransaction({pl:{transactionid : transactionid}});
                }
                oHelpers.sendResponse(paramResponse,code,r);
                return r;
            })/*
            .then(function(response){
                var finalResult = response
                oHelpers.sendResponse(paramResponse,200,finalResult);
            },function reject(err){
                var code = 200;//todo 501;
                //r.er={ec:10012,em:"Invalid ALIPAY"};
                oHelpers.sendResponse(paramResponse,code,err);
            })*/
    })
    fmmRouter.get('/history.json', function(paramRequest, paramResponse, paramNext){
         /*
          * fmm_getTransactionHistory
          * Queries the transactionHistory table for all the transactions of a given accountId.
          * @param {type} m {filter (optional)}
          * @returns {Q@call;defer.promise} r[] {transactionId,transactionAmount,paymentOrderId,sourceAccountId,destinationAccountId,accountBalance}
          */

         var varAccountID  = null;
         if(paramRequest.user.userType==='admin'){
             //varAccountID = "F00001";

             varAccountID = 'admin';
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

    //,create_direct_pay_by_user_return_url: '/processes/activities/done'
    //,create_direct_pay_by_user_notify_url: '/workspace/finance/response'
    fmmRouter.get('/order/:code.json', function(paramRequest, paramResponse, paramNext){
        //Alipay will call us to validate user payment after success payment
        //'/workspace/finance/order/:code.json'
        //todo: Hit confirmAlipay code
        return esbMessage({
            "ns" : "bmm",
            "op" : "bmm_getResponse",
            "pl" : {
                code : paramRequest.params.code
            }
        })
        //Confirm with alipay and update/schedule/etc
        .then(function(res){
            return _confirmAlipay({
                user : paramRequest.user
            },res);
        })
        //Redirect user to done page
        .then(function(res){
            if(res.ok)
                return paramResponse.redirect(redirectUrl);
            else
                return paramResponse.redirect(failureURL);
            oHelpers.sendResponse(paramResponse,200,"ok");
        })
    });

    fmmRouter.get('/response/:code.json', function(paramRequest, paramResponse, paramNext){
        //Alipay will redirect users to this endpoint after successful payment
        ///workspace/finance/response/:code.json'
        //todo: Hit confirmAlipay code
        console.log("hit handler");
        var redirectUrl ='/#/processes/activities/done/' + paramRequest.params.code;
        var failureUrl = '/#/processes/activities/payment/'
        return esbMessage({
            "ns" : "bmm",
            "op" : "bmm_getResponse",
            "pl" : {
                code : paramRequest.params.code
            }
        })
        //Confirm with alipay and update/schedule/etc
        .then(function(res){
            return _confirmAlipay({
                user : paramRequest.user
            },res);
        })
        //Redirect user to done page
        .then(function(res){
            if(res.ok)
                return paramResponse.redirect(redirectUrl);
            else
                return paramResponse.redirect(failureURL);
        })
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
        var r = {er:null,pl:null},
            transactionid = false,
            responseInfo = null,
            reqPayload=false,
            finalResult = undefined,
            refCode = undefined,
            specialCases = [
                {ac:"LZB101",sv:"LZS101",fn:_handleSingleIdValidationResponse},
                {ac:"LZB102",sv:"LZS102",fn:_handlePhotoValidationResponse},
                {ac:"LZB103",sv:"LZS103",fn:_handleCorporateValidationResponse},
                {ac:"LZB104",sv:"LZS104",fn:_handleCorporateCreditPurchaseResponse}
            ];

        function collateOrders(response){
            var serviceBookings = response.sb,
                orders = [],
                i = serviceBookings.length,
                varAccountID = paramRequest.user.userType === 'admin'? 'admin' : paramRequest.user.lanzheng.loginName,
                customAmt = undefined;
            //special case for custom credit amounts
            if(response.acn == "LZB104")
                customAmt = Math.abs(parseFloat(response.fd.fields.amount));
            //create an order for each selected pricelist in this activity (service booking)
            while((i-=1)>-1){
                orders.push({
                    "transactionId" : response.rc,
                    "serviceId" : serviceBookings[i].plid,//serviceid is the pricelist id
                    "serviceType" : "ACTIVITY",
                    "serviceName" : serviceBookings[i].svn,
                    "serviceProviderId" : serviceBookings[i].spid,
                    //"agentId" : "not implemented",
                    "orderAmount" : customAmt || serviceBookings[i].sdp,
                    "platformCommissionAmount" : 0,//@todo: not implented
                    "agentCommissionAmount" : 0,//@todo: not implented
                    "corporationId" : serviceBookings[i].spc,//creator of the service point
                    "userAccountId" : varAccountID,// login name not the id
                    "paymentType" : "online",
                    "activityName" : response.can
                });
            }
            return orders;
        }

        function directPayment(orders){
          //update response sp and set payment status to paid
          return esbMessage({
              "ns":"fmm",
              "op": "fmm_makeDirectPayment",
              "pl": {orders : orders}
          });
        }

        function alipayPayment(orders){
            return esbMessage({
                "ns":"fmm",
                "op":"fmm_generateAlipayUrl",
                "pl": {orders : orders}
            })
        }

        return q()
            //FETCH RESPONSE & BEGIN TRANSACTION
            .then(function(){
              //get a transaction id from wmm
              reqPayload = JSON.parse(paramRequest.body.json);
              refCode = lib.generateResponseReferenceCode();
              return q.all([
                esbMessage({
                  op:"bmm_getResponse",
                  pl:reqPayload.pl
                }), //get the response details
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
            //STOW ASIDE HELPFUL INFO
            .then(function(msg) {
                responseInfo = msg[0];
                transactionid = msg[1].pl.transaction._id;
                return esbMessage({
                    "ns" : "bmm",
                    "op" : "bmm_persistResponse",
                    "pl" : {
                        transactionid: transactionid,
                        loginName: paramRequest.user.lanzheng.loginName,
                        currentOrganization: paramRequest.user.currentOrganization,
                        response : {
                            _id : responseInfo._id,
                            tid : transactionid
                        }
                    }
                })
                .then(function(res){
                        console.log("persist response ended",res);
                    return responseInfo.sp.pm;
                }  ,  function(err){
                        console.log("error?",err)
                    });

            })
            //MAKE PAYMENT
            .then(function(provider){
                console.log("PROVIDER:",provider);
                var paymentChain
                if(provider === "lz")
                {
                    console.log("LANZHENG PAYMENT");
                    return directPayment(collateOrders(responseInfo))
                        //UPDATE RESPONSE STATUS TO PAID
                        .then(function(msg){
                            return esbMessage({  //update the response and set payment status to 'paid'
                                op : "bmm_persistResponse",
                                pl:{
                                    transactionid : transactionid,
                                    loginName : paramRequest.user.lanzheng.loginName,
                                    currentOrganization : paramRequest.user.currentOrganization,
                                    response : {
                                        _id : responseInfo._id,
                                        rs:30,
                                        sp:{
                                            ps:'paid'
                                        },
                                        rfc:refCode
                                    }
                                }
                            });
                        })
                        //COMMIT TRANSACTION
                        .then(function(msg){
                            r.pl = msg;
                            return _commitTransaction({pl:{transactionid : transactionid}});
                        })
                        //SCHEDULE/ACTIVATE SERVICES
                        .then(function() {
                            ac_code = lib.digFor(responseInfo,"acn"),
                                sv_code = responseInfo && responseInfo.sb && responseInfo.sb[0] ? responseInfo.sb[0].serviceCode : undefined;
                            isSpecial = -1;

                            for(var i = 0; i < specialCases.length; i++)
                            {
                                var tgt = specialCases[i];
                                console.log("SV_CODE SV:",sv_code,responseInfo);
                                if(!sv_code  || tgt.sv != sv_code) continue;
                                isSpecial = i;
                                break;
                            }
                            return _issueFirstOrderForResponse(paramRequest)
                                //RUN AUTOMATION IF SPECIAL
                                .then(function(r){
                                    console.log("SPECIAL CASE?",isSpecial,specialCases[isSpecial]);
                                    if(isSpecial >= 0)
                                        return specialCases[isSpecial].fn(paramRequest, responseInfo, transactionid);
                                    return r
                                })
                                //EXIT
                                .then(function success(r) {
                                    return r;
                                }, function failure(err) {
                                    console.log("FAILED WITH ERROR handling special case order", err);
                                    throw err;
                                })
                        })
                        //SEND SMS/MAIL/NOTIFICATIONs & EXIT
                        .then(function(z) {
                            finalResult = z;
                            return esbMessage({
                                ns: 'mdm',
                                vs: '1.0',
                                op: 'sendNotification',
                                pl: {
                                    recipients: [{
                                        inmail: {to: paramRequest.user.lanzheng.loginName},
                                        weixin: {to: null},
                                        sms: {to: reqPayload.pl.phone},
                                        email: {to: null}
                                    }]
                                    , notification: {
                                        subject: '您事务响应蓝正吗为',
                                        notificationType: '事务通知',
                                        from: '系统',
                                        body: refCode
                                    }
                                }
                            })
                        })
                        //EXIT
                        .then(function(smsResponse){
                            console.log("Completed Payment Click. Final Result:",finalResult);
                            oHelpers.sendResponse(paramResponse,200,finalResult);
                        })
                        //FAIL
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
                        })
                }
                else if(provider === "ali")
                {
                    console.log("ALIPAY PAYMENT");
                    return alipayPayment(collateOrders(responseInfo))
                        //SEND OFF ALIPAY URL
                        .then(function(response){
                            var finalResult = response
                            response.tid = transactionid;
                            response.refCode = refCode;
                            response.reqPayload = reqPayload;
                            console.log("Sending out Alipay URL.", response);
                            oHelpers.sendResponse(paramResponse,200,finalResult);
                        })
                        //FAIL
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
                        })
                }
            })
  });

    function _issueFirstOrderForResponse(request){
        console.log('made it here',request.body);
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
            .then(function (){
                //TODO handle no-service case
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
    function _handleSingleIdValidationResponse(request,responseObj,transactionid){
        var ac_code = lib.digFor(responseObj,"acn"),
            sv_code = lib.digFor(responseObj,"sb.0.svn"),
            responseObjectToReturn;

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
            //Update response Status
            .then(function (r) {
                return esbMessage({
                    "ns": "bmm",
                    "op": "bmm_persistResponse",
                    "pl": {
                        transactionid: transactionid,
                        loginName: request.user.lanzheng.loginName,
                        currentOrganization: request.user.currentOrganization,
                        response: {
                            _id: responseObj._id,
                            rs: 45,
                            rfc: responseObj.rfc,
                            fd: r && r.pl ? {fields: {heyanjieguo: r.pl.LZBIZDESC}} : undefined
                        }
                    }
                })
            })
            //Fetch business record status
            .then(function (r) {
                responseObjectToReturn = r;
                return esbMessage({
                    "ns": "smm",
                    "op": "smm_fetchBusinessRecord",
                    "pl": {
                        ac_code: ac_code,
                        rc_code: responseObj.rc
                    }
                })
            })
            //Update business record status
            .then(function (r) {
                var myr = r;
                myr.st = 50;
                var mypl = {
                    query: {
                        "ac": ac_code,
                        "rc": responseObj.rc
                    },
                    response: myr,
                    transactionid: {
                        _id: transactionid
                    }
                };
                return esbMessage({
                    "ns": "smm",
                    "op": "smm_spawnBusinessRecord",
                    "pl": mypl
                })
            })
            //EXIT
            .then(function resolve(r){
                return responseObjectToReturn;
            }  ,  function failure(r){
                console.log("Unable to issue (special case) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
    }
    function _handlePhotoValidationResponse(request,responseObj, transactionid){
        var ac_code = lib.digFor(responseObj,"acn"),
            sv_code = lib.digFor(responseObj,"sb.0.svn"),
            responseObjectToReturn;

        return q()
            //Hit UPM to validate
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
            //Update response Status
            .then(function (r) {
                return esbMessage({
                    "ns": "bmm",
                    "op": "bmm_persistResponse",
                    "pl": {
                        transactionid: transactionid,
                        loginName: request.user.lanzheng.loginName,
                        currentOrganization: request.user.currentOrganization,
                        response: {
                            _id: responseObj._id,
                            rs: 45,
                            rfc: responseObj.rfc,
                            fd: r && r.pl ? {fields: {heyanjieguo: r.pl.LZBIZDESC}} : undefined
                        }
                    }
                })
            })
            //Fetch business record status
            .then(function (r) {
                responseObjectToReturn = r;
                return esbMessage({
                    "ns": "smm",
                    "op": "smm_fetchBusinessRecord",
                    "pl": {
                        ac_code: ac_code,
                        rc_code: responseObj.rc
                    }
                })
            })
            //Update business record status
            .then(function (r) {
                var myr = r;
                myr.st = 50;
                var mypl = {
                    query: {
                        "ac": ac_code,
                        "rc": responseObj.rc
                    },
                    response: myr,
                    transactionid: {
                        _id: transactionid
                    }
                };
                return esbMessage({
                    "ns": "smm",
                    "op": "smm_spawnBusinessRecord",
                    "pl": mypl
                })
            })
            //EXIT
            .then(function resolve(r){
                return responseObjectToReturn;
            }  ,  function failure(r){
                console.log("Unable to issue (special case) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
        /*
            //EXIT
            .then(function resolve(r){
                return r;
            }  ,  function failure(r){
                console.log("Unable to issue (special case) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });*/
    }
    function _handleCorporateValidationResponse(request,responseObj, transactionid){
        var responseObjectToReturn;

        return q()
            .then(function(){
                return esbMessage({op:'getOrganization',pl:{org:'lanzheng'}})
            })
            //Generate request
            .then(function(adminid){
                return esbMessage({
                    "ns":"rmm",
                    "op":"rmm_persistRequestMessage",
                    "pl": {request: _initRequestMessage(request,"Response",responseObj.rc,adminid.pl.oID)}
                });
            })
            //EXIT
            .then(function resolve(r){
                responseObjectToReturn = {pl:r,er:null};
                console.log("DID THE CORPORATE VALIDATION RESPONSE");
                return responseObjectToReturn;
            }  ,  function failure(r){
                console.log("Unable to issue (special case -> Corporate Validation) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
    }
    function _handleCorporateCreditPurchaseResponse(request,responseObj,transactionid){
        var responseObjectToReturn;

        function collateOrders(response){
            var serviceBookings = response.sb,
                orders = [],
                varAccountID = request.user.userType === 'admin'? 'admin' : request.user.lanzheng.loginName,
                orderAmount = Math.abs(parseFloat(responseObj.fd.fields.amount));
            //create an order for each selected pricelist in this activity (service booking)
                orders.push({
                    "transactionId" : response.rc,
                    "serviceId" : serviceBookings[0].plid,//serviceid is the pricelist id
                    "serviceType" : "ACTIVITY",
                    "serviceName" : serviceBookings[0].svn,
                    "serviceProviderId" : serviceBookings[0].spid,
                    //"agentId" : "not implemented",
                    "orderAmount" : -orderAmount,
                    "platformCommissionAmount" : 0,//@todo: not implented
                    "agentCommissionAmount" : 0,//@todo: not implented
                    "corporationId" : serviceBookings[0].spc,//creator of the service point
                    "userAccountId" : varAccountID,// login name not the id
                    "paymentType" : "online",
                    "activityName" : response.can
                });
            return orders;
        }

        return q()
            //Add Money
            .then(function(adminid){
                console.log("trying to make direct payment");
                return esbMessage({
                    "ns":"fmm",
                    "op":"fmm_makeDirectPayment",
                    "pl": {orders : collateOrders(responseObj)}
                });
            })
            //EXIT
            .then(function resolve(r){
                responseObjectToReturn = {pl:r,er:null};
                return responseObjectToReturn;
            }  ,  function failure(r){
                console.log("Unable to issue (special case -> Corporate Validation) order (rolling back):",r);
                return _rollBackTransaction({pl:{transactionid : transactionid.pl.transaction._id}});
            });
    }
    return fmmRouter;
};
