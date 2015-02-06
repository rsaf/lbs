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


        var m = {
            ns: 'mdm',
            vs: '1.0',
            op: 'getNotificationByTo',
            pl: {
                viewStatus: null, // null
                to: paramRequest.user.lanzheng.loginName,
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

             var r = {pl:null, er:{ec:404,em:"could not find notification"}};
             oHelpers.sendResponse(paramResponse,404,r);
         });


  });


    //    /workspace/notifications/mailling/contacts.json
  userNotificationRouter.post('/mailling/contacts.json', function(paramRequest, paramResponse, paramNext){

        var m = {
            ns: 'mdm',
            vs: '1.0',
            op: 'validateUsersList',
            pl: paramRequest.body
        };



      console.log('paramRequest users-----------:', paramRequest.body);
      console.log('paramRequest users.users-----------:', paramRequest.body.users);

//      m.pl = {users: [{account:'leo@lbs.com', valid:false },
//              {account:'leo@ibm.com', valid:false },
//              {account:'leo@lbs.com', valid:false }]
//            };


        esbMessage(m)
            .then(function(r) {


                console.log('returned users value -------: ', JSON.stringify(r));
                console.log('returned users value.users -------: ', r.users);
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function(r) {

                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find notification"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });


    });





    ///workspace/notifications/mailling/notifications.json
    userNotificationRouter.post('/mailling/notifications.json', function(paramRequest, paramResponse, paramNext){


        var contactName = paramRequest.body.recipients[0].to;


        var m = {
            ns: 'mdm',
            vs: '1.0',
            op: 'sendNotification',
            pl: {
                recipients: [{
                    inmail: {to: '' + contactName},
                    weixin: {to: 'lionleo001'},
                    sms: {to: '15900755434'},
                    email: {to: 'rolland@lbsconsulting.com'}
                }],
                notification: paramRequest.body.notification
            }
        };


//        var m = {
//            ns: 'mdm',
//            vs: '1.0',
//            op: 'sendNotification',
//            pl: {
//                recipients:[{
//                    inmail:{to:''+contactName},
//                    weixin:{to:'lionleo001'},
//                    sms:{to:'15900755434'},
//                    email:{to:'rolland@lbsconsulting.com'}
//                }],
//                notification:{
//                    subject:'事务提交成功',
//                    body:'事务提交成功事务提交成功事务提交成功事务提交成功事务提交成功事务提交成功事务提交成功',
//                    notificationType:'业务通知'}
//            }
//        };

        esbMessage(m)
            .then(function(r) {

                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function(r) {

                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not send notification"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });


    });





    ///workspace/notifications/update/:viewstate.json
    userNotificationRouter.put('/update/:viewstate.json', function(paramRequest, paramResponse, paramNext){

        var m = {
    ns: 'mdm',
    vs: '1.0',
    op: 'updateViewStatus',
   pl:{
       messageID:paramRequest.body.messageID
      ,viewStatus:paramRequest.params.viewstate
   }
};



        esbMessage(m)
            .then(function(r) {

                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function(r) {

                var r = {pl:null, er:{ec:404,em:"could not update view state"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });


    });








    return userNotificationRouter;
};

//
//var all = {
//    "pl":[{"title":"all data","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
//};
//
//var read = {
//    "pl":[{"title":"read data","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:23:16"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//        {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
//};
//
//var unread ={"pl":[{"title":"unread data","type":"业务通知","time":"2014-08-05 12:23:16"},
//    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//    {"title":"注册成功","type":"账户通知","time":"2014-08-05 12:35:16"},
//    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"},
//    {"title":"事务提交成功","type":"业务通知","time":"2014-08-05 12:29:00"}]
//};
//
