/**
 * Created by LBS006 on 12/3/14.
 */


module.exports = function(paramService,  esbMessage){
  var serviceManagementRouter = paramService.Router();
  serviceManagementRouter.post('/newservice.json', function(paramRequest, paramResponse, paramNext){
    var m = {
      "ns":"smm",
      "op": "createService",
      "userid":paramRequest.user.id,//better not have the userid in the payload or it gets saved
      "pl": {
      //  organisationid:'',
      //  groupName: String, //groupName
      //  description: String,
      //  memberCount: Number,
      //  serviceCode: String,
      //  serviceName:String,
      //  serviceType:String,
      //  serviceProvider:String,
      //  price:Number,
        briefOverview:'hello'
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

  return serviceManagementRouter;
};