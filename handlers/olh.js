//All lanID specific business logics for the loging module are handle here
/*
 var m = {
 "ns":"olm",
 "op": "readOperationsLog",
 "pl": {"userAccountID": "value1", "opType":"value2", "pageNumber":"value3", "pageSize":"value4"}
 };

 var r = {
 "er":"value",
 "pl": "value",
 "mv": null
 }
 */


module.exports = function(paramService, esbMessage)
{
  var operationsLogRouter = paramService.Router();

  operationsLogRouter.get('/:type.json', function(paramRequest, paramResponse, paramNext){

    //console.log('get all json called  ');

      var type = paramRequest.params.type;

      console.log('type--',type);

      var m = {
          "ns":"olm",
          "op": "readOperationsLog",
          "pl": {"userAccountID":paramRequest.user.id, "opType":null},
          "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}
      };


      if(type === 'business'){
          m.opType = '业务操作';
      }
      else if(type === 'access'){
          m.opType = '授权操作';
      }

    esbMessage(m)
        .then(function(r) {
          paramResponse.writeHead(200, {"Content-Type": "application/json"});
          paramResponse.end(JSON.stringify(r));
        })
        .fail(function(r) {

        });

  });

  return operationsLogRouter;
};