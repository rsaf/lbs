//All lanID specific business logics for the user notification module (message distribution module) are handle here

var oHelpers= require('../utilities/helpers.js');
var Q = require('q');
var lib = require('lib');
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
    var workflowManager = new lib.WorkflowManager({
            esbMessage: esbMessage,
            commitTransaction: _commitTransaction,
            rollbackTransaction: _rollBackTransaction}
    );
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
      var m = {
        op:'rmm_getRequests',
        pl:{loginName:req.user.lanzheng.loginName,currentOrganization:req.user.currentOrganization,orgid:req.user.currentOrganization,filter:filter},
        mt: {p:req.query.p,ps:req.query.ps,sk:req.query.sk,sd:req.query.sd, ed:req.query.ed}
      }
      return esbMessage(m);
    });
  }  
  /**
   * put request request.body.json = json string containing a request object
   */
  requestRouter.put ('/request.json', function(paramRequest, paramResponse, paramNext){//update request
    //Update the request
    var request;
    var m = {};
    var mods=['rmm'];
    var transactionid;
    var dbRequest;
    var wasUPM = undefined;
    Q().then(function(){//get the request message
      m = JSON.parse(paramRequest.body.json);
      request=m.pl.request;
      m.op = "rmm_getRequest";
      m.pl.query={_id:request._id};
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      return esbMessage(m);
    })
    .then(function(msg){//use the request message mod property to create a transaction (mod contains the module involved in this request and the module that handles updating the status of the entity)
      var i = msg.pl.ei.length;
      if(request.rs){
        while(--i>-1){
          mods.push(msg.pl.ei[i].mod);
        }
      }
      return prepareTransaction(m.pl.loginName,m.pl.currentOrganization,'Update request message (and entity)',mods)
    })
    .then(function(msg){//updte the request message
      m.op= "rmm_persistRequestMessage";
      m.pl.transactionid=msg.pl.transaction._id;
      m.pl.loginName = paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization = paramRequest.user.currentOrganization;
      return esbMessage(m);
    })
    .then(function(msg){
        dbRequest = msg;
        if(dbRequest._doc && dbRequest._doc.rtr == "Response" &&
            dbRequest._doc.ei && dbRequest._doc.ei.length>0 && dbRequest._doc.ei[0].ei !== undefined) {
            return esbMessage({
                "ns":"bmm",
                "op":"bmm_getResponse",
                "pl":{
                    code : dbRequest._doc.ei[0].ei,
                    loginName : paramRequest.user.lanzheng.loginName,
                    currentOrganization : paramRequest.currentOrganization
                }
            })
        }
        else return undefined;
    })
    .then(function(ret) {
      //dbRequest=ret;
      if(!request.rs){
        return;
      }
      var i = dbRequest.ei.length,promises=[];
      while(--i>-1){
          //todo : special casing corporate validation activity....
          if(dbRequest.ei[i].mod == "upm")
          {
              wasUPM = {idx:i,rc:ret.rc,sc:"LZS103"};
          }
          //end todo
        m.op=dbRequest.ei[i].mod+ '_updateStatus'
          console.log("current user:",paramRequest.user.lanzheng.loginName,paramRequest.user.currentOrganization);
        m.pl={
          ei:dbRequest.ei[i].ei
          ,col:dbRequest.ei[i].col
          , status:request.rs
          , transactionid:m.pl.transactionid
          , response : ret
          , loginName: paramRequest.user.lanzheng.loginName
          , currentOrganization: paramRequest.user.currentOrganization
        };
        promises.push(esbMessage(m));
      }
      return Q.all(promises);
    })
    .then(function(ret) {
            if(dbRequest._doc && dbRequest._doc.rtr == "Activity" && //request is an activity publish request
                dbRequest._doc.ei && dbRequest._doc.ei.length>0 && dbRequest._doc.ei[0].ei !== undefined) //publish request has an activity code
            {
                //pregenerate responses if they exist
                console.log('Proceeding to pregenerate responses');
                var m_p = {
                    ns: 'bmm',
                    op: 'bmm_import_responses_data',
                    activityCode: dbRequest._doc.ei[0].ei,
                    pl: {
                        loginName: m.pl.loginName,
                        currentOrganization: m.pl.currentOrganization
                    },
                    transactionid: m.pl.transactionid
                };
                esbMessage(m_p)
                    .then(function onResolve(r){
                        console.log("Resolved response pregeneration with response: ",r);
                        return ret;
                    },function onRejected(r){
                        console.log("Failed response pregeneration with respnose: ",r);
                        return ret;
                    });
            }
            else return true;
    })
    .then(function(){
        if(wasUPM !== undefined)
        {
            return workflowManager.completeService(wasUPM.rc,wasUPM.sc,{},paramRequest.user,"DO_NEXT");
        }
    })
    .then(function(ret) {
      return _commitTransaction({pl:{transactionid:m.pl.transactionid}});
    })
    .then(function(ret) {
      if(!request.rs){
        return;
      }
      var m = {
        ns: 'mdm',
        vs: '1.0',
        op: 'sendNotification',
        pl: {
             recipients:[{
                 inmail:{to:dbRequest.rsu}
             }],
             notification:{
              from:paramRequest.user.lanzheng.loginName,
              subject:dbRequest.rt,
              body:dbRequest.rb,
              notificationType:'申请通知'}
        }};
        esbMessage(m);
    })
    .then(
      function resolve(ret) {
        //paramResponse.writeHead(200, {"Content-Type": "application/json"});
        //paramResponse.end(JSON.stringify(dbRequest));
          oHelpers.sendResponse(paramResponse, 200, dbRequest);
      },function reject(r) {
        //tell the modules to roll back
        if(r.er && r.er.ec && r.er.ec>1000){
            r.er.em='Server poblem....';
        }
        //paramResponse.end(JSON.stringify(r));
        oHelpers.sendResponse(paramResponse, 501, r);

        var i = mods.length,promises=[];
        var m = {pl:{transactionid:m.pl.transactionid}};
        while(--i>-1){
          m.op = mods[i] + '_rollback';
          promises.push((function(msg){
            return esbMessage(msg);
          }(m)));
        }
        Q.all(promises)
        .then(function(){
          _rollBackTransaction({pl:{transactionid:m.pl.transactionid}});
        })
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
        "query":query,
        loginName:paramRequest.user.lanzheng.loginName,
        currentOrganization: paramRequest.user.currentOrganization
      }
    };
    esbMessage(m)
    .then(function(r) {
      //paramResponse.writeHead(200, {"Content-Type": "application/json"});
      //paramResponse.end(JSON.stringify(r));
     oHelpers.sendResponse(paramResponse, 200, r);
    })
    .fail(function(r) {
      //paramResponse.writeHead(501, {"Content-Type": "application/json"});
      if(r.er && r.er.ec && r.er.ec>1000){
        r.er.em='Server poblem....';
      }
      //paramResponse.end(JSON.stringify(r));
      oHelpers.sendResponse(paramResponse, 501, r);
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
            //paramResponse.writeHead(200, {"Content-Type": "application/json"});
            //paramResponse.end(JSON.stringify(msg));
              oHelpers.sendResponse(paramResponse, 200, msg);
          })
          .fail(function(r) {
            //paramResponse.writeHead(501, {"Content-Type": "application/json"});
            if(r.er && r.er.ec && r.er.ec>1000){
              r.er.em='Server poblem....';
            }
            //paramResponse.end(JSON.stringify(r));
          oHelpers.sendResponse(paramResponse, 501, r);
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


//var all = {
//    "pl": [{"code":"all data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"待审批"},{"code":"L0121210120","plotting":"申请银盾","period":"2014-08-05 12:23:46","applicant":"李丽","status":"待审批"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"已拒绝"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"已通过"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 12:43:11","applicant":"周林","status":"已通过"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
//};
//
//var approved = {
//    "pl": [{"code":"approved data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"已通过"},{"code":"L0121210120","plotting":"申请银盾","period":"2014-08-05 12:23:46","applicant":"李丽","status":"已通过"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"已通过"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"已通过"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
//};
//
//var rejected = {
//    "pl": [{"code":"rejected data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"拒绝"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"已拒绝"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"已拒绝"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
//};
//
//var unprocess = {
//    "pl": [{"code":"unprocess data","plotting":"拍摄码申请","period":"2014-08-05 12:23:16","applicant":"王大力","status":"待审批"},{"code":"L0121210120","plotting":"申请银盾","period":"2014-08-05 12:23:46","applicant":"李丽","status":"待审批"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 11:23:13","applicant":"孙悟空","status":"待审批"},{"code":"L0121210120","plotting":"服务代码申请","period":"2014-08-05 12:13:36","applicant":"黄蓉","status":"待审批"},{"code":"L0121210120","plotting":"申请接口开通","period":"2014-08-05 12:43:11","applicant":"周林","status":"待审批"},{"code":"","plotting":"","period":"","applicant":"","status":""},{"code":"","plotting":"","period":"","applicant":"","status":""}]
//};