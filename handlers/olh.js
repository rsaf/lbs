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

  operationsLogRouter.get('/all.json', function(paramRequest, paramResponse, paramNext){

    //console.log('get all json called  ');

    var m = {
      "ns":"olm",
      "op": "readOperationsLog",
      "pl": {"userAccountID":paramRequest.user.id, "opType":null, "pageNumber":1, "pageSize":10}
    };

    esbMessage(m)
        .then(function(r) {
          paramResponse.writeHead(200, {"Content-Type": "application/json"});
          paramResponse.end(JSON.stringify(r));
        })
        .fail(function(r) {

        });

  });

  operationsLogRouter.get('/business.json', function(paramRequest, paramResponse, paramNext){
    //console.log('get business json called  ');

    var m = {
      "ns":"olm",
      "op": "readOperationsLog",
      "pl": {"userAccountID":paramRequest.user.id, "opType":"业务操作", "pageNumber":1, "pageSize":10}
    };

    esbMessage(m)
        .then(function(r) {
          //console.log(r.pl);
          paramResponse.writeHead(200, {"Content-Type": "application/json"});
          paramResponse.end(JSON.stringify(r));
        })
        .fail(function(r) {
          console.log(r.er);
        });

  });

  operationsLogRouter.get('/access.json',function(paramRequest, paramResponse, paramNext){
    //console.log('get access json called  ');

    var m = {
      "ns":"olm",
      "op": "readOperationsLog",
      "pl": {"userAccountID":paramRequest.user.id, "opType":"授权操作", "pageNumber":1, "pageSize":10}
    };

    esbMessage(m)
        .then(function(r) {
          //console.log(r.pl);
          paramResponse.writeHead(200, {"Content-Type": "application/json"});
          paramResponse.end(JSON.stringify(r));
        })
        .fail(function(r) {
          console.log(r.er);
        });


  });

  return operationsLogRouter;
};