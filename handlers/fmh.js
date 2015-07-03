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

  var workflowManager = new lib.WorkflowManager({
    esbMessage: esbMessage,
    commitTransaction: _commitTransaction,
    rollbackTransaction: _rollBackTransaction}
  );

  var fmmRouter = paramService.Router();

    var _confirmAlipay = function _confirmAlipay(params, response){
        var finalResult = null,
            responseInfo,
            activityInfo,
            transactionid = response.tid,
            refCode = response.rfc,
            reqPayload = {pl:{code:response.rc}},
            r = {},
            skipping = false;
        params.body = {json : JSON.stringify(reqPayload)};
        console.log("Confirm Alipay beginning with:",params,response);
        var deferred = q.defer();
         q().then(function getResponse(){
                return esbMessage({
                    op:"bmm_getResponse",
                    pl:reqPayload.pl
                })
            })
            .then(function confirmAlipay(res){
                 console.log("verifying",res);
                if(res.rs >= 30)//already confirmed
                {
                    console.log("ALREADY VERIFIED");
                    deferred.resolve({ok:"SKIP", res:res});
                    skipping = true;
                    return;
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
             .then(function getActivity(){
                 return esbMessage({
                     "ns":"bmm",
                     "op":"bmm_getActivity",
                     "pl":{
                         code : responseInfo.acn
                     }})
             })
            .then(function doNotificationAccept(res){
                 activityInfo = res;
                return esbMessage({
                    "ns":"fmm",
                    "op":"fmm_alipayNotification",
                    "pl":{
                        transactionId : responseInfo.rc,
                        accountId : responseInfo.ow.uid,
                        notifyId : responseInfo.rc //TODO notify_id???
                    }
                })
            })
            .then(function doLZPayment(res){
                if(responseInfo.acn === "LZB104"){console.log("bailing on LZ payment for LZB104"); return;}
                return esbMessage({
                    "ns":"fmm",
                    "op": "fmm_makeDirectPayment",
                    "pl": {orders : collateOrders(responseInfo,activityInfo, params.user,'ACTIVITY')}
                });
            })
            //UPDATE RESPONSE STATUS TO PAID
            .then(function(msg){
                 if(skipping) return;
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
                r.pl = msg;
                return _commitTransaction({pl:{transactionid : transactionid}});
            })
            //SCHEDULE/ACTIVATE SERVICES
            .then(function() {
                if(skipping) return;

                if(activityInfo.abd.ac != "LZB101" && activityInfo.abd.ac != "LZB102")
                    deferred.resolve({ok: true, res: finalResult});
                return workflowManager.scheduleService(responseInfo.rc,{}, params.user)
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
                return esbMessage({
                    ns: 'mdm',
                    vs: '1.0',
                    op: 'sendNotification',
                    pl: {
                        recipients: [{
                            inmail: {to: params.user.lanzheng.loginName},
                            weixin: {to: null},
                            sms: {to: responseInfo.phone},
                            email: {to: null}
                        }]
                        , notification: {
                            subject: '您事务响应蓝证吗为',
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
             "pl": {"accountId": varAccountID},
             "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

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
        console.log(paramRequest.query);
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
        var failureUrl = '/#/processes/activities/payment/';
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
        }, function(err){
                console.log("FOOOO");
                return paramResponse.redirect(redirectUrl);
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
            "pl": {"accountId": varAccountID, "accountType":paramRequest.user.userType},
            "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

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

    fmmRouter.post('/setServicePointPriceInResponse.json', function(paramRequest, paramResponse, paramNext){
        var rc = paramRequest.body.rc,
            idx = paramRequest.body.idx;

        return esbMessage({
            "ns":"bmm",
            "op":"bmm_getResponse",
            "pl":{
                code : rc
            }
        })
        .then(function(response) {
            var amount = parseFloat(response.fd.fields.amount);
            console.log("GET RESPONSE IN SP SVP SET IS:",response);
            response.sb[0].svp = response.sb[0].sdp = amount;
            response.sb = response.sb[0];

            return esbMessage({
                "ns": "bmm",
                "op": "bmm_persistResponse",
                "pl": {
                    loginName: paramRequest.user.lanzheng.loginName,
                    currentOrganization: paramRequest.user.currentOrganization,
                    response: response
                }
            })
        })
        .then(function(r) {
            // console.log('success return: ', r);
            oHelpers.sendResponse(paramResponse, 200,r);
        })
        .fail(function(rv) {
            var r = {pl:null, er:{ec:404,em:"could not change service point price"}};
            oHelpers.sendResponse(paramResponse,404,r);
        });
    })
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
            activityInfo = null,
            reqPayload=false,
            finalResult = undefined,
            refCode = undefined;

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
                console.log("persisting on payment click",transactionid);
                var ow = responseInfo.ow;
                ow.sc = reqPayload.pl.phone;
                console.log("DING UP OW:",ow.sc);
                return esbMessage({
                    "ns" : "bmm",
                    "op" : "bmm_persistResponse",
                    "pl" : {
                        transactionid: transactionid,
                        loginName: paramRequest.user.lanzheng.loginName,
                        currentOrganization: paramRequest.user.currentOrganization,
                        response : {
                            _id : responseInfo._id,
                            tid : transactionid,
                            lk : true,
                            ow : ow
                        }
                    }
                })
                .then(function (res){
                    return esbMessage({
                        "ns":"bmm",
                        "op":"bmm_getActivity",
                        "pl":{
                            code : responseInfo.acn
                        }
                    }).then(function(act){
                        activityInfo = act;
                        return res;
                    })
                })
                .then(function(res){
                        console.log("persist response ended",responseInfo,responseInfo.sp.pm);
                        if(activityInfo.abd && activityInfo.abd.apm == '响应用户付款')//prepaid, don't send user to alipay!
                            return 'lz';
                    return responseInfo.sp.pm;
                }  ,  function(err){
                        console.log("error?",err)
                    });

            })
            //MAKE PAYMENT
            .then(function(provider){
                var paymentChain;
                var orders = collateOrders(responseInfo, activityInfo, paramRequest.user,provider==="ali"?'CREDIT_PURCHASE':"ACTIVITY");
                var sum = orders.reduce(function(sum, ele){console.log("ELE:",ele);return sum + ele.orderAmount},0);
                console.log("SUM IS",sum);
                if(provider === "ali" && sum > 0)
                {
                    console.log("ALIPAY PAYMENT");
                    //condense orders into a single 'buy'
                    var condensedOrder = orders.reduce(function(agg, ele, idx){
                        if(idx == 0) return ele;
                        agg.offlineAmount += ele.offlineAmount;
                        agg.orderAmount += ele.orderAmount;
                        agg.platformCommissionAmount += ele.platformCommissionAmount;
                        agg.agentCommissionAmount += ele.agentCommissionAmount;
                        return agg;
                    },{})
                    orders = [condensedOrder];
                    return alipayPayment(orders)
                        //SEND OFF ALIPAY URL
                        .then(function(response){
                            var finalResult = response;
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
                else// (provider === "lz")
                {
                    console.log("LANZHENG PAYMENT");
                    return directPayment(orders)
                        //UPDATE RESPONSE STATUS TO PAID
                        .then(function(msg){
                            return esbMessage({  //update the response and set payment status to 'paid'
                                op : "bmm_persistResponse",
                                pl : {
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
                            if(responseInfo.acn != "LZB101" && responseInfo.acn != "LZB102")
                            {
                                oHelpers.sendResponse(paramResponse, 200, {pl:{ow:{sc:reqPayload.pl.phone},can:responseInfo.can},er:null});
                            }
                            return workflowManager.scheduleService(responseInfo.rc,{}, paramRequest.user);
                        })
                        //Update ResponseInfo
                        .then(function(z){
                            return esbMessage({
                                op:"bmm_getResponse",
                                pl:reqPayload.pl
                            }).then(function(r){
                                responseInfo = r;
                                return z;
                            })
                        })
                        //SEND SMS/MAIL/NOTIFICATIONs & EXIT
                        .then(function(z) {
                            finalResult = z.pl;
                            finalResult.pl = {ow : {sc : reqPayload.pl.phone},can:responseInfo.can,fd: responseInfo.fd,acn:responseInfo.acn};
                            console.log("SENDING SMS (LZ)",reqPayload);
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
                                        subject: '您事务响应蓝证吗为',
                                        notificationType: '事务通知',
                                        from: '系统',
                                        body: refCode
                                    }
                                }
                            })
                        })
                        //EXIT
                        .then(function(smsResponse){
                            if(responseInfo.acn == "LZB101" || responseInfo.acn == "LZB102")
                            {
                                console.log("SENDING WITH 200 for 101/102:",finalResult);
                                oHelpers.sendResponse(paramResponse,200,finalResult);
                            }
                        })
                        //FAIL
                        .then(null,function reject(err){
                            var code = 501;
                            console.log("REjEcTeD with ",err);
                            r.pl={ow:{sc:reqPayload.pl.phone}}
                            r.er={ec:10012,em:err?err:"Could not make payment"};
                            //http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                            if(err.er && err.er ==='Insufficient funds'){
                                r.er={ec:10011,em:err.er};
                                code = 403;
                            }
                            else if(err.er && err.er === 'Order already exists for message: [object Object]') {
                                console.log("ROLLING BACK: order already existed");
                                code = 200;
                                r = {pl:"ORDER ALREADY RECIEVED : Error 10012"};
                            }
                            oHelpers.sendResponse(paramResponse,code,r);

                            if(err.er && err.er !== 'Insufficient funds')
                                _rollBackTransaction({pl:{transactionid : transactionid}});
                        })
                }
            })
  });

    function collateOrders(response, activity, user, type){
        var serviceBookings = response.sb,
            orders = [],
            i = serviceBookings.length,
            varAccountID,
            customAmt = undefined;
        //special case for custom credit amounts
        if(response.acn == "LZB104")
            customAmt = Math.abs(parseFloat(response.fd.fields.amount));
        if(activity.abd.apm == "预付款统一结算")//prepaid
        {
            console.log("USING PREPAID",activity.ct);
            varAccountID = activity.ct.uID;
        }
        else if(activity.abd.apm == "后付款统一结算")//postpaid
        {
            console.log("USING POSTPAID");
            varAccountID = activity.ct.uID;
        }
        else //charge the user
        {
            console.log("USER PAYS");
            varAccountID = user.userType === 'admin'? 'admin' : user.lanzheng.loginName;
        }
        //create an order for each selected pricelist in this activity (service booking)
        while((i-=1)>-1){
            var owedAmount;
            if(activity.abd.apm == "后付款统一结算" || serviceBookings[i].spm == 2)//offline or postpaid
            {
                console.log(activity.abd.apm == "后付款统一结算" ? "POSTPAID NEVERPAY" : "OFFLINE PAY")
                owedAmount = 0;
            }
            else {
                console.log("ONLINE PAY")
                owedAmount = customAmt || serviceBookings[i].sdp;
            }
            orders.push({
                "transactionId" : response.rc,
                "serviceId" : serviceBookings[i].plid,//serviceid is the pricelist id
                "serviceType" : type,
                "serviceName" : type == "CREDIT_PURCHASE" ? "余额充值" : serviceBookings[i].svn,
                "serviceProviderId" : serviceBookings[i].spid,
                //"agentId" : "not implemented",
                "offlineAmount": customAmt || serviceBookings[i].sdp || 0,
                "orderAmount" : owedAmount,
                "platformCommissionAmount" : 0,//@todo: not implented
                "agentCommissionAmount" : 0,//@todo: not implented
                "corporationId" : serviceBookings[i].spc,//creator of the service point
                "userAccountId" : varAccountID,// login name not the id
                "paymentType" : activity.abd.apm == "后付款统一结算" || serviceBookings[i].spm == 2 ? "offline" : "online",
                "activityName" : response.can
            });
        }
        return orders;
    }
    return fmmRouter;
};
