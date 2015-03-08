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

var oHelpers = require('../utilities/helpers.js');
var Q = require('q');

module.exports = function (paramService, esbMessage)
{
  var userNotificationRouter = paramService.Router();


//    /workspace/notifications/:notificationType.json
  userNotificationRouter.get('/:notificationType.json', function (paramRequest, paramResponse, paramNext) {


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


    if (paramRequest.params.notificationType === 'all') {
      m.pl.viewStatus = null;
    }

    else if (paramRequest.params.notificationType === 'unread') {
      m.pl.viewStatus = false;
    }

    else if (paramRequest.params.notificationType === 'read') {
      m.pl.viewStatus = true;
    }

    else {

      var r = {pl: null, er: {ec: 404, em: "invalid notification type!"}};
      oHelpers.sendResponse(paramResponse, 404, r);
    }

    esbMessage(m)
            .then(function (r) {

              paramResponse.writeHead(200, {"Content-Type": "application/json"});
              paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {

              var r = {pl: null, er: {ec: 404, em: "could not find notification"}};
              oHelpers.sendResponse(paramResponse, 404, r);
            });


  });


  //    /workspace/notifications/mailling/contacts.json
  userNotificationRouter.post('/mailling/contacts.json', function (paramRequest, paramResponse, paramNext) {

    var m = {
      ns: 'mdm',
      vs: '1.0',
      op: 'validateUsersList',
      pl: paramRequest.body
    };


    esbMessage(m)
            .then(function (r) {


              console.log('returned users value -------: ', JSON.stringify(r));
              console.log('returned users value.users -------: ', r.users);
              paramResponse.writeHead(200, {"Content-Type": "application/json"});
              paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {

              console.log(r.er);
              var r = {pl: null, er: {ec: 404, em: "could not find notification"}};
              oHelpers.sendResponse(paramResponse, 404, r);
            });


  });



  ///workspace/notifications/mailling/notifications.json
  userNotificationRouter.post('/mailling/notifications.json', function (paramRequest, paramResponse, paramNext) {


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


    m.pl.notification.from = paramRequest.user.lanzheng.loginName;

    console.log('    -----------sender-------------- :  ', m.pl.notification.from);

    esbMessage(m)
            .then(function (r) {

              paramResponse.writeHead(200, {"Content-Type": "application/json"});
              paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {

              console.log(r.er);
              var r = {pl: null, er: {ec: 404, em: "could not send notification"}};
              oHelpers.sendResponse(paramResponse, 404, r);
            });


  });


  ///workspace/notifications/update/:viewstate.json
  userNotificationRouter.put('/update/:viewstate.json', function (paramRequest, paramResponse, paramNext) {
    var m = {
      ns: 'mdm',
      vs: '1.0',
      op: 'updateViewStatus',
      pl: {
        messageID: paramRequest.body.messageID
        , viewStatus: paramRequest.params.viewstate
      }
    };
    esbMessage(m)
    .then(function (r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function (r) {

      var r = {pl: null, er: {ec: 404, em: "could not update view state"}};
      oHelpers.sendResponse(paramResponse, 404, r);
    });


  });

  userNotificationRouter.put('/notification.json', function (paramRequest, paramResponse, paramNext) {
    return Q().then(function(){
      var reqMessage = JSON.parse(paramRequest.body.json);
      var m = {
        ns: 'mdm',
        vs: '1.0',
        op: 'persistNotification',
        pl: {
          notification: reqMessage.pl.notification
        }
      };
      return esbMessage(m);
    })
    .then(function (r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function (r) {
      var r = {pl: null, er: {ec: 404, em: "could not update view state"}};
      oHelpers.sendResponse(paramResponse, 404, r);
    });


  });







  return userNotificationRouter;
};
