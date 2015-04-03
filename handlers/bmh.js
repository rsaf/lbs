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
var Q = require('q');

function _initRequestMessage(paramRequest,type,code,adminOrg){
  var col,mod='bmm',
    message,url;
  if(type==='Activity'){
    col='activities';
    url='/workspace/publishing/activities';
    message="事务"
  }
  return {
    rdo: adminOrg
    ,rc: 'code'
    ,rt: message + '申请 ' + code
    ,rsu: paramRequest.user.lanzheng.loginName
    ,rso: paramRequest.user.currentOrganization
    ,rs: 10
    ,rb: 'message'
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
    }
    m.op='commitTransaction';
    return esbMessage(m);
  }
  function _rollBackTransaction(m){
    return Q()
    .then(function(){
        return Q.all([
          esbMessage({op:'wmm_rollBackTransaction',pl:{transaction:{_id:m.pl.transactionid}}})
          ,esbMessage({op:'rmm_rollback',pl:{transactionid:m.pl.transactionid}})
          ,esbMessage({op:'bmm_rollback',pl:{transactionid:m.pl.transactionid}})
        ]);
    })
    .then(function(){
      return Q.resolve('ok');
    })
    .then(null,function reject(err){
      return Q.reject('In bmh _rollBackTransaction:',err);
    });
  }

  function _persistForm(paramRequest, paramResponse){
    var m = {};
    //formHtml
    Q().then(function(){
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
    //formHtml
    Q().then(function(){
      m.pl=JSON.parse(paramRequest.body.json).pl;
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      if(m.pl.activity && m.pl.activity.abd && m.pl.activity.abd.aps && parseInt(m.pl.activity.abd.aps)===10){
        // create a transaction
        m.op = "createTransaction";
        m.pl.transaction={
          description:'publish Activity request'
          ,modules:['bmm','rmm']
        };
        return Q.all([esbMessage(m), esbMessage({op:'getOrganization',pl:{org:'lanzheng'}})])
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
        m.pl.request = _initRequestMessage(paramRequest,'Activity',activity.abd.ac,adminid);//org should be admin org
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
      var trans=Q();
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
    Q().then(function(){
      m.pl=JSON.parse(req.body.json).pl;
      //@todo: is user not set then use req.sessionID
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




  var bmRouter = paramService.Router();
  bmRouter.post('/form.json', function(paramRequest, paramResponse, paramNext){
    _persistForm(paramRequest, paramResponse, paramNext)
  });
  bmRouter.put('/form.json', function(paramRequest, paramResponse, paramNext){
    _persistForm(paramRequest, paramResponse, paramNext)
  });
  //query for responses (default where response.ow.uid = login user or ow.oid = the current organisation of user
  bmRouter.get('/response.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    Q().then(function(){
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
  bmRouter.post('/responses.json', function(paramRequest, paramResponse, paramNext){
    var m = {pl:{}};
    //formHtml
    Q().then(function(){
      m.pl.loginName=(paramRequest.user&&paramRequest.user.lanzheng&&paramRequest.user.lanzheng.loginName)||paramRequest.sessionID;
      m.pl.currentOrganization=(paramRequest.user&&paramRequest.user.currentOrganization)||false;
      m.op='bmm_getResponses';
      return esbMessage(m);
    }).then(function(msg){
      oHelpers.sendResponse(paramResponse,200,{pl:msg});
    }).fail(function(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });    
  });


    bmRouter.get('/responses/forms.json', function(paramRequest, paramResponse, paramNext){
        var m = {pl:{}};
        //formHtml
        Q().then(function(){
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
    Q().then(function(){
      m.pl={code:paramRequest.query.code}
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
    Q().then(function(){
      m.pl={loginName:paramRequest.user.lanzheng.loginName,currentOrganization:paramRequest.user.currentOrganization}
      m.op='bmm_getActivities';
      return esbMessage(m);
    }).then(function resolve(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    },function reject(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  });
  bmRouter.get('/public/activities.json', function(paramRequest, paramResponse, paramNext){
    var m = {};
    //formHtml
    Q().then(function(){
      m.pl={}
      m.op='bmm_getActivities';
      return esbMessage(m);
    }).then(function resolve(msg){
      oHelpers.sendResponse(paramResponse,200,msg);
    },function reject(er){
      oHelpers.sendResponse(paramResponse,501,er);      
    });
  });
  bmRouter.post('/activity.json', function(paramRequest, paramResponse, paramNext){
    _persistActivity(paramRequest, paramResponse, paramNext)
  });
  bmRouter.put('/activity.json', function(paramRequest, paramResponse, paramNext){
    _persistActivity(paramRequest, paramResponse, paramNext)
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

        console.log('paramRequest.params.activity_id-----------',paramRequest.params.activityDetail_id);


        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('bmh----',r.er);
                var r = {pl:null, er:{ec:404,em:"could not find activity detail page"}};
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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail "}};
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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail "}};
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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail  faq"}};
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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail  faq"}};
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
                        var r = {pl:null, er:{ec:404,em:"could not save attachment and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });

            })

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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail  description"}};
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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail  attachment"}};
                oHelpers.sendResponse(paramResponse,404,r);
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


                console.log('data-------',data )

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
                        var r = {pl:null, er:{ec:404,em:"could not save image and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });
            })

        });

    });


    bmRouter.post('/activityDetails/images.json', function(paramRequest, paramResponse){

        console.log('bmh post new image')

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


                console.log('data-------',data )

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
                        var r = {pl:null, er:{ec:404,em:"could not save image and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });

            })

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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail  image"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });
    });


    bmRouter.post('/activityDetails/videos.json', function(paramRequest, paramResponse){

        console.log('bmh post new video')

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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not update activityDetail "}};
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
                var r = {pl:null, er:{ec:404,em:"bmh error: could not delete activityDetail video"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    bmRouter.post('/activityDetails/audios.json', function(paramRequest, paramResponse){


        console.log('bmh post new audio')


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
                var r = {pl:null, er:{ec:404,em:"bmm error: could not update activityDetail "}};
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
                var r = {pl:null, er:{ec:404,em:"bmm error: could not delete activityDetail audio"}};
                oHelpers.sendResponse(paramResponse,404,r);
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

