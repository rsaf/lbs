/**
 * endpoints for /workspace/activities
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');
var Q = require('q');

module.exports = function(paramService, esbMessage)
{
  function _persistForm(paramRequest, paramResponse){
    var m = {};
    //formHtml
    Q().then(function(){
      m.pl=JSON.parse(paramRequest.body.json);
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      m.op='bmm_persistForm';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  }
  function _persistActivity(paramRequest, paramResponse){
    var m = {};
    //formHtml
    Q().then(function(){
      m.pl=JSON.parse(paramRequest.body.json);
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      m.op='bmm_persistActivity';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });    
  }




  var photosRouter = paramService.Router();
  photosRouter.post('/form.json', function(paramRequest, paramResponse, paramNext){
    _persistForm(paramRequest, paramResponse, paramNext)
  });
  photosRouter.put('/form.json', function(paramRequest, paramResponse, paramNext){
    _persistForm(paramRequest, paramResponse, paramNext)
  });
  photosRouter.post('/activity.json', function(paramRequest, paramResponse, paramNext){
    _persistActivity(paramRequest, paramResponse, paramNext)
  });
  photosRouter.put('/activity.json', function(paramRequest, paramResponse, paramNext){
    _persistActivity(paramRequest, paramResponse, paramNext)
  });
  photosRouter.get('/activity.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    Q().then(function(){
      m.pl={code:paramRequest.query.code}
      m.op='bmm_getActivity';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,{pl:msg});
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });    
  });
  photosRouter.get('/activities.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    Q().then(function(){
      m.pl={loginName:paramRequest.user.lanzheng.loginName}//@todo: add company id as well
      m.op='bmm_getActivities';
      console.log('executing esb message')
      return esbMessage(m);
    }).then(function resolve(msg){
      oHelpers.sendResponse(paramResponse,200,{pl:msg});
    },function reject(er){
      console.log(er);
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  });

  
  
  
  photosRouter.get('/:activitiesType.json', function(paramRequest, paramResponse, paramNext){
      if (paramRequest.params.activitiesType === 'activitieslist'){
          oHelpers.sendResponse(paramResponse,200,activitieslist);
      }
      else if(paramRequest.params.activitiesType === 'nameslist'){
          oHelpers.sendResponse(paramResponse,200,nameslist);
      }
      else if(paramRequest.params.activitiesType === 'activitiesforms'){
          oHelpers.sendResponse(paramResponse,200,activitiesforms);
      }
      else if(paramRequest.params.activitiesType === 'publicforms'){
          oHelpers.sendResponse(paramResponse,200,publicforms);
      }
      else if(paramRequest.params.activitiesType === 'serviceslist'){
          oHelpers.sendResponse(paramResponse,200,serviceslist);
      }
      else if(paramRequest.params.activitiesType === 'all'){
          oHelpers.sendResponse(paramResponse,200,all);
      }
      else if(paramRequest.params.activitiesType === 'conventional'){
          oHelpers.sendResponse(paramResponse,200,conventional);
      }
      else if(paramRequest.params.activitiesType === 'favorite'){
          oHelpers.sendResponse(paramResponse,200,favorite);
      }
      else if(paramRequest.params.activitiesType === 'agent'){
          oHelpers.sendResponse(paramResponse,200,agent);
      }
      else if(paramRequest.params.activitiesType === 'delegated'){
          oHelpers.sendResponse(paramResponse,200,delegated);
      }
  });









  return photosRouter;
};


var activitieslist = {
  "pl": [{
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }, {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }]
};

var nameslist = {
  "pl": [{
      "field1": "证照拍摄名单",
      "field2": "手机号",
      "field3": "2014-08-05",
      "field4": "500"
    }, {
      "field1": "排版输出名单",
      "field2": "身份证号",
      "field3": "2014-08-05",
      "field4": "1000"
    }, {
      "field1": "LZ2002372125",
      "field2": "罗秀路柯达网络",
      "field3": "正常",
      "field4": "罗秀路567号"
    }, {
      "field1": "团体照补拍名单",
      "field2": "邮箱",
      "field3": "2014-08-05",
      "field4": "600"
    }]
};

var activitiesforms = {
  "pl": [{
      "field1": "证照拍摄",
      "field2": "2014-08-05",
      "field3": "有"
    }, {
      "field1": "排版输出",
      "field2": "2014-08-05",
      "field3": "有"
    }
    , {
      "field1": "团体照补拍",
      "field2": "2014-08-05",
      "field3": "无"
    }]
};

var publicforms = {
  "pl": [{
      "field1": "团体照补拍名单",
      "field2": "2014-08-05",
      "field3": "有"
    }
    , {
      "field1": "团体照补拍名单",
      "field2": "2014-08-05",
      "field3": "有"
    }, {
      "field1": "团体照补拍名单",
      "field2": "2014-08-05",
      "field3": "无"
    }]
};

var serviceslist = {
  "pl": [{
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }
    , {
      "field1": "L0121210120",
      "field2": "排版输出",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }, {
      "field1": "L0121210120",
      "field2": "团体照补拍",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }, {
      "field1": "L0121210120",
      "field2": "团体照补拍",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }]
};

var all = {
  "pl": [{
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }
    , {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }]
};

var conventional = {
  "pl": [{
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }, {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }
    , {
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }]
};

var favorite = {
  "pl": [{
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }]

};

var agent = {
  "pl": [{
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }
    , {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }]
};

var delegated = {
  "pl": [{
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }, {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }
    , {
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }]
};

var agentsettings = {
  "pl": [{
      "field1": "1099889997799",
      "field2": "王大力",
      "field3": "2014-08-05 12：23:16",
      "field4": "等待验证"
    }, {
      "field1": "1099889997654",
      "field2": "李小丽",
      "field3": "2014-08-05 12：23:16",
      "field4": "正常"
    }, {
      "field1": "1099889991425",
      "field2": "张中历",
      "field3": "2014-08-05 12：23:16",
      "field4": "暂停"
    }
    , {
      "field1": "109988991369",
      "field2": "张三丰",
      "field3": "2014-08-05 15：23:19",
      "field4": "失效"
    }]
};

