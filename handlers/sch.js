/**
 * endpoints for /workspace/users
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage) {
  var photosRouter = paramService.Router();

    photosRouter.get('/:userType.json', function(paramRequest, paramResponse, paramNext){
        if (paramRequest.params.userType === 'all'){
            oHelpers.sendResponse(paramResponse,200,all);
        }
        else if(paramRequest.params.userType === 'groups'){
            oHelpers.sendResponse(paramResponse,200,groups);
        }
        else if(paramRequest.params.userType === 'acl'){
            oHelpers.sendResponse(paramResponse,200,acl);
        }
        else if(paramRequest.params.userType === 'systeminterfaces'){
            oHelpers.sendResponse(paramResponse,200,systeminterfaces);
        }
        else if(paramRequest.params.userType === 'thirdpartyinterfaces'){
            oHelpers.sendResponse(paramResponse,200,thirdpartyinterfaces);
        }
        else if(paramRequest.params.userType === 'interfaceUsers'){
            oHelpers.sendResponse(paramResponse,200,interfaceUsers);
        }
    });





    photosRouter.post('/user.json', function(paramRequest, paramResponse, paramNext){

        console.log('posted new user');


            oHelpers.sendResponse(paramResponse,200,{pl:{'status':true}});


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
      "field3": true,
      "field4": "2014/07/22 9:40",
      "field5": "阿里巴巴"
    }, {
      "field1": "微信接口",
      "field2": "不正常",
      "field3": false,
      "field4": "2014/08/05 12:23",
      "field5": "腾讯"
    }
    , {
      "field1": "短信接口",
      "field2": "正常",
      "field3": true,
      "field4": "2014/09/07 11:30",
      "field5": "中国移动"
    }]
};

var thirdpartyinterfaces = {
  "pl": [{
      "field1": "蓝证证照接口",
      "field2": "正常",
      "field3": true,
      "field4": "2014/07/05 9:23",
      "field5": "蓝证平台"
    }]
};

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