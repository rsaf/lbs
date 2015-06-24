/**
 * endpoints for /workspace/users
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');
var lib = require('lib')

module.exports = function(paramService, esbMessage) {
  var photosRouter = paramService.Router();


    //workspace/users/userType
    photosRouter.get('/:userType.json', function(paramRequest, paramResponse, paramNext){


        var userType = paramRequest.params.userType;
        console.log('inside sch-----------',userType);



        if(userType === 'systeminterfaces') {

            oHelpers.sendResponse(paramResponse, 200, systeminterfaces);
        }
        else if(userType === 'thirdpartyinterfaces'){

            oHelpers.sendResponse(paramResponse,200,thirdpartyinterfaces);
        }
        else if(userType === 'interfaceUsers'){
            oHelpers.sendResponse(paramResponse,200,interfaceUsers);
        }

        else{

        var m = {
            "ns": "scm",
            "op": "scm_getByType",
            "pl": {
                userType:userType
            },
            "mt": {p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

        };

            esbMessage(m)
                .then(function (r) {
                    //console.log('sch response-----all users-',r);
                    oHelpers.sendResponse(paramResponse, 200, r);
                })
                .fail(function (r) {

                    console.log('sch error-----',r);

                    oHelpers.sendResponse(paramResponse, 501, r);
                });
        }


    });



    //workspace/users/status/user_id
    photosRouter.put('/:status/:userType/:user_id.json', function(paramRequest, paramResponse){


        var newStatus = paramRequest.params.status;
        var Id = paramRequest.params.user_id;
        var type = paramRequest.params.userType;
        console.log(' sch update user status--------------',newStatus,Id);


        var m = {
            "ns": "scm",
            "op": "scm_disableEnableUser",
            "pl": {newStatus:newStatus,
                    _id:Id,
                    userType:type
                }
        };


        esbMessage(m)
            .then(function (r) {
                console.log('sch response-----user status-',r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                console.log('sch error-----',r);

                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });



    //workspace/users/user/mobile.json
    photosRouter.put('/user/mobile.json', function(paramRequest, paramResponse){


        var mobile = paramRequest.body.mobile;
        var userInfo = paramRequest.body.userInfo;
        console.log(' sch save user mobile--------------',mobile,userInfo);


        var m = {
            "ns": "scm",
            "op": "scm_saveUserMobile",
            "pl": {userInfo:userInfo,
                   mobile:mobile
                }
        };


        esbMessage(m)
            .then(function (r) {
                console.log('sch user mobile saved-------',r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                console.log('sch error-----',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });

//workspace/users/user/:loginInfo.json
    photosRouter.get('/user/:loginInfo.json', function(paramRequest, paramResponse){


        var loginInfo = paramRequest.param.loginInfo;
        console.log(' sch get user by loginInfo--------------',loginInfo);


        var m = {
            "ns": "scm",
            "op": "scm_getUserByLoginInfo",
            "pl": {loginInfo:loginInfo
            }
        };


        esbMessage(m)
            .then(function (r) {
                console.log('sch got user-------',r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                console.log('sch error-----',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });



    //workspace/users/user/verification/:mobile.json
    photosRouter.post('/user/verification/:mobile.json', function(paramRequest, paramResponse){


        var mobile = paramRequest.params.mobile;

        var code = lib.generateRandomValue();

        console.log(' sch send verification code--------------',mobile,code);



        var m = {
            ns: 'scm',
            vs: '1.0',
            op: 'scm_saveVerificationCode',
            pl: {
                code:code,
                userInfo:paramRequest.user.lanzheng.loginName
            }
        };





        esbMessage(m)
            .then(function (r) {
                console.log('verification code saved');
            }).then(function(){


                var m = {
                    ns: 'mdm',
                    vs: '1.0',
                    op: 'sendNotification',
                    pl: {
                        recipients: [{
                            inmail: {to: null},
                            weixin: {to: null},
                            sms: {to: mobile},
                            email: {to: null}
                        }]
                        , notification: {}
                    }
                };

                m.pl.notification.subject = '蓝证验证码:';
                m.pl.notification.notificationType = '事务通知';
                m.pl.notification.from = '系统';
                m.pl.notification.body = '您验证码是:'+code;


                esbMessage(m)
                    .then(function (r) {

                        console.log('sch sent verification code-------',r);
                        oHelpers.sendResponse(paramResponse, 200, r);
                    })

            })
            .fail(function (r) {

                console.log('sch error-----',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });



    //workspace/users/user/verification/:mobile.json
    photosRouter.post('/user/verification/code/:code.json', function(paramRequest, paramResponse){


        var code = paramRequest.params.code;
        var mobile = paramRequest.body.mobile;

        console.log(' sch verify code--------------',code,mobile);

        var m = {
            ns: 'scm',
            vs: '1.0',
            op: 'scm_checkVerificationCodeAndSaveContact',
            pl: {
                code:code,
                mobile:mobile,
                userInfo:paramRequest.user.lanzheng.loginName
            }
        };
        var firstResponse;
        esbMessage(m)
           .then(function(r){
                firstResponse = r
                var m = {
                    "ns":"upm",
                    "op": "updatePersonalProfile",
                    "pl":{
                        userAccountID : paramRequest.user.lanzheng.loginName,
                        'contacts.linkToPhone.value' : mobile
                    }
                };
                return esbMessage(m);
            })
            .then(function(r){

                console.log('sch verification code checked-------',firstResponse);
                        oHelpers.sendResponse(paramResponse, 200, firstResponse);


            })
            .fail(function (r) {

                console.log('sch error-----',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });

    return photosRouter;
};


var all = {
  "pl": [{
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Andy",
      "field2": "系统创建",
      "field3": "2013/07/22",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Candy",
      "field2": "Andy",
      "field3": "2013/05/10",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Lsf",
      "field2": "Andy",
      "field3": "2013/05/20",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "雪中情",
      "field2": "Andy",
      "field3": "2013/06/13",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "漫天飞舞",
      "field2": "雪中情",
      "field3": "2013/05/05",
      "field4": "正常"
    }
    , {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "forever91",
      "field2": "雪中情",
      "field3": "2013/05/22",
      "field4": "正常"
    }]
};

var groups = {
  "pl": [{
      "field1": "阳光工作组",
      "field2": "Andy",
      "field3": "2013/07/22",
      "field4": "正常"
    }, {
      "field1": "蓝宇工作组",
      "field2": "Candy",
      "field3": "2013/05/10",
      "field4": "正常"
    }, {
      "field1": "康乐家园",
      "field2": "Lsf",
      "field3": "2013/05/20",
      "field4": "正常"
    }, {
      "field1": "彩虹工作组",
      "field2": "雪中情",
      "field3": "2013/06/13",
      "field4": "正常"
    }
    , {
      "field1": "红叶工作组",
      "field2": "雪中情",
      "field3": "2013/05/05",
      "field4": "正常"
    }, {
      "field1": "互动工作组",
      "field2": "海天之梦",
      "field3": "2013/05/22",
      "field4": "正常"
    }]
};

var acl = {
  "pl": [{
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "系统创建",
      "field2": "2013/07/22",
      "field3": "正常"
    }
    , {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Andy",
      "field2": "2013/05/10",
      "field3": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Andy",
      "field2": "2013/05/20",
      "field3": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Andy",
      "field2": "2013/06/13",
      "field3": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "雪中情",
      "field2": "2013/05/05",
      "field3": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "雪中情",
      "field2": "2013/05/22",
      "field3": "正常"
    }]
  };
  
var systeminterfaces = {
  "pl": [{
      "field1": "身份证核验接口",
      "field2": "正常",
      "field3": true,
      "field4": "2014/07/05 9:23",
      "field5": "证照"
    }, {
      "field1": "证照核验接口",
      "field2": "正常",
      "field3": true,
      "field4": "2014/07/15 10：10",
      "field5": "证照"
    }
    ]
};

var thirdpartyinterfaces = {
    "pl": [{
        "field1": "身份证核验接口",
        "field2": "正常",
        "field3": true,
        "field4": "2014/07/05 9:23",
        "field5": "公安局"
    }, {
        "field1": "证照核验接口",
        "field2": "正常",
        "field3": true,
        "field4": "2014/07/15 10：10",
        "field5": "公安局"
    }, {
        "field1": "支付宝接口",
        "field2": "正常",
        "field3": "2014/07/05 9:23",
        "field4": "2014/07/22 9:40",
        "field5": "阿里巴巴"
    }
        , {
            "field1": "短信接口",
            "field2": "正常",
            "field3": "2014/07/05 9:23",
            "field4": "2014/09/07 11:30",
            "field5": "中国移动"
        }]
};

// {
//    "field1": "微信接口",
//        "field2": "不正常",
//        "field3": "2014/07/05 9:23",
//        "field4": "2014/08/05 12:23",
//        "field5": "腾讯"
//}

var interfaceUsers = {
  "pl": [{
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Andy",
      "field2": "系统创建",
      "field3": "2013/07/22",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Candy",
      "field2": "Andy",
      "field3": "2013/05/10",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "Lsf",
      "field2": "Andy",
      "field3": "2013/05/20",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "雪中情",
      "field2": "Andy",
      "field3": "2013/06/13",
      "field4": "正常"
    }, {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "漫天飞舞",
      "field2": "雪中情",
      "field3": "2013/05/05",
      "field4": "正常"
    }
    , {
      "imageurl": "/commons/images/passportPhoto_other.jpg",
      "field1": "forever91",
      "field2": "雪中情",
      "field3": "2013/05/22",
      "field4": "正常"
    }]
};