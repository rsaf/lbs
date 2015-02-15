/**
 * endpoints for /workspace/finance
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage)
{
  var photosRouter = paramService.Router();
    photosRouter.get('/:financeType.json', function(paramRequest, paramResponse, paramNext){
        if (paramRequest.params.financeType === 'status'){
            oHelpers.sendResponse(paramResponse,200,status);
        }
        else if(paramRequest.params.financeType === 'history'){
            oHelpers.sendResponse(paramResponse,200,history);
        }
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

