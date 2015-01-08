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


var status = {};

var history = {};

