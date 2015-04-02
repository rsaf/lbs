/**
 * endpoints for /workspace/finance
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');
var q = require('q');

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
         esbMessage(m)
             .then(function(r) {
                 oHelpers.sendResponse(paramResponse, 200,r);
             })
             .fail(function(rv) {
                 var r = {pl:null, er:{ec:404,em:"could not get user balance"}};
                 oHelpers.sendResponse(paramResponse,404,r);
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
        esbMessage(m)
            .then(function(r) {
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
        r = {er:null,pl:null},
        reqPayload=false;
    q().then(function(){
      //get a transaction id from wmm
      reqPayload = JSON.parse(paramRequest.body.json);
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
      return q.all([
        m,//parameters to save orders and insert payment records
        esbMessage({  //update the response and set payment status to 'paid'
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
              }
            }
          }
        })
      ]);
    })
    .then(function(msg){
      //create orders and move money around, if this fails we can roll back the response
      return esbMessage(msg[0]);
    })
    .then(function(msg){
      r.pl = msg[0];
      return _commitTransaction({pl:{transactionid : transactionid}});
    })
    .then(function(){
      oHelpers.sendResponse(paramResponse,200,r);
    })
    .then(null,function reject(err){
      var code = 501;
      r.er={ec:10012,em:"Could not make payment"};
      //http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      if(err.er && err.er ==='Insufficient funds'){
        r.er={ec:10011,em:err};
        code = 403;
      }else{
        _rollBackTransaction({pl:{transactionid : transactionid}});
      }
      oHelpers.sendResponse(paramResponse,code,r);
    });
  });
  
  return fmmRouter;
};