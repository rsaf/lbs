/**
 * endpoints for /workspace/finance
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage)
{
  var photosRouter = paramService.Router();

     photosRouter.get('/history.json', function(paramRequest, paramResponse, paramNext){
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
         console.log(m);
         esbMessage(m)
             .then(function(r) {
                 console.log('success return: ', r);
                 oHelpers.sendResponse(paramResponse, 200,r);
             })
             .fail(function(rv) {
                 var r = {pl:null, er:{ec:404,em:"could not get user balance"}};
                 oHelpers.sendResponse(paramResponse,404,r);
                 console.log('failure return',rv.er);
             });
    });

    //fmm_getUserBalance
    //workspace/finance/balance.json
    photosRouter.get('/balance.json', function(paramRequest, paramResponse, paramNext){
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
        console.log(m);
        esbMessage(m)
            .then(function(r) {
                console.log('success return: ', r);
                oHelpers.sendResponse(paramResponse, 200,r);
            })
            .fail(function(rv) {
                var r = {pl:null, er:{ec:404,em:"could not get user balance"}};
                oHelpers.sendResponse(paramResponse,404,r);
                console.log('failure return',rv.er);
            });
    });

  return photosRouter;
};





var status = {
  "pl": [{
      "field1": "1300000000026",
      "field2": "-200.00",
      "field3": "800.00",
      "field4": "常用证件照拍摄",
      "field5": "2014-08-05 12：23：16"
    }, {
      "field1": "1300000000011",
      "field2": "-300.00",
      "field3": "500.00",
      "field4": "出入境证件照拍摄",
      "field5": "2014-08-05 12：29：00"
    }, {
      "field1": "1300000000033",
      "field2": "+500.00",
      "field3": "1000.00",
      "field4": "账户充值",
      "field5": "2014-08-06 13：35：16"
    }, {
      "field1": "1300000000027",
      "field2": "-300.00",
      "field3": "700.00",
      "field4": "团体证照补拍",
      "field5": "2014-08-06 13：35：17"
    }, {
      "field1": "1300000000044"
      ,
      "field2": "+500.00",
      "field3": "1200.00",
      "field4": "账户充值",
      "field5": "2014-08-09 15：36：16"
    }]
};

var history = {
  "pl": [{
      "field1": "1300000000044"
      ,
      "field2": "+500.00",
      "field3": "1200.00",
      "field4": "账户充值",
      "field5": "2014-08-09 15：36：16"
    }, {
      "field1": "1300000000011",
      "field2": "-300.00",
      "field3": "500.00",
      "field4": "出入境证件照拍摄",
      "field5": "2014-08-05 12：29：00"
    }, {
      "field1": "1300000000026",
      "field2": "-200.00",
      "field3": "800.00",
      "field4": "常用证件照拍摄",
      "field5": "2014-08-05 12：23：16"
    },{
      "field1": "1300000000033",
      "field2": "+500.00",
      "field3": "1000.00",
      "field4": "账户充值",
      "field5": "2014-08-06 13：35：16"
    }, {
      "field1": "1300000000027",
      "field2": "-300.00",
      "field3": "700.00",
      "field4": "团体证照补拍",
      "field5": "2014-08-06 13：35：17"
    }]
};

