//All lanID specific business logics for the user notification module (message distribution module) are handle here

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

var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage)
{
  var requestRouter = paramService.Router();
  function _getRequestMessages(req,filter){
    var m = {
      op:'rmm_getRequests',
      pl:{userid:'000000000000000000000009'}
    }
    return esbMessage(m)
  }
  requestRouter.get('/:requestType.json', function(paramRequest, paramResponse, paramNext){
    //console.log('get all json called  ');
        var promise;
        if (paramRequest.params.requestType === 'all'){
            promise = _getRequestMessages(paramRequest,{});
        }
        else if(paramRequest.params.requestType === 'approved'){
            oHelpers.sendResponse(paramResponse,200,approved);
        }

        else if(paramRequest.params.requestType === 'rejected'){
            oHelpers.sendResponse(paramResponse,200,rejected);
        }

        else if(paramRequest.params.requestType === 'unprocess'){
            oHelpers.sendResponse(paramResponse,200,unprocess);
        }
        if(promise){
          promise.then(function(msg) {
            paramResponse.writeHead(200, {"Content-Type": "application/json"});
            paramResponse.end(JSON.stringify(msg));
          })
          .fail(function(r) {
            paramResponse.writeHead(501, {"Content-Type": "application/json"});
            if(r.er && r.er.ec && r.er.ec>1000){
              r.er.em='Server poblem....';
            }
            paramResponse.end(JSON.stringify(r));
          });
        }



        /*
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
        */

  });

  return requestRouter;
};


var all = {
    "pl": [{"code":"all data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"待审批"},{"code":"L0121210120","plotting":"申请银盾","period":"2014-08-05 12:23:46","applicant":"李丽","status":"待审批"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"已拒绝"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"已通过"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 12:43:11","applicant":"周林","status":"已通过"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
};

var approved = {
    "pl": [{"code":"approved data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"已通过"},{"code":"L0121210120","plotting":"申请银盾","period":"2014-08-05 12:23:46","applicant":"李丽","status":"已通过"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"已通过"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"已通过"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
};

var rejected = {
    "pl": [{"code":"rejected data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"拒绝"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"已拒绝"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"已拒绝"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
};

var unprocess = {
    "pl": [{"code":"unprocess data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"待审批"},{"code":"L0121210120","plotting":"申请银盾","period":"2014-08-05 12:23:46","applicant":"李丽","status":"待审批"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"待审批"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"待审批"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 12:43:11","applicant":"周林","status":"待审批"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
};