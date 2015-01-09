/**
 * Created by LBS006 on 12/3/14.
 */
var q = require('q');
var oHelpers = require('../utilities/helpers.js');

module.exports = function(paramService,  esbMessage){
  var serviceManagementRouter = paramService.Router();
  serviceManagementRouter.post('/newservice.json', function(paramRequest, paramResponse, paramNext){
    var m;
    var service;
    q().then(function(){
      service = JSON.parse(paramRequest.body.json);
      console.log(service);
      return {
        "ns":"smm",
        "op": "createService",
        "pl": {
          "userid":paramRequest.user.id,
          //serviceType:service.serviceType,//@todo, cannot do this because it has no objectid
          //serviceProvider:service.serviceProvider,//@todo: cannot set this because we dont have the user organisation here
          price:service.price,
          serviceName: service.serviceName,
          servicePoints: service.servicePoints,
          briefOverview:service.description
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
  serviceManagementRouter.get('/myservices.json', function(paramRequest, paramResponse, paramNext){
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
//    var m = {
//      "ns":"smm",
//      "op": "servicesByCreator",
//      "pl": {
//        "userAccountID":paramRequest.user.id
//      }
//    };
//    esbMessage(m)
//    .then(function(r) {
      var r = {err:null,pl:['service name one','service name two']};
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
//    })
//    .fail(function(r) {
//      paramResponse.writeHead(501, {"Content-Type": "application/json"});
//      if(r.er && r.er.ec && r.er.ec>1000){
//        r.er.em='Server poblem....';
//      }
//      paramResponse.end(JSON.stringify(r));
//    });
  });
  serviceManagementRouter.get('/servicetypes.json', function(paramRequest, paramResponse, paramNext){
//    var m = {
//      "ns":"smm",
//      "op": "servicesByCreator",
//      "pl": {
//        "userAccountID":paramRequest.user.id
//      }
//    };
//    esbMessage(m)
//    .then(function(r) {
      var r = {err:null,pl:['service type one','service type two']};
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
//    })
//    .fail(function(r) {
//      paramResponse.writeHead(501, {"Content-Type": "application/json"});
//      if(r.er && r.er.ec && r.er.ec>1000){
//        r.er.em='Server poblem....';
//      }
//      paramResponse.end(JSON.stringify(r));
//    });
  });
  serviceManagementRouter.get('/servicepointtypes.json', function(paramRequest, paramResponse, paramNext){
//    var m = {
//      "ns":"smm",
//      "op": "servicesByCreator",
//      "pl": {
//        "userAccountID":paramRequest.user.id
//      }
//    };
//    esbMessage(m)
//    .then(function(r) {
      var r = {err:null,pl:['servicepoint type one','servicepoint type two']};
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(r));
//    })
//    .fail(function(r) {
//      paramResponse.writeHead(501, {"Content-Type": "application/json"});
//      if(r.er && r.er.ec && r.er.ec>1000){
//        r.er.em='Server poblem....';
//      }
//      paramResponse.end(JSON.stringify(r));
//    });
  });
  serviceManagementRouter.post('/newservicepoint.json', function(paramRequest, paramResponse, paramNext){
    var m;
    var servicePoint;
    q().then(function(){
      servicePoint = JSON.parse(paramRequest.body.json);
      console.log(servicePoint);
      return {
        "ns":"smm",
        "op": "createServicePoint",
        "pl": {
          "userid":paramRequest.user.id,
          servicePointCode:servicePoint.servicePointCode,//these should not be set for new unless youre an admin and can approve immediately
          servicePointStatus:servicePoint.servicePointStatus,//same as code
          servicePointName:servicePoint.servicePointName,
          servicePointAddress:servicePoint.servicePointAddress,
          servicePointType:servicePoint.servicePointType,
          operatingHours:servicePoint.operatingHours,
          contactPerson:servicePoint.contactPerson,
          contactPhone:servicePoint.contactPhone,
          servicePointDescription:servicePoint.servicePointDescription
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


        
        