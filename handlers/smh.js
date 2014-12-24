/**
 * Created by LBS006 on 12/3/14.
 */
var q = require('q');

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


        //createServicePoint
  return serviceManagementRouter;
};