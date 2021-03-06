/**
 * Created by leo on 4/29/15.
 */

module.exports.get_sms_client  = function(param_module_ns){


    var smsConfig = require('./cbos.json').external_services.smsconfig;
    //var soap = require('soap');
    //var md5 = require('MD5');
    var Q = require('q');
    var http = require('http');


  return function sendSMS(m){
            var r ={"pl":null, "er":null};
            var deferred = Q.defer();
      //
      //var params = {
      //    "username": null,
      //    "password": null,
      //    "extNo": null,
      //    "mobiles": null,
      //    "msg": null
      //};

      var requestURL = smsConfig.endpoint+"account="+ smsConfig.username + "&pswd=" + smsConfig.password + "&mobile=" + m.pl.mobile+ "&msg=" + m.pl.message+ "&needstatus=true";

      console.log("CMM: NEW SMS MESSAGE REQUEST URL...", requestURL);

      http.get(encodeURI(requestURL), function(res) {
          console.log("CMM: SEND SMS RESPONEDED WITH ...." + res.statusCode);
          r.pl = true;
          console.log("CMM: SMS SENT TO .... ",m.pl.mobile);
          deferred.resolve(r);

      }).on('error', function(e) {
          console.log("SEND SMS FAIL WITH ERRO...." + e.message);
          r.er = "error occured in sending message , function sendSMS";
          deferred.reject(r);
      });

      return deferred.promise;

    //soap.createClient(smsConfig.endpoint, function(err, smsClient) {
    //            if (err) {
    //                r.er = "An error occurred while getting sms web service wsdl, function getSMSClient";
    //                deferred.reject(r);
    //            }
    //            else {
    //                params.username = smsConfig.username;
    //                //params.password = md5(smsConfig.password);
    //                params.password = smsConfig.password;
    //                params.extNo = "";
    //                params.mobiles = m.pl.mobile;
    //                params.msg = m.pl.message;
    //                console.log("CMM: SENDING SMS TO ... ", params.mobiles);
    //
    //                smsClient.sendMsg(params, function (err, result) {
    //                    if (result.sendMsgResult.ErrorCode === 0) {
    //                        r.pl = true;
    //                        console.log("CMM: SMS SENT TO ... ", params.mobiles);
    //                        deferred.resolve(r);
    //                    }
    //
    //                    else {
    //                        r.er = "error occured in sending message , function sendSMS";
    //                        deferred.reject(r);
    //                    }
    //
    //                });
    //            }
    //
    //        });

    //soap.createClient(smsConfig.endpoint, function(err, smsClient) {
            //    if (err) {
            //        r.er = "An error occurred while getting sms web service wsdl, function getSMSClient";
            //        deferred.reject(r);
            //    }
            //    else {
            //        params.username = smsConfig.username;
            //        params.password = md5(smsConfig.password);
            //        params.extNo = "";
            //        params.mobiles = m.pl.mobile;
            //        params.msg = m.pl.message;
            //        console.log("CMM: SENDING SMS TO ... ", params.mobiles);
            //        //console.log(params);
            //        smsClient.sendMsg(params, function (err, result) {
            //            if (!err && result.sendMsgResult.ErrorCode === 0) {
            //                r.pl = true;
            //                console.log("CMM: SMS SENT TO ... ", params.mobiles);
            //                deferred.resolve(r);
            //            }
            //
            //            else {
            //                r.er = "error occured in sending message , function sendSMS";
            //                deferred.reject(r);
            //            }
            //
            //        });
            //    }
            //
            //});
            //
            //return deferred.promise;

    }

};
