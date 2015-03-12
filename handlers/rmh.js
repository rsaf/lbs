//All lanID specific business logics for the user notification module (message distribution module) are handle here

var oHelpers= require('../utilities/helpers.js');
var Q = require('q');
module.exports = function(paramService, esbMessage){
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
  var requestRouter = paramService.Router();
  function prepareTransaction(loginName,orgid,description,modules){
    var m={};
    return Q().then(function(){
      m.op = "createTransaction";
      m.pl={
        loginName:loginName
        ,currentOrganization:orgid
        ,transaction:{
          description:description
          ,modules:modules
        }
      };
      return esbMessage(m)
    });
  }
  function _getRequestMessages(req,filter){
    //get the admin id
    return Q().then(function(){
      if(req.user.userType==='admin'){
        return esbMessage({op:'getOrganization',pl:{org:'lanzheng'}});
      }
      return {pl:{oID:null}};
    })
    .then(function(msg){
      var m = {
        op:'rmm_getRequests',
        pl:{loginName:req.user.lanzheng.loginName,orgid:req.user.currentOrganization,filter:filter}
      }
      return esbMessage(m)      
    });
  }  
  
  requestRouter.put ('/request.json', function(paramRequest, paramResponse, paramNext){//update request
    //Update the request
    var query = {};
    var m = {};
    var r={};
    var mods=['rmm'];
    var transactionid;
    Q().then(function(){//get the request message
      if(typeof paramRequest.body._id!=='undefined'){
        query._id=paramRequest.body._id;
      }
      m.op = "rmm_getRequest";
      m.pl= {
        "query":query
      };
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      return esbMessage(m);
    })
    .then(function(msg){//use the request message mod property to create a transaction (mod contains the module involved in this request and the module that handles updating the status of the entity)
      var i = msg.pl.ei.length;
      while(--i>-1){
        mods.push(msg.pl.ei[i].mod);
      }
      return prepareTransaction(paramRequest.user.lanzheng.loginName,paramRequest.user.currentOrganization,'Update request message and entity',mods)
    })
    .then(function(msg){//updte the request message
      m.op= "rmm_updatRequestMessage";
      m.pl.transactionid=msg.pl.transaction._id;
      transactionid=msg.pl.transaction._id;
      m.pl.status = paramRequest.body.status;
      m.pl.refuseInfo = paramRequest.body.refuseInfo;
      return esbMessage(m);
    })
    .then(function(ret) {
      r=ret;m={};
      var i = r.pl.ei.length,promises=[];
      while(--i>-1){
        m.op=r.pl.ei[i].mod+ '_updateStatus'
        m.pl={
          ei:r.pl.ei[i].ei
          ,col:r.pl.ei[i].col
          , status:paramRequest.body.status
          , transactionid:transactionid
        };
        promises.push(esbMessage(m));
      }
      return Q.all(promises);
    }).then(function(ret) {
      _commitTransaction({pl:{transactionid:transactionid}});
      var m = {
        ns: 'mdm',
        vs: '1.0',
        op: 'sendNotification',
        pl: {
             recipients:[{
                 inmail:{to:r.pl.rsu}
             }],
             notification:{
              from:paramRequest.user.lanzheng.loginName,
              subject:r.pl.rt,
              body:r.pl.rb,
              notificationType:'type of notification'}
        }};
        esbMessage(m);
        paramResponse.writeHead(200, {"Content-Type": "application/json"});
        paramResponse.end(JSON.stringify(r));
    })
    .fail(function(r) {
      //@todo: tell the modules to roll back
      var i = mods.length,promises=[];
      var m = {pl:{transactionid:transactionid}};
      while(--i>-1){
        m.op = mods[i] + '_rollback';
        promises.push((function(msg){
          return esbMessage(msg);
        }(m)));
      }
      Q.all(promises)
      .then(function(){
        _rollBackTransaction({pl:{transactionid:transactionid}});
      })
      .fin(function(){
        paramResponse.writeHead(501, {"Content-Type": "application/json"});
        if(r.er && r.er.ec && r.er.ec>1000){
          r.er.em='Server poblem....';
        }
        paramResponse.end(JSON.stringify(r));
      });
    });
  });
  requestRouter.get ('/request.json', function(paramRequest, paramResponse, paramNext){
    var query = {};
    if(typeof paramRequest.query._id!=='undefined'){
      query._id=paramRequest.query._id;
    }
    var m = {
      "op": "rmm_getRequest",
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
  requestRouter.get('/:requestType.json', function(paramRequest, paramResponse, paramNext){
        var promise;
        if (paramRequest.params.requestType === 'all'){
            promise = _getRequestMessages(paramRequest,{});
        }
        else if(paramRequest.params.requestType === 'approved'){
            promise = _getRequestMessages(paramRequest,{rs:30});
        }

        else if(paramRequest.params.requestType === 'rejected'){
            promise = _getRequestMessages(paramRequest,{rs:40});
        }

        else if(paramRequest.params.requestType === 'unprocess'){
            promise = _getRequestMessages(paramRequest,{rs:10});
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