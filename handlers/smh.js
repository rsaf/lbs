/**
 * Created by LBS006 on 12/3/14.
 */
var q = require('q');
var oHelpers = require('../utilities/helpers.js');

function _initRequestMessage(paramRequest,type){
  return {
    rdu: '000000000000000000000009'
    ,rdo: '000000000000000000000008'
    ,rc: 'code'
    ,rt: 'title'
    ,rsu: paramRequest.user.id
    ,rso: paramRequest.user.id
    ,rs: 'status'
    ,rb: 'body'
    ,rtr: type
  };
}


module.exports = function(paramService,  esbMessage){
  function _commitTransaction(m){
    m.pl.transaction = {
      _id:m.pl.transactionid
    }
    m.op='commitTransaction';
    return esbMessage(m);
  }
  function _rollBackTransaction(m){
    m.pl.transaction = {
      _id:m.pl.transactionid
    }
    m.op='wmm_rollBackTransaction';
    return esbMessage(m);
  }
  var serviceManagementRouter = paramService.Router();
  serviceManagementRouter.put ('/service.json', function(paramRequest, paramResponse, paramNext){
    var m={};
    var response;
    q().then(function(){
      m.op = "createTransaction";
      m.pl={
        userid:paramRequest.user.id
        ,transaction:{
          description:'persist Service'
          ,modules:['smm','rmm']
        }
      };
      return esbMessage(m)
    }).then(function(m){
      var reqMsg = JSON.parse(paramRequest.body.json),
      service=reqMsg.pl.service;
      m.pl.service = service;
      m.op='persistService';
      return esbMessage(m);
    })
    .then(function(r) {
      response=r;
      m.op="createRequestMessage";
      m.pl.requestMessage = _initRequestMessage(paramRequest,'000000000000000000000010');
      return esbMessage(m);
    }).then(function() {
      return _commitTransaction(m);
    }).then(function() {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(response));
    })
    .fail(function(r) {
      //@todo: set roll back status wmm (not sure why Q.all don't want to play nice. fin is never called when I tried that
      return esbMessage({pl:{transactionid:m.pl.transactionid},op:'smm_rollback'})
      .then(function(){
         return esbMessage({pl:{transactionid:m.pl.transactionid},op:'rmm_rollback'});
      })
      .fin(function(){
        _rollBackTransaction(m);
        paramResponse.writeHead(501, {"Content-Type": "application/json"});
        if(r.er && r.er.ec && r.er.ec>1000){
          r.er.em='Server poblem....';
        }
        paramResponse.end(JSON.stringify(r));
      });
    });
  });
  serviceManagementRouter.post('/service.json', function(paramRequest, paramResponse, paramNext){
    var m={};
    var response;
    q().then(function(){
      m.op = "createTransaction";
      m.pl={
        userid:paramRequest.user.id
        ,transaction:{
          description:'persist Service'
          ,modules:['smm','rmm']
        }
      };
      return esbMessage(m);
    }).then(function(m){
      var reqMsg = JSON.parse(paramRequest.body.json);
      var service = reqMsg.pl.service;
      m.pl.service = {
        serviceName:service.serviceName
        ,serviceType:service.serviceType
        ,briefOverview:service.briefOverview
        ,standardPayment:service.standardPayment
        ,standardServicePrice:service.standardServicePrice
        ,standardPricing:service.standardPricing
        ,standardServiceNotes:service.standardServiceNotes
        ,standardReservationRequest:service.standardReservationRequest
        ,PriceList:service.PriceList
      };
      m.op='persistService';
      return esbMessage(m);
    })
    .then(function(r) {
      response=r;
      m.op="createRequestMessage";
      m.pl.requestMessage = _initRequestMessage(paramRequest,'000000000000000000000010');
      return esbMessage(m);
    }).then(function() {
      return _commitTransaction(m)
    }).then(function() {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(response));
    })
    .fail(function(r) {
      console.log('0000000000 in fail:',r)
      //@todo: set roll back status wmm (not sure why Q.all don't want to play nice. fin is never called when I tried that
      return esbMessage({pl:{transactionid:m.pl.transactionid},op:'smm_rollback'})
      .then(function(){
         return esbMessage({pl:{transactionid:m.pl.transactionid},op:'rmm_rollback'});
      })
      .fin(function(){
        _rollBackTransaction(m);
        paramResponse.writeHead(501, {"Content-Type": "application/json"});
        if(r.er && r.er.ec && r.er.ec>1000){
          r.er.em='Server poblem....';
        }
        paramResponse.end(JSON.stringify(r));
      });
    });
  });
  serviceManagementRouter.get ('/service.json', function(paramRequest, paramResponse, paramNext){
    var query = {};
    if(typeof paramRequest.query._id!=='undefined'){
      query._id=paramRequest.query._id;
    }
    var m = {
      "op": "myservice",
      "pl": {
        "query":query
      }
    };
    esbMessage(m)
    .then(function(r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });
  serviceManagementRouter.get ('/services.json', function(paramRequest, paramResponse, paramNext){
    var m = {
      "op": "servicesByCreator",
      "pl": {
        "userAccountID":paramRequest.user.id
      }
    };
    esbMessage(m)
    .then(function(r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });
  serviceManagementRouter.get('/servicenames.json', function(paramRequest, paramResponse, paramNext){
    var m = {
      "op": "serviceNames",
      "pl": null
    };
    esbMessage(m)
    .then(function(r) {
        paramResponse.writeHead(200, {"Content-Type": "application/json"});
        paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });
  serviceManagementRouter.get('/servicetypes.json', function(paramRequest, paramResponse, paramNext){
    var m = {
      "ns":"smm",
      "op": "serviceTypes",
      "pl": null
    };
    esbMessage(m)
    .then(function(r) {
        paramResponse.writeHead(200, {"Content-Type": "application/json"});
        paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });
  serviceManagementRouter.get('/servicepointtypes.json', function(paramRequest, paramResponse, paramNext){
    var m = {
      "op": "servicePointTypes",
      "pl": null
    };
    esbMessage(m)
    .then(function(r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });
  serviceManagementRouter.post('/servicepoint.json', function(paramRequest, paramResponse, paramNext){
    var m={
      "op": "createTransaction"
      ,"pl": {
        "userid":paramRequest.user.id
        ,transaction:{
          description:'persist ServicePoint'
          ,modules:['smm','rmm']
        }
      }
    };
    var response;
    q().then(function(){
      return esbMessage(m);
    }).then(function (){
      var reqMsg = JSON.parse(paramRequest.body.json),
      servicePoint = reqMsg.pl.servicePoint;
      m.op="persistServicePoint";
      m.pl.servicePoint = servicePoint;
      return esbMessage(m);
    })
    .then(function(r) {
      response=r;
      m.op="createRequestMessage";
      m.pl.requestMessage = _initRequestMessage(paramRequest,'000000000000000000000020');
      return esbMessage(m);
    }).then(function() {
      return _commitTransaction(m);
    }).then(function() {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(response));
    })
    .fail(function(r) {
      //@todo: set roll back status wmm (not sure why Q.all don't want to play nice. fin is never called when I tried that
      return esbMessage({pl:{transactionid:m.pl.transactionid},op:'smm_rollback'})
      .then(function(){
         return esbMessage({pl:{transactionid:m.pl.transactionid},op:'rmm_rollback'});
      })
      .fin(function(){
        _rollBackTransaction(m);
        paramResponse.writeHead(501, {"Content-Type": "application/json"});
        if(r.er && r.er.ec && r.er.ec>1000){
          r.er.em='Server poblem....';
        }
        paramResponse.end(JSON.stringify(r));
      });
    });
  });
  serviceManagementRouter.put ('/servicepoint.json', function(paramRequest, paramResponse, paramNext){
    var m={
      "op": "createTransaction"
      ,"pl": {
        "userid":paramRequest.user.id
        ,transaction:{
          description:'persist ServicePoint'
          ,modules:['smm','rmm']
        }
      }
    };
    var response;
    q().then(function(){
      return esbMessage(m);
    }).then(function (){
      var reqMsg = JSON.parse(paramRequest.body.json),
      servicePoint = reqMsg.pl.servicePoint;
      m.op="persistServicePoint";
      m.pl.servicePoint = servicePoint;
      return esbMessage(m);
    })
    .then(function(r) {
      response=r;
      m.op="createRequestMessage";
      m.pl.requestMessage = _initRequestMessage(paramRequest,'000000000000000000000020');
      return esbMessage(m);
    }).then(function() {
      return _commitTransaction(m);
    }).then(function() {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(response));
    })
    .fail(function(r) {
      //@todo: set roll back status wmm (not sure why Q.all don't want to play nice. fin is never called when I tried that
      return esbMessage({pl:{transactionid:m.pl.transactionid},op:'smm_rollback'})
      .then(function(){
         return esbMessage({pl:{transactionid:m.pl.transactionid},op:'rmm_rollback'});
      })
      .fin(function(){
        _rollBackTransaction(m);
        paramResponse.writeHead(501, {"Content-Type": "application/json"});
        if(r.er && r.er.ec && r.er.ec>1000){
          r.er.em='Server poblem....';
        }
        paramResponse.end(JSON.stringify(r));
      });
    });
  });
  serviceManagementRouter.get ('/servicepoint.json', function(paramRequest, paramResponse, paramNext){
    var query = {};
    if(typeof paramRequest.query._id!=='undefined'){
      query._id=paramRequest.query._id;
    }
    var m = {
      "ns":"smm",
      "op": "myservicePoint",
      "pl": {
        "query":query
      }
    };
    esbMessage(m)
    .then(function(r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });
  serviceManagementRouter.get('/myservicepoints.json', function(paramRequest, paramResponse, paramNext){
    var m = {
      "ns":"smm",
      "op": "servicePointsByCreator",
      "pl": {
        "userAccountID":paramRequest.user.id
      }
    };
    esbMessage(m)
    .then(function(r) {
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      paramResponse.end(JSON.stringify(r));
    });
  });

  serviceManagementRouter.get('/:type.json', function(paramRequest, paramResponse, paramNext){
      if (paramRequest.params.type === 'allbookings'){
          oHelpers.sendResponse(paramResponse,200,allbookings);
      }
      else if(paramRequest.params.type === 'busnessrecords'){
          oHelpers.sendResponse(paramResponse,200,busnessrecords);
      }
    });

        //createServicePoint
  return serviceManagementRouter;
};


var allbookings = {
  "pl": [{
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "王大力",
      "field4": "2014-08-05 12:23:16",
      "field5": "待办"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "李丽",
      "field4": "2014-08-05 12:23:16",
      "field5": "已完成"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "孙悟空",
      "field4": "2014-08-05 12:29:16",
      "field5": "取消"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "黄蓉",
      "field4": "2014-08-05 12:22:16",
      "field5": "过期"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "周林",
      "field4": "2014-08-05 12:23:16",
      "field5": "待办"
    }]
};

        
var busnessrecords = {
  "pl": [{
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "50",
      "field4": "未完成",
      "field5": "王大力"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "20",
      "field4": "已完成",
      "field5": "李丽"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "50",
      "field4": "取消",
      "field5": "孙悟空"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "50",
      "field4": "已完成",
      "field5": "黄蓉"
    }, {
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "50",
      "field4": "已完成",
      "field5": "周林"
    }]
};


        
        