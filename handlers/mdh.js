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


//    /workspace/notifications/:notificationType.json
    userNotificationRouter.get('/:notificationType.json', function(paramRequest, paramResponse, paramNext){
    //console.log('get all json called  ');

        var m = {
            ns: 'mdm',
            vs: '1.0',
            op: 'getNotificationByTo',
            pl: {
                viewStatus: null, // null
                to: paramRequest.user.id,
                pageNumber: 1,
                pageSize: 10
            }
        };


        if (paramRequest.params.notificationType === 'all'){
            m.pl.viewStatus =null;
        }

        else if (paramRequest.params.notificationType === 'unread'){
            m.pl.viewStatus =false;
        }

        else if (paramRequest.params.notificationType === 'read'){
             m.pl.viewStatus =true;
        }

        else {

            var r = {pl:null, er:{ec:404,em:"invalid notification type!"}};
            oHelpers.sendResponse(paramResponse,404,r);
        }

        esbMessage(m)
         .then(function(r) {

           paramResponse.writeHead(200, {"Content-Type": "application/json"});
           paramResponse.end(JSON.stringify(r));
         })
         .fail(function(r) {

             console.log(r.er);
             var r = {pl:null, er:{ec:404,em:"could not find notification"}};
             oHelpers.sendResponse(paramResponse,404,r);
         });


  });

  return userNotificationRouter;
};


var all = {
    "pl":[{"title":"all data","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

var read = {
    "pl":[{"title":"read data","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

var unread ={"pl":[{"title":"unread data","type":"业务通知","time":"2014-08-05 12:23:16"},
    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
    {"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},
    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
};

