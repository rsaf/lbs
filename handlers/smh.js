/**
 * Created by LBS006 on 12/3/14.
 */
var q = require('q');
var oHelpers = require('../utilities/helpers.js');

module.exports = function(paramService,  esbMessage){
  var serviceManagementRouter = paramService.Router();
  serviceManagementRouter.post('/service.json', function(paramRequest, paramResponse, paramNext){
    var m;
    var service;
    q().then(function(){
      service = JSON.parse(paramRequest.body.pl.service);
      return {
        "ns":"smm",
        "op": "persistService",
        "pl": {
          "userid":paramRequest.user.id
          ,"service":{
            serviceName:service.serviceName
            ,serviceType:service.serviceType
            ,briefOverview:service.briefOverview
            ,standardPayment:service.standardPayment
            ,standardServicePrice:service.standardServicePrice
            ,standardPricing:service.standardPricing
            ,standardServiceNotes:service.standardServiceNotes
            ,standardReservationRequest:service.standardReservationRequest
            ,PriceList:service.PriceList
          }
        }
      };
      
    }).then(function(m){
      return esbMessage(m);
    })
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
  serviceManagementRouter.put ('/service.json', function(paramRequest, paramResponse, paramNext){
    var m;
    var service;
    q().then(function(){
      m = JSON.parse(paramRequest.body.json);
      service = m.pl.service;
      return {
        "ns":"smm",
        "op": "persistService",
        "pl": {
          "userid":paramRequest.user.id
          ,service:service
        }
      };
      
    }).then(function(m){
      return esbMessage(m);
    })
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
  serviceManagementRouter.get ('/service.json', function(paramRequest, paramResponse, paramNext){
    var query = {};
    if(typeof paramRequest.query._id!=='undefined'){
      query._id=paramRequest.query._id;
    }
    var m = {
      "ns":"smm",
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
      "ns":"smm",
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
      "ns":"smm",
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
      "ns":"smm",
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
    var m;
    var servicePoint;
    q().then(function(){
      m = JSON.parse(paramRequest.body.json);
      servicePoint = m.pl.servicePoint;
      return {
        "ns":"smm",
        "op": "persistServicePoint",
        "pl": {
          "userid":paramRequest.user.id,
          'servicePoint':servicePoint
        }
      };
      
    }).then(function(m){
      return esbMessage(m);
    })
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
  serviceManagementRouter.put ('/servicepoint.json', function(paramRequest, paramResponse, paramNext){
    var m;
    var servicePoint;
    q().then(function(){
      m = JSON.parse(paramRequest.body.json);
      servicePoint = m.pl.servicePoint;
      return {
        "ns":"smm",
        "op": "persistServicePoint",
        "pl": {
          "userid":paramRequest.user.id
          ,servicePoint:servicePoint
        }
      };
      
    }).then(function(m){
      return esbMessage(m);
    })
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


        
        