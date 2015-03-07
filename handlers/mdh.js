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


///workspace/notifications/:notificationType.json
  userNotificationRouter.get('/:notificationType.json', function (paramRequest, paramResponse, paramNext) {

    var m = {
      ns: 'mdm',
      vs: '1.0',
      op: 'getNotifications',
      pl: {
        messageGroup: null, // null
        from:  paramRequest.user.lanzheng.loginName,
        to: paramRequest.user.lanzheng.loginName,
        pageNumber: 1,
        pageSize: 10
      }
    };


    if (paramRequest.params.notificationType === 'all') {
      m.pl.messageGroup = 'all';
    }

    else if (paramRequest.params.notificationType === 'unread') {
      m.pl.messageGroup = 'unread';
    }

    else if (paramRequest.params.notificationType === 'read') {
      m.pl.messageGroup = 'read';
    }

    else if (paramRequest.params.notificationType === 'sent') {
      m.pl.messageGroup= 'sent';
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


  ///workspace/notifications/mailling/contacts.json
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
              //console.log('returned users value.users -------: ', r.users);
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

    var inMailContacts  = paramRequest.body.recipients;
    var inMailRecipients = [];

    console.log(inMailContacts);

    for (i in inMailContacts ){
      if(!(inMailContacts[i])) continue ;
       inMailRecipients.push({
        inmail: {to: inMailContacts[i].to},
        weixin: {to:null},
        sms: {to: null},
        email: {to: null}
       });

    }
    var m = {
      ns: 'mdm',
      vs: '1.0',
      op: 'sendNotification',
      pl: {
        recipients:inMailRecipients,
        notification: paramRequest.body.notification
      }
    };
    //console.log(m.pl.recipients);
    //console.log(m.pl);

    m.pl.notification.from = paramRequest.user.lanzheng.loginName;
    console.log('    -----------sender-------------- :  ', m.pl.notification.from);

    //console.log(m.pl);

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
  userNotificationRouter.put('/:notificationType/:guid.json', function (paramRequest, paramResponse, paramNext) {
    var m = {
      ns: 'mdm',
      vs: '1.0',
      op: 'updateViewStatus',
      pl: {
           messageType: paramRequest.body.messageType, // inbox, outbox
           messageID: paramRequest.body.messageID //@Todo we need to check that the MessegeID = guid.. the guid is use in the acl
        , viewStatus: paramRequest.body.viewState
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

  ////workspace/notifications/:viewstate.json
  userNotificationRouter.put('/archive/:notificationType/:guid.json', function (paramRequest, paramResponse, paramNext) {
    return Q().then(function(){
      var reqMessage = JSON.parse(paramRequest.body.json);
      var m = {
        ns: 'mdm',
        vs: '1.0',
        op: 'persistNotification',
        pl: {
          messageType: paramRequest.params.notificationType,
          notification: reqMessage.pl.notification
        }
      };
      console.log('what will be deleted', reqMessage.pl.notification);

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
