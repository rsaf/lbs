//All lanID specific business logics for the user notification module (message distribution module) are handle here

/*
 var m = {
 "ns":"olm",
 "op": "readOperationsLog",
 "pl": {"userAccountID": "value1", "opType":"value2", "pageNumber":"value3", "pageSize":"value4"}
 };

 var r = {
 "er":"value",
 "pl": "value",
 "mv": null
 }
 */

var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage)
{
  var userNotificationRouter = paramService.Router();

    userNotificationRouter.get('/:notificationType.json', function(paramRequest, paramResponse, paramNext){
    //console.log('get all json called  ');

        if (paramRequest.params.notificationType === 'all'){
            oHelpers.sendResponse(paramResponse,200,all);
        }
        else if(paramRequest.params.notificationType === 'read'){
            oHelpers.sendResponse(paramResponse,200,read);
        }

        else if(paramRequest.params.notificationType === 'unread'){
            oHelpers.sendResponse(paramResponse,200,unread);
        }

        /*
     var m = {
       "ns":"olm",
       "op": "readOperationsLog",
       "pl": {"userAccountID":paramRequest.user.id, "opType":null, "pageNumber":1, "pageSize":10}
     };

     esbMessage(m)
         .then(function(r) {
           paramResponse.writeHead(200, {"Content-Type": "application/json"});
           paramResponse.end(JSON.stringify(r));
         })
         .fail(function(r) {

         });
        */

  });

  return userNotificationRouter;
};


var all = {
    "pl":[{"title":"all data","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

var read = {
    "pl":[{"title":"read data","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

var unread ={"pl":[{"title":"unread data","type":"业务通知","time":"2014-08-05 12:23:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},{"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

