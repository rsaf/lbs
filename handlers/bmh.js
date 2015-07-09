/**
 * endpoints for /workspace/activities
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
    //forcing push


// workspace/activities.old
var oHelpers= require('../utilities/helpers.js');
var formidable = require('formidable');
var fs = require('fs');
var q = require('q');
var lib = require('lib');

function _initRequestMessage(paramRequest,type,code,adminOrg,orgName){
  var col,mod='bmm',
    message,url;
  if(type==='Activity'){
    col='activities';
    url='/workspace/publishing/activities';
    message="事务";
  }
  return {
    rdo: adminOrg
    ,rc: 'code'
    ,rt: message + '申请 ' + code
    ,rsu: paramRequest.user.lanzheng.loginName
    ,rso: paramRequest.user.currentOrganization
    ,ric:orgName||''
    ,rs: 10
    ,rb: '请审核'+message+'申请，拼同意或者拒绝'
    ,rtr: type
    ,ei:[{
        col:col
        ,mod:mod
        ,ei:code
    }]
    ,url:url
  };
}


module.exports = function(paramService, esbMessage){
  function _commitTransaction(m){
    m.pl.transaction = {
      _id:m.pl.transactionid
    };
    m.op='commitTransaction';
    return esbMessage(m);
  }
  function _rollBackTransaction(m){
    return q()
    .then(function(){
        return q.all([
          esbMessage({op:'wmm_rollBackTransaction',pl:{transaction:{_id:m.pl.transactionid}}})
          ,esbMessage({op:'rmm_rollback',pl:{transactionid:m.pl.transactionid}})
          ,esbMessage({op:'bmm_rollback',pl:{transactionid:m.pl.transactionid}})
        ]);
    })
    .then(function(){
      return q.resolve('ok');
    })
    .then(null,function reject(err){
      return q.reject('In bmh _rollBackTransaction:',err);
    });
  }

  function _persistForm(paramRequest, paramResponse){
    var m = {};
    //formHtml
    q().then(function(){
      m.pl=JSON.parse(paramRequest.body.json);
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      m.op='bmm_persistForm';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  }
  function _persistActivity(paramRequest, paramResponse){
    var m = {},response={}
      ,activity,adminid;


      var bodyJson = JSON.parse(paramRequest.body.json);
      var company = bodyJson.company;



    //formHtml
    q().then(function(){
      m.pl=JSON.parse(paramRequest.body.json).pl;
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      if(m.pl.activity && m.pl.activity.abd && m.pl.activity.abd.aps && parseInt(m.pl.activity.abd.aps,10)===10){
        // create a transaction
        m.op = "createTransaction";
        m.pl.transaction={
          description:'publish Activity request'
          ,modules:['bmm','rmm']
        };
        return q.all([esbMessage(m), esbMessage({op:'getOrganization',pl:{org:'lanzheng'}})]);
      }
      return [false,false];
    })
    .then(function(msg){
      m.pl.transactionid=(msg[0]===false)?false:msg[0].pl.transaction._id;
      adminid=(msg[1]===false)?false:msg[1].pl.oID;
      m.op='bmm_persistActivity';
      return esbMessage(m);
    })
    .then(function(msg){
      activity = msg;
      if(m.pl.transactionid){
        m.op="rmm_persistRequestMessage";
        m.pl.request = _initRequestMessage(paramRequest,'Activity',activity.abd.ac,adminid,company);//org should be admin org
        return esbMessage(m);
      }
      return false;
    })
    .then(function(){
      if(m.pl.transactionid){
        return _commitTransaction(m);
      }
    })
    .then(function(){      
      oHelpers.sendResponse(paramResponse,200,{pl:activity}); 
    })
    .fail(function(er){
      var trans=q();
      if(m.pl.transactionid){
        trans = _rollBackTransaction(m);
      }
      trans.fin(function(){
        oHelpers.sendResponse(paramResponse,501,er);
      });      
    });    
  }
  function _persistRespose(req, res,pnext){
    var m = {},transactionid=false,response={};
    //formHtml
      console.log('persisting response',req.body.json);
    q().then(function(){
      m.pl=JSON.parse(req.body.json).pl;
      // is user not set then use req.sessionID
      m.pl.loginName=(req.user&&req.user.lanzheng&&req.user.lanzheng.loginName)||req.sessionID;
      m.pl.currentOrganization=(req.user&&req.user.currentOrganization)||false;
      m.op='bmm_persistResponse';
      return esbMessage(m);
    })
    .then(
      function resolve(msg){
        oHelpers.sendResponse(res,200,msg); 
      },function fail(er){
        oHelpers.sendResponse(res,501,er);
      }
    );
  }

    var workflowManager = new lib.WorkflowManager({
            esbMessage: esbMessage,
            commitTransaction: _commitTransaction,
            rollbackTransaction: _rollBackTransaction}
    );

  var bmRouter = paramService.Router();
  bmRouter.get('/listtemplate.json', function(paramRequest, paramResponse, paramNext){
        //http://localhost/files/7ab7a057-b10f-47d1-9967-f5b11b625b9b.xlsx
        var m = {pl:{}};
        q().then(function(){
            m.pl.fileType=paramRequest.query.ft?paramRequest.query:"xlsx"
            m.pl.formID=paramRequest.query.fid;
            m.pl.loginName=(paramRequest.user&&paramRequest.user.lanzheng&&paramRequest.user.lanzheng.loginName)||paramRequest.sessionID;
            m.pl.currentOrganization=(paramRequest.user&&paramRequest.user.currentOrganization)||false;
            m.op='bmm_get_list_template';
            return esbMessage(m);
        }).then(function(msg){
            oHelpers.sendResponse(paramResponse,200,msg);//"http://localhost/files/7ab7a057-b10f-47d1-9967-f5b11b625b9b.xlsx");
        }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);
        });
    })

  bmRouter.post('/form.json', function(paramRequest, paramResponse, paramNext){
    _persistForm(paramRequest, paramResponse, paramNext);
  });
  bmRouter.put('/form.json', function(paramRequest, paramResponse, paramNext){
    _persistForm(paramRequest, paramResponse, paramNext);
  });
  //query for responses (default where response.ow.uid = login user or ow.oid = the current organisation of user
  bmRouter.get('/response.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    q().then(function(){
      m.pl={code:paramRequest.query.code};
      m.pl._id=paramRequest.query._id;
      m.op='bmm_getResponse';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,{pl:msg});
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });    
  });
    bmRouter.get('/:activity_code/getUserMetaZipUploaded.json', function(paramRequest, paramResponse, paramNext){
        var m = {
            ns : "bmm",
            op : "bmm_getUserMeta",
            pl : {
                ac_code : paramRequest.params.activity_code
            }
        }
        return esbMessage(m).then(function(doc){
            oHelpers.sendResponse(paramResponse,200,{pl:doc});
        })
    })
    bmRouter.get('/:activity_code/:zipuri/generateResponses.json', function(paramRequest, paramResponse, paramNext){
      var m = {},transactionid=false,response={};
      //formHtml
      q().then(function(){
        m.pl=JSON.parse(paramRequest.body.json).pl;
        // is user not set then use req.sessionID
        m.pl.activityCode=paramRequest.params.activity_code;
        m.pl.zipuri=paramRequest.params.zipuri;
        m.pl.loginName=(paramRequest.user&&paramRequest.user.lanzheng&&paramRequest.user.lanzheng.loginName)||paramRequest.sessionID;
        m.pl.currentOrganization=(paramRequest.user&&paramRequest.user.currentOrganization)||false;
        m.op='bmm_import_response_data';
        return esbMessage(m);
      })
      .then(
        function resolve(msg){
          oHelpers.sendResponse(res,200,msg); 
        },function fail(er){
          oHelpers.sendResponse(res,501,er);
        }
      );
    });

    bmRouter.post('/:activity_code/:doctype/uploadResponses.json', function (paramRequest, paramResponse, paramNext) {

        console.log('bmh  uploading document-----');

        var m = {ns: 'bmm',op:'bmm_upload_respondents_list', pl: null, ac:paramRequest.params.activity_code};

        m.pl = {
            fp:{
                fn: null,
                ft: null,
                rm: null,
                fs: null,
                fm: null,
                uri: null
            },
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            fd:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {


            var fileInfo = JSON.parse(fields.fileInfo);
            console.log('files: ',files);
            console.log('fields----', fileInfo);

            var old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                file_name =files.file.name;

                console.log('file name:---',file_name);


            fs.readFile(old_path, function(err, data) {
                m.pl.fp.fn = file_name;
                m.pl.fp.ft = paramRequest.params.doctype;
                m.pl.fp.rm  = fileInfo.description;
                m.pl.fp.fs = file_size;
                m.pl.fp.fm = file_ext;
                m.pl.fd = data;
                console.log('uploading response lists ...', m.pl);
                esbMessage(m)
                    .then(function setMassProcessable(){
                        var activity;
                        return esbMessage({
                            "ns":"bmm",
                            "op":"bmm_getActivity",
                            "pl":{
                                code : paramRequest.params.activity_code
                            }
                        }).then(function(act){
                            activity = act;
                            return esbMessage({
                                "ns":"smm",
                                "op":"smm_queryServices",
                                "pl":{
                                    query : act.sqc
                                }
                            })
                        }).then(function(services){
                            var processable = services.pl.results.length == 1 && services.pl.results[0].reduce(function(agg, val){
                                var sc = val.service.serviceCode;
                                return agg && (sc == "LZS101" || sc == "LZS102" ? true : false);
                            },true);
                            return esbMessage({
                                "ns":"bmm",
                                "op":"bmm_setMassProcessable",
                                "pl": {
                                    code : paramRequest.params.activity_code,
                                    value : processable
                                }
                            })
                        })
                    })
                    .then(function returnExcelHeadersToChooseFrom(usersmetaobject){
                        return esbMessage({
                            "ns":"bmm",
                            "op":"bmm_getExcelHeadersFromUnzipped",
                            "pl":{
                                ac : paramRequest.params.activity_code
                            }
                        })
                    })
                    .then(function (r) {
                        oHelpers.sendResponse(paramResponse, 200, {pl:r,er:null});
                    })
                    .fail(function (r) {
                        console.log('bmh error-----:',r);
                        var r = {pl: null, er: {ec: 404, em: "could not save document"}};
                        oHelpers.sendResponse(paramResponse, 404, r);
                    });
            });
        });

    });

    bmRouter.post('/processAllResponses/:activity_code.json', function(paramRequest, paramResponse, paramNext){
        var responses = undefined;
        var activity = undefined;
        var services = undefined;
        return esbMessage({
            "ns":"bmm",
            "op":"bmm_getAllResponsesForActivity",
            "pl":{
                code : paramRequest.params.activity_code
            }
        })
        .then(function(r){
            responses = r;
            return esbMessage({
                "ns":"bmm",
                "op":"bmm_getActivity",
                "pl":{
                    code : paramRequest.params.activity_code
                }
            })
        })
        .then(function(r){
            activity = r;
            if(!activity || !activity.abd || !activity.abd.mass)
                throw "Mass processing not allowed for activity"+JSON.stringify(activity.abd)
            return esbMessage({
                "ns":"smm",
                "op":"smm_queryServices",
                "pl":{
                    query: activity.sqc
                }
            })
        })
        .then(function(r){
            services = r.pl.results;
            services = services.map(function(arr,idx){
                if(arr.length < 1) return undefined;
                var first = arr[0];
                first.sq = idx;
                return first;
            })
            var persistServicesArray = [];
            for(var i = 0; i < responses.length; i ++)
            {
                if(responses[i].sb.length > 0) continue; //Don't push service choice on responses that are already begun
                for(var j = 0; j < 1; j ++)
                {
                    var priceList = services[j]
                    var objToSend = {
                        plid: priceList._id,
                        svid: priceList.service._id,
                        svn: priceList.serviceName.text,
                        snid: priceList.serviceName._id,
                        svp: priceList.servicePrices,
                        sdp: priceList.discountedPrice,
                        spn: priceList.servicePoint.servicePointName,
                        spid: priceList.servicePoint._id,
                        spc: priceList.servicePoint.ct.oID,
                        serviceCode : priceList.service.serviceCode,
                        sq : j,
                        spm : priceList.paymentMethod[0]
                    };
                    persistServicesArray.push(esbMessage({
                        "ns":"bmm",
                        "op":"bmm_persistResponse",
                        "pl":{
                            response : {
                                sb : objToSend,
                                _id : responses[i]._id
                            }
                        }
                    }))
                }
            }
            return q.all(persistServicesArray)
        })
        .then(function(r){
            console.log("FOUND ",r.length,"PROCESSES FOR",paramRequest.params.activity_code);
            var batchSize = 1,
                rcBatchArray = [],
                promise = q();

            for(var i = 0, b = -1; i < responses.length; i++)
            {
                if(i % batchSize == 0) {
                    rcBatchArray[++b] = [];
                }
                rcBatchArray[b].push(responses[i].rc);
            }
            for(var b = 0; b < rcBatchArray.length; b++)
            {
                var k = b;
                promise = promise.then(function(){
                    var batchpromise = rcBatchArray[k].map(function(rc){
                        return workflowManager.scheduleService(rc,{}, paramRequest.user)
                            .then(function(r){
                                if(r.pl && r.pl.IS_COMPLETE) return;
                                return esbMessage({
                                    "ns":"bmm",
                                    "op":"bmm_logResponseOnActivity",
                                    "pl":{
                                        code:paramRequest.params.activity_code,
                                        stat:"completed"
                                    }
                                })
                            })
                    })
                    return q.all(batchpromise)
                })
            }
            return promise;
        }).then(function(alldone){
            console.log("all done");
            oHelpers.sendResponse(paramResponse,200,{pl:{},er:null});
        }  ,  function(err){
            console.log(err);
            oHelpers.sendResponse(paramResponse,501,{pl:null,er:err});
        })
    })
    bmRouter.get('/activityResponseDownload/:activity_code.json', function(paramRequest, paramResponse, paramNext){
        var ac = paramRequest.params.activity_code;
        var headers;
        q().then(function() {
            return esbMessage({
                "ns": "bmm",
                "op": "bmm_getActivity",
                "pl": {
                    code: ac
                }
            })
        }).then(function(activity){
            if(!activity) throw "No activity found with activity code"+ac;
            return esbMessage({
                "ns":"bmm",
                "op":"bmm_getFormMeta",
                "pl":{
                    fc:activity.fm.fc,
                    loginName: paramRequest.user.lanzheng.loginName,
                    currentOrganization: paramRequest.user.currentOrganization
                }
            })
        }).then(function(formmeta) {
            if (!formmeta) throw "No Form Meta found for activity " + ac
            var fields = formmeta.fd.fields.map(function (ele) {
                return ele.nm
            })

            var uniq = [];
            headers = fields.map(function (f) {
                if (uniq.indexOf(f) < 0) {
                    uniq.push(f)
                    return f;
                }
            }).filter(function (n) {
                return n != undefined
            });
            return esbMessage({
                "ns":"bmm",
                "op":"bmm_getAllResponsesForActivity",
                "pl":{
                    code : ac
                }
            });
        }).then(function uniqueHeaders(responses){
            var headerMap = headers.map(function(val){
                return {
                    name : val,
                    uniqs : [],
                    isUniq : true
                }
            })
            for(var i = 1; i < responses.length; i ++)
            {
                for(var h = 0; h < headerMap.length; h++)
                {
                    var responseQuery = responses[i].fd.fields[headerMap[h].name]
                    for (var q = 0; headerMap[h].isUniq && q < headerMap[h].uniqs.length; q++) {
                        if (headerMap[h].uniqs[q] == responseQuery) {
                            headerMap[h].isUniq = false;
                        }
                    }
                    headerMap[h].uniqs.push(responseQuery);
                }
            }
            headerMap.push({name:'rc',isUniq:true})
            return headerMap.map(function(val){return val.isUniq?val.name:undefined;}).filter(function(val){return val !== undefined});
        }).then(function(radioFieldOptions){
            oHelpers.sendResponse(paramResponse,200,{pl:radioFieldOptions});
        }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);
        })
    })

    bmRouter.get('/activityResponseDownload/:field/:activity_code.json', function(paramRequest, paramResponse, paramNext){
        var m = {};
        q().then(function(){
            //paramRequest.query.code
            console.log("Retrieved activity code in download as ",paramRequest.params.activity_code);
            m.pl={ac:paramRequest.params.activity_code,tgtField:paramRequest.params.field};
            m.op='bmm_download_activity_data';
            return esbMessage(m);
        }).then(function(msg){
            oHelpers.sendResponse(paramResponse,200,{pl:msg});
        }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);
        });
    });

    bmRouter.get('/activityResponseUpload/:field/:activity_code.json', function(paramRequest, paramResponse, paramNext){
        //Associate chosen :field in uploaded excel with the formMeta object for this :activity
        console.log("HIT THE ENDPOINT FOR UPLOADING FIELD TO META WITHPARAMS = ",paramRequest.params);
        return esbMessage({
                "ns":"bmm",
                "op":"bmm_associateUniqueFieldWithFormMeta",
                "pl":{
                    ac : paramRequest.params.activity_code,
                    field : paramRequest.params.field
                }
        }).then(function(msg){
            oHelpers.sendResponse(paramResponse, 200, {pl:msg});
        }).fail(function(er){
            oHelpers.sendResponse(paramResponse, 501, er);
        });
    })

  bmRouter.get('/responses.json', function(paramRequest, paramResponse, paramNext){
    var m = {pl:{}};
    //formHtml
    q().then(function(){
      m.pl.loginName=(paramRequest.user&&paramRequest.user.lanzheng&&paramRequest.user.lanzheng.loginName)||paramRequest.sessionID;
      m.pl.currentOrganization=(paramRequest.user&&paramRequest.user.currentOrganization)||false;
      m.op='bmm_getResponses';
      m.mt={p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200, msg);
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });    
  });


    bmRouter.get('/responses/forms.json', function(paramRequest, paramResponse, paramNext){
        var m = {pl:{}};
        //formHtml
        q().then(function(){
            m.pl.loginName=(paramRequest.user&&paramRequest.user.lanzheng&&paramRequest.user.lanzheng.loginName)||paramRequest.sessionID;
            m.pl.currentOrganization=(paramRequest.user&&paramRequest.user.currentOrganization)||false;
            m.op='bmm_getAllForms';
            return esbMessage(m);
        }).then(function(msg){
            oHelpers.sendResponse(paramResponse,200,{pl:msg});
        }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);
        });
    });


  bmRouter.post('/response.json',function(req,res,pnext){
    _persistRespose(req,res,pnext);
  });
  bmRouter.put('/response.json',function(req,res,pnext){
    _persistRespose(req,res,pnext);
  });
  bmRouter.get('/activity.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    q().then(function(){
      m.pl={code:paramRequest.query.code};
      m.op='bmm_getActivity';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,{pl:msg});
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });    
  });
  bmRouter.get('/activities.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    q().then(function(){
      m.pl={loginName:paramRequest.user.lanzheng.loginName,currentOrganization:paramRequest.user.currentOrganization};
      m.op='bmm_getActivities';
      m.mt={p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}
      return esbMessage(m);
    })
    .then(function resolve(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    },function reject(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  });
  bmRouter.get('/public/activities.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    q().then(function(){
      m.pl={};
      m.op='bmm_getActivities';
      return esbMessage(m);
    }).then(function resolve(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    },function reject(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  });
  bmRouter.post('/activity.json', function(paramRequest, paramResponse, paramNext){
    _persistActivity(paramRequest, paramResponse, paramNext);
  });
  bmRouter.put('/activity.json', function(paramRequest, paramResponse, paramNext){
    _persistActivity(paramRequest, paramResponse, paramNext);
  });
   bmRouter.get('/:activitiesType.json', function(paramRequest, paramResponse, paramNext){
      if (paramRequest.params.activitiesType === 'activitieslist'){
          oHelpers.sendResponse(paramResponse,200,activitieslist);
      }
      else if(paramRequest.params.activitiesType === 'nameslist'){
          oHelpers.sendResponse(paramResponse,200,nameslist);
      }
      else if(paramRequest.params.activitiesType === 'activitiesforms'){
          oHelpers.sendResponse(paramResponse,200,activitiesforms);


      }
      else if(paramRequest.params.activitiesType === 'publicforms'){
          oHelpers.sendResponse(paramResponse,200,publicforms);
      }
      else if(paramRequest.params.activitiesType === 'serviceslist'){
          oHelpers.sendResponse(paramResponse,200,serviceslist);
      }
      else if(paramRequest.params.activitiesType === 'all'){
          oHelpers.sendResponse(paramResponse,200,all);
      }
      else if(paramRequest.params.activitiesType === 'conventional'){
          oHelpers.sendResponse(paramResponse,200,conventional);
      }
      else if(paramRequest.params.activitiesType === 'favorite'){
          oHelpers.sendResponse(paramResponse,200,favorite);
      }
      else if(paramRequest.params.activitiesType === 'agent'){
          oHelpers.sendResponse(paramResponse,200,agent);
      }
      else if(paramRequest.params.activitiesType === 'delegated'){
          oHelpers.sendResponse(paramResponse,200,delegated);
      }
  });

   bmRouter.get('/activityDetails/:activityDetail_id.json', function(paramRequest, paramResponse){

        var m = {
            "ns":"bmm",
            "op": "bmm_readActivityDetailByID",
            "pl":{ac:paramRequest.params.activityDetail_id}
        };


       if(paramRequest.user){

           m.pl.uID = paramRequest.user.lanzheng.loginName;
           m.pl.oID = paramRequest.user.currentOrganization;
       }


       console.log('paramRequest.params.activity_id-----------',paramRequest.params.activityDetail_id);


        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh----',r.er);
                r = {pl:null, er:{ec:404,em:"could not find activity detail page"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });


    bmRouter.get('/search/activityDetails/all.json', function(paramRequest, paramResponse){

        var m = {
            "ns":"bmm",
            "op": "bmm_readAllActivityDetails",
            "pl":{oID:paramRequest.user.currentOrganization
                ,uID: paramRequest.user.lanzheng.loginName
                ,pageSize:10
            }
        };

        console.log('bmm_readAllActivityDetailByID-----------');


        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh----',r.er);
                r = {pl:null, er:{ec:404,em:"could not find activity detail page"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });


    bmRouter.put('/activityDetails/:activityDetail_id.json', function(paramRequest, paramResponse){

        console.log('paramRequest.params.activityDetail_id',paramRequest.params.activityDetail_id);
        console.log('paramRequest.body',paramRequest.body);


        var m = {
            "ns":"bmm",
            "op": "bmm_updateActivityDetail",
            "pl":paramRequest.body
        };


        m.pl.acid = m.pl.acid._id;
        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;

        esbMessage(m)
            .then(function(r) {


                console.log('r',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail "}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.post('/activityDetails/faq.json', function(paramRequest, paramResponse){

        console.log('paramRequest.params.activityDetail_id',paramRequest.params.activityDetail_id);
        console.log('paramRequest.body',paramRequest.body);


        var m = {
            "ns":"bmm",
            "op": "bmm_updateActivityDetailFAQ",
            "pl":{}
        };


        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;
        m.pl.op = 'create';
        m.pl.jsonData = paramRequest.body;

        esbMessage(m)
            .then(function(r) {

                console.log('r',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail "}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });
    
    bmRouter.delete('/activityDetails/faq/:activityDetail_id/:faq_uuid.json', function(paramRequest, paramResponse){
    

        console.log('paramRequest.params.faq_id\n',paramRequest.params.faq_uuid);


        var m = {
            "ns":"bmm",
            "op": "bmm_updateActivityDetailFAQ",
            "pl":{
                uID:paramRequest.user.lanzheng.loginName,
                oID :paramRequest.user.currentOrganization,
                jsonData:{uuid:paramRequest.params.faq_uuid, _id:paramRequest.params.activityDetail_id},
                op :'delete'

            }
        };

        esbMessage(m)
            .then(function(r) {
                console.log('r',r);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail  faq"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.put('/activityDetails/faq/:activityDetail_id/:faq_uuid.json', function(paramRequest, paramResponse){

        console.log('paramRequest.params.faq_id\n',paramRequest.params.faq_id);
        console.log('paramRequest.body\n',paramRequest.body);


        var m = {
            "ns":"bmm",
            "op": "bmm_updateActivityDetailFAQ",
            "pl":{}
        };



        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;
        m.pl.op = 'update';
        m.pl.jsonData = paramRequest.body;
        //m.pl.acid = m.pl.acid._id;

        esbMessage(m)
            .then(function(r) {
                console.log('r',r);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail  faq"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.post('/activityDetails/description/attachment.json', function(paramRequest, paramResponse){




        console.log('-----attachement bingo-----');


        var m = {ns: 'bmm',op:'bmm_updateActivityDetailDescription', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            photoData:null,
            ifm:null,
            op : 'create',
            jsonData:null
        };



        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();

            console.log('file name:----- ', files.file.name);

            var jsonToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function(err, data) {


                m.pl.jsonData = jsonToUpdate;
                var attachment = {};
                attachment.fm = file_ext;
                attachment.fd = data;
                attachment.nm = files.file.name;
                m.pl.jsonData.description.attachment.push(attachment);

                esbMessage(m)
                    .then(function(r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse,200,r);
                    })
                    .fail(function(r) {
                        console.log('bmh error:-----');
                        console.log(r.er);
                        r = {pl:null, er:{ec:404,em:"could not save attachment and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });

            });

        });

    });

    bmRouter.put('/activityDetails/description/:activityDetail_id.json', function(paramRequest, paramResponse){


        console.log('-----attachement -----');


        var m = {ns: 'bmm',op:'bmm_updateActivityDetailDescription', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            op : 'update',
            _id: paramRequest.params.activityDetail_id,
            jsonData:paramRequest.body
        };

        m.pl.jsonData.acid = m.pl.jsonData.acid._id;
        esbMessage(m)
            .then(function(r) {
                console.log('r',r);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail  description"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });


    bmRouter.delete('/activityDetails/description/attachment/:activityDetail_id/:attch_id.json', function(paramRequest, paramResponse){


        console.log('paramRequest.params.attch_id\n',paramRequest.params.attch_id);

        var m = {ns: 'bmm',op:'bmm_updateActivityDetailDescription', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            ifm:null,
            op : 'delete',
            jsonData:{uuid:paramRequest.params.attch_id, _id:paramRequest.params.activityDetail_id}
        };

        esbMessage(m)
            .then(function(r) {
                console.log('r',r);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail  attachment"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });




    });


    //workspace/responses/document/upload.json

    bmRouter.post('/document/upload.json', function(paramRequest, paramResponse){


        var m = {ns: 'bmm',op:'bmm_uploadDocument', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            fileData:null,
            ifm:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            fs.readFile(old_path, function(err, data) {


                console.log('data-------',data );

                m.pl.fileData= data;
                m.pl.ifm = file_ext;

                esbMessage(m)
                    .then(function(r) {
                        console.log('upload document successfull');
                        oHelpers.sendResponse(paramResponse,200,r);
                    })
                    .fail(function(r) {
                        console.log('bmh error:-----');
                        console.log(r.er);
                        r = {pl:null, er:{ec:404,em:"could not save document to the bucket"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });
            });

        });

    });



    bmRouter.post('/activityDetails/upload.json', function(paramRequest, paramResponse){


        var m = {ns: 'bmm',op:'bmm_uploadActivityDetailLogo', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            photoData:null,
            ifm:null,
            jsonData:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            var jsonToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function(err, data) {


                console.log('data-------',data );

                m.pl.photoData= data;
                m.pl.ifm = file_ext;
                m.pl.jsonData = jsonToUpdate;

                m.pl.jsonData.acid = m.pl.jsonData.acid._id;

                esbMessage(m)
                    .then(function(r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse,200,r);
                    })
                    .fail(function(r) {
                        console.log('bmh error:-----');
                        console.log(r.er);
                        r = {pl:null, er:{ec:404,em:"could not save image and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });
            });

        });

    });


    bmRouter.post('/activityDetails/images.json', function(paramRequest, paramResponse){

        console.log('bmh post new image');

        var m = {ns: 'bmm',op:'bmm_updateActivityDetailImages', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            photoData:null,
            ifm:null,
            op : 'create',
            jsonData:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            var jsonToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function(err, data) {


                console.log('data-------',data );

                m.pl.photoData= data;
                m.pl.ifm = file_ext;
                m.pl.jsonData = jsonToUpdate;

                esbMessage(m)
                    .then(function(r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse,200,r);
                    })
                    .fail(function(r) {
                        console.log('bmh error:-----');
                        console.log(r.er);
                        r = {pl:null, er:{ec:404,em:"could not save image and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });

            });

        });


    });

    bmRouter.delete('/activityDetails/images/:activityDetail_id/:img_id.json', function(paramRequest, paramResponse){

        console.log('paramRequest.params.attch_id\n',paramRequest.params.attch_id);

        var m = {ns: 'bmm',op:'bmm_updateActivityDetailImages', pl: null};

        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            op : 'delete',
            jsonData:{uuid:paramRequest.params.img_id, _id:paramRequest.params.activityDetail_id}
        };


        esbMessage(m)
            .then(function(r) {
                console.log('r',r);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail  image"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });
    });


    bmRouter.post('/activityDetails/videos.json', function(paramRequest, paramResponse){

        console.log('bmh post new video');

        var m = {ns: 'bmm',op:'bmm_updateActivityDetailVideos', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            ifm:null,
            op : 'create',
            jsonData:paramRequest.body
        };


        esbMessage(m)
            .then(function(r) {


                console.log('r',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail "}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });


    bmRouter.delete('/activityDetails/videos/:activityDetail_id/:vid_id.json', function(paramRequest, paramResponse){

        console.log('bmh ---delete video\n',paramRequest.params.vid_id);

        var m = {ns: 'bmm',op:'bmm_updateActivityDetailVideos', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            op : 'delete',
            jsonData:{uuid:paramRequest.params.vid_id, _id:paramRequest.params.activityDetail_id}
        };

        esbMessage(m)
            .then(function(r) {


                console.log('r',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail video"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.post('/activityDetails/audios.json', function(paramRequest, paramResponse){


        console.log('bmh post new audio');


        var m = {ns: 'bmm',op:'bmm_updateActivityDetailAudios', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            ifm:null,
            op : 'create',
            jsonData:paramRequest.body
        };


        esbMessage(m)
            .then(function(r) {


                console.log('r',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmm error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmm error: could not update activityDetail "}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.delete('/activityDetails/audios/:activityDetail_id/:audio_id.json', function(paramRequest, paramResponse){

        console.log('bmm ---delete audio\n',paramRequest.params.audio_id);

        var m = {ns: 'bmm',op:'bmm_updateActivityDetailAudios', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            op : 'delete',
            jsonData:{uuid:paramRequest.params.audio_id, _id:paramRequest.params.activityDetail_id}
        };


        esbMessage(m)
            .then(function(r) {


                console.log('r--',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmm error:----- ', r);
                r = {pl:null, er:{ec:404,em:"bmm error: could not delete activityDetail audio"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.put('/archive/response/response.json', function(paramRequest, paramResponse){


        return q().then(function(){
            var jsonParam = JSON.parse(paramRequest.body.json);
            var m = {
                ns: 'mdm',
                vs: '1.0',
                op: 'bmm_deleteResponse',
                pl:  jsonParam.pl.response
            };
            console.log('what will be deleted', jsonParam.pl);

            return esbMessage(m);
        })
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                console.log('bmm error---', r.er);

                var r = {pl: null, er: {ec: 404, em: "could not delete reponse"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });



    });

    return bmRouter;
};


var activitieslist = {
  "pl": [{
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }, {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }]
};

var nameslist = {
  "pl": [{
      "field1": "证照拍摄名单",
      "field2": "手机号",
      "field3": "2014-08-05",
      "field4": "500"
    }, {
      "field1": "排版输出名单",
      "field2": "身份证号",
      "field3": "2014-08-05",
      "field4": "1000"
    }, {
      "field1": "LZ2002372125",
      "field2": "罗秀路柯达网络",
      "field3": "正常",
      "field4": "罗秀路567号"
    }, {
      "field1": "团体照补拍名单",
      "field2": "邮箱",
      "field3": "2014-08-05",
      "field4": "600"
    }]
};

var activitiesforms = {
  "pl": [{
      "field1": "证照拍摄",
      "field2": "2014-08-05",
      "field3": "有"
    }, {
      "field1": "排版输出",
      "field2": "2014-08-05",
      "field3": "有"
    }
    , {
      "field1": "团体照补拍",
      "field2": "2014-08-05",
      "field3": "无"
    }]
};

var publicforms = {
  "pl": [{
      "field1": "团体照补拍名单",
      "field2": "2014-08-05",
      "field3": "有"
    }
    , {
      "field1": "团体照补拍名单",
      "field2": "2014-08-05",
      "field3": "有"
    }, {
      "field1": "团体照补拍名单",
      "field2": "2014-08-05",
      "field3": "无"
    }]
};

var serviceslist = {
  "pl": [{
      "field1": "L0121210120",
      "field2": "证照拍摄",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }
    , {
      "field1": "L0121210120",
      "field2": "排版输出",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }, {
      "field1": "L0121210120",
      "field2": "团体照补拍",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }, {
      "field1": "L0121210120",
      "field2": "团体照补拍",
      "field3": "证照服务",
      "field4": "柯达网络",
      "field5": "220"
    }]
};

var all = {
  "pl": [{
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }
    , {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }]
};

var conventional = {
  "pl": [{
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }, {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }
    , {
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }]
};

var favorite = {
  "pl": [{
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }]

};

var agent = {
  "pl": [{
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }, {
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }
    , {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }]
};

var delegated = {
  "pl": [{
      "field1": "人像照片专业拍摄",
      "field2": "柯达（中国）投资有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "2013/07/04 18:40",
      "field5": "已完成"
    }, {
      "field1": "团体照片补拍",
      "field2": "上海蓝迪数码科技有限公司",
      "field3": "2013/07/04 16:32",
      "field4": "2013/07/04 17:40",
      "field5": "已提交"
    }
    , {
      "field1": "常用证件照片拍摄",
      "field2": "深圳思迈数码科技有限公司",
      "field3": "2013/07/04 12:42",
      "field4": "长期有效",
      "field5": "代办"
    }]
};

var agentsettings = {
  "pl": [{
      "field1": "1099889997799",
      "field2": "王大力",
      "field3": "2014-08-05 12：23:16",
      "field4": "等待验证"
    }, {
      "field1": "1099889997654",
      "field2": "李小丽",
      "field3": "2014-08-05 12：23:16",
      "field4": "正常"
    }, {
      "field1": "1099889991425",
      "field2": "张中历",
      "field3": "2014-08-05 12：23:16",
      "field4": "暂停"
    }
    , {
      "field1": "109988991369",
      "field2": "张三丰",
      "field3": "2014-08-05 15：23:19",
      "field4": "失效"
    }]
};

