/**
 * Created by leo on 6/1/15.
 */
//get code for base info only
//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5a85d57385f32302&redirect_uri=http%3A%2F%2Fdev.www.idlan.cn&response_type=code&scope=snsapi_base&state=77#wechat_redirect
//https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5a85d57385f32302&redirect_uri=http%3A%2F%2Fdev.www.idlan.cn&response_type=code&scope=snsapi_userinfo&state=77#wechat_redirect

//get access token only
//https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid=wx5a85d57385f32302&secret=58d8d4b4e937d35cc7b462ee33c92453

//get user basic info
//https://api.wechat.com/cgi-bin/user/info?access_token=p749FN-IRxKYj27jdvlC2uVs9c2WR8Tfoe80AbxowUscAXs62PnAYd9DOwVdAXnIzP4CKBjYaQ7NLDqgzAVZaU4PPoSLweY2gPN__CQxAWw&openid=ohu-ujoGIuuf9QxBOpyMipjGhZWQ&lang=en_US
//openid
var Q = require('q');
var wechatConfig = {
    "appId": "wx5a85d57385f32302",
    "appSecret": "58d8d4b4e937d35cc7b462ee33c92453",
    "partnerKey": "200007b4e937d35cc7b462ee33clbs02",
    "mchId": "1239025702",
    "pfx": "../node_modules_local/lbs.api.fmm.roll/lib/weixinpay/lib/apiclient_cert.p12",
    "oauthUrl": "https://api.weixin.qq.com/sns/oauth2/access_token?",
    "apiTokenUrl" : "https://api.weixin.qq.com/cgi-bin/token?",
    "apiTicketUrl": "https://api.weixin.qq.com/cgi-bin/ticket/getticket?",
    "userInfoUrl" : "https://api.weixin.qq.com/cgi-bin/user/info?",
    "URLS": {
        "UNIFIED_ORDER": "https://api.mch.weixin.qq.com/pay/unifiedorder",
        "ORDER_QUERY": "https://api.mch.weixin.qq.com/pay/orderquery",
        "REFUND": "https://api.mch.weixin.qq.com/secapi/pay/refund",
        "REFUND_QUERY": "https://api.mch.weixin.qq.com/pay/refundquery",
        "DOWNLOAD_BILL": "https://api.mch.weixin.qq.com/pay/downloadbill",
        "SHORT_URL": "https://api.mch.weixin.qq.com/tools/shorturl"
    }
};

module.exports.getWeixinpayConfig = function(){
   return wechatConfig;
};

module.exports.getWechatOpenID = function (){
    return wechatOpenID;
}

module.exports.getWechatJSAPITicket = function (){
    return  wechatJSAPIToken;
}

module.exports.getWXUserInfo = function (){
    return wxUserInfo;
}

function wxUserInfo(m){
    var https = require('https');
    var r = {"pl": null, "er": null};
    var deferred = Q.defer();
    var varWechatOpenID = null;
    var varWechatToken = null;
    console.log("In get user info..")

    wechatOpenID(m).then(function(r){
        //console.log("cmm get open ID", r);
        varWechatOpenID = r.pl.openid;
        return varWechatOpenID;

    }).then(function(openid){
       return wechatToken(m).then(function(r){
            //console.log("cmm get wechat token", r);
            varWechatToken = r.pl.access_token;
            return varWechatToken;
        })
    }).then(function(accesstoken){
        console.log("open id: ", varWechatOpenID)
        console.log("access token: ", varWechatToken);
        if(varWechatOpenID && varWechatToken){
            var requestURL = wechatConfig.userInfoUrl+"access_token="+varWechatToken+"&openid="+varWechatOpenID+"&lang=en_US";
            //console.log("CCM GETTING prepared_ID url..",requestURL);
            https.get(encodeURI(requestURL), function(res) {
                res.on('data', function(d) {
                    if (d) {
                        try {
                            console.log("data from wexin server get basic user info  ...");
                            r.pl =JSON.parse(d);
                            deferred.resolve(r);
                        } catch(e){
                            console.log ("error in get basic user info", e);
                            r.er = "error occured during get basic user info";
                            deferred.reject(r);
                        }
                    }
                    else {
                        r.er = "error occured while basic user info";
                        deferred.reject(r);
                    }
                    //{"errcode":40029,"errmsg":"invalid code"}
                });


            }).on('error', function(e) {
                console.log("GET basic user info FAILED WITH ERROR: " + e.message);
                r.er = "error occured getting basic user info";
                deferred.reject(r);
            });

        }


    });

    //Q.all([p0,p1]).then(function(replay){
    //    console.log(replay);
    //    var openID = replay[0].pl.openid;
    //    var accesstoken = replay[1].pl.access_token;

    //
    //
    //});
  return deferred.promise;
}

function wechatOpenID(m){
    var https = require('https');
    var r = {"pl": null, "er": null};
    var deferred = Q.defer();
    var wxCode = m.pl.code;
    var requestURL = wechatConfig.oauthUrl+"appid="+wechatConfig.appId+"&secret="+wechatConfig.appSecret+"&code="+wxCode+"&grant_type=authorization_code";
    console.log("CCM GETTING OPEN ID URL",requestURL);
    https.get(encodeURI(requestURL), function(res) {
        //console.log("statusCode: ", res.statusCode);
        //console.log("headers: ", res.headers);
        res.on('data', function(d) {
            if (d) {
              try {
                  console.log("data from wexin server for open id ...");
                  //process.stdout.write(d);
                  r.pl =JSON.parse(d);
                  //console.log("json: ", json);
                  deferred.resolve(r);
                } catch(e){
                  console.log ("error in get openid", e);
                  r.er = "error occured during get openid";
                  deferred.reject(r);
                }
            }
            else {
                r.er = "error occured while validating user , function ivsClient.execute";
                deferred.reject(r);
            }
            //{"errcode":40029,"errmsg":"invalid code"}
        });


    }).on('error', function(e) {
        console.log("GET OPEN ID FAILED WITH ERROR: " + e.message);
        r.er = "error occured getting wechat openid";
        deferred.reject(r);
    });

    return deferred.promise;
}

function wechatJSAPIToken(m){
    var https = require('https');
    var r = {"pl": null, "er": null};
    var deferred = Q.defer();
    console.log("GETTING WECHAT JS API TICKET..")

    wechatToken(m).then(function(r){
        console.log("APP TOKEN", r);
        varWechatToken = r.pl.access_token;
        var requestURL = wechatConfig.apiTicketUrl+"access_token="+varWechatToken+"&type=jsapi";
        //console.log("CCM GETTING OPEN ID URL",requestURL);
        https.get(encodeURI(requestURL), function(res) {
            //console.log("statusCode: ", res.statusCode);
            //console.log("headers: ", res.headers);
            res.on('data', function(d) {
                if (d) {
                    try {
                        console.log("data from wexin server JS API KEY ...");
                        //process.stdout.write(d);
                        r.pl =JSON.parse(d);
                        r.pl.appId= wechatConfig.appId;
                        console.log("APP TICKET", r);
                        deferred.resolve(r);
                    } catch(e){
                        console.log ("error in get openid", e);
                        r.er = "error occured during get openid";
                        deferred.reject(r);
                    }
                }
                else {
                    r.er = "error occured while validating user , function ivsClient.execute";
                    deferred.reject(r);
                }
                //{"errcode":40029,"errmsg":"invalid code"}
            });

        }).on('error', function(e) {
            console.log("GET OPEN ID FAILED WITH ERROR: " + e.message);
            r.er = "error occured getting wechat openid";
            deferred.reject(r);
        });
    });

    return deferred.promise;
}

function wechatToken(m){
    var https = require('https');
    var r = {"pl": null, "er": null};
    var deferred = Q.defer();

    var requestURL = wechatConfig.apiTokenUrl+"grant_type=client_credential&appid="+wechatConfig.appId+"&secret="+wechatConfig.appSecret;

    console.log("GETTING ACCESS TOKEN URL ..", requestURL);
    https.get(encodeURI(requestURL), function(res) {
        //console.log("statusCode: ", res.statusCode);
        //console.log("headers: ", res.headers);
        res.on('data', function(d) {
            if (d) {
                try {
                    console.log("data from wexin server for token ...");
                    //process.stdout.write(d);
                    r.pl =JSON.parse(d);
                    //console.log("json: ", json);
                    deferred.resolve(r);
                } catch(e){
                    console.log ("error in get wechat Token", e);
                    r.er = "error occured during get wechat Token";
                    deferred.reject(r);
                }
            }
            else {
                r.er = "error occured while getting wechat token";
                deferred.reject(r);
            }
            //{"errcode":40029,"errmsg":"invalid code"}
        });


    }).on('error', function(e) {
        console.log("GET wechat Token FAILED WITH ERROR: " + e.message);
        r.er = "error occured getting wechat Token";
        deferred.reject(r);
    });

    return deferred.promise;
}