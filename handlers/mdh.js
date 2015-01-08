/**
 * endpoints for /workspace/notifications
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage)
{
  var photosRouter = paramService.Router();
    photosRouter.get('/:notificationsType.json', function(paramRequest, paramResponse, paramNext){
        if (paramRequest.params.notificationsType === 'all'){
            oHelpers.sendResponse(paramResponse,200,all);
        }
        else if(paramRequest.params.notificationsType === 'unread'){
            oHelpers.sendResponse(paramResponse,200,unread);
        }
        else if(paramRequest.params.notificationsType === 'read'){
            oHelpers.sendResponse(paramResponse,200,read);
        }
  });

  return photosRouter;
};


var all = {
"pl":[{"title":"all data","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

var read = {
"pl":[{"title":"read data","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

var unread = {
  "pl":[{"title":"unread data","type":"业务通知","time":"2014-08-05 12:23:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]};

