var oHelpers = require('../utilities/helpers.js');
var formidable = require('formidable');
var fs = require('fs');
var q = require('q');
var lib = require('lib');

module.exports = function (paramPS, esbMessage) {
    var psRouter = paramPS.Router();

//get photo by lzcode
    //workspace/phototoservices/v1/idphotos/:lzcode.json

    var workflowManager = new lib.WorkflowManager({
        commitTransaction: function(){return q().then(function(){console.log("commiting"); return;})},
        rollbackTransaction: function(){return q().then(function(){console.log("rollbacking"); return;})},
        esbMessage : esbMessage
    });

    ///workspace/photoservices/inspections/idphotos/lzcode.json
    psRouter.get('/inspections/idphotos/:lzcode.json', function (paramRequest, paramResponse, paramNext) {

        // oHelpers.sendResponse(paramResponse, 200, {pl: 'get photo by lzcode', er: null});


        var m = {
            "ns": "pmm",
            "op": "pmm_getPhotosForInspection",
            "pl": {
                ac: paramRequest.params.lzcode
            },
            "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

        };

        esbMessage(m)
            .then(function (r) {

                console.log('pmh inpection photos----', r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                console.log('pmh error---', r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });

    });


    psRouter.get('/corrections/:phototype/:lzcode.json', function (paramRequest, paramResponse) {



        var phototype = paramRequest.params.phototype;
        var ac = paramRequest.params.lzcode;


        console.log('get correction photo by type-----', phototype,ac);


        var m = {
            "ns": "pmm",
            "op": 'pmm_getCorrectionPhotosByStatus',
            "pl": {
                ac: ac,
                st:null
            },
            "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

    };

        if (phototype === 'unprocessed') {

            m.pl.st = '100';
        }
        else if (phototype === 'inprocess') {
            m.pl.st = '200';
        }
        else if (phototype === 'processsuccessful') {

            m.pl.st = '300';
        }
        else if (phototype === 'processfailed') {
            m.pl.st = '400';
        }
        else {
            var r = {pl: null, er: {ec: 404, em: "unkown correction photo type"}};
            oHelpers.sendResponse(paramResponse, 404, r);

        }



        console.log('m-----------',m);


        esbMessage(m)
            .then(function (r) {

                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse,200,r);

            })
            .fail(function (r) {

                console.log(r.er);
                var r = {pl: null, er: {ec: 404, em: "unable to get correction photos"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });


    });


    //get all photos by activity id
    //workspace/photoservices/v1/idphotos/:activityID.json
    psRouter.get('/idphotos/:activityId.json', function (paramRequest, paramResponse, paramNext) {
        oHelpers.sendResponse(paramResponse, 200, {pl: 'get all photos by activity code', er: null});

    });

    //get photo by activity id and special code
    //workspace/v1/photoservices/idphotos/:activityID/:tzcode.json
    psRouter.get('/idphotos/:activitiyID/:photoID.json', function (paramRequest, paramResponse, paramNext) {

        oHelpers.sendResponse(paramResponse, 200, {pl: 'get all photos by special code', er: null});
    });

    //get photo standard by standard code
    //workspace/v1/phototoservices/standards/:standardcode.json
    psRouter.get('/standards/:standardcode.json', function (paramRequest, paramResponse) {

        var varStandardCode = paramRequest.params.standardcode;

        console.log('varStandardCode---', varStandardCode);
        var m = {
            "ns": "pmm",
            "op": "pmm_readStandardByCode",
            "pl": {sc: varStandardCode}
        };

        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    psRouter.get('/photos/properties/:standardType.json', function (paramRequest, paramResponse) {

        var varStandardType = paramRequest.params.standardType;

        var m = {
            "ns": "pmm",
            "op": "pmm_readStandardByType",
            "pl": {it: varStandardType}
        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });


    psRouter.get('/photos/types.json', function (paramRequest, paramResponse) {


        var m = {
            "ns": "pmm",
            "op": "pmm_readAllStandardsTypes",
            "pl": {it: null}
        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });


    //get photo standard by standard code
    //workspace/standards/standards.json
    psRouter.get('/standards.json', function (paramRequest, paramResponse) {
        var m = {
            "ns": "pmm",
            "op": "pmm_readAllStandards",
            "pl": null,
            "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

    };

        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });
    //get photo standard by standard code
    //workspace/standards/standards.json
    psRouter.get('/usage.json', function (paramRequest, paramResponse) {
        var m = {
            "ns": "pmm",
            "op": "pmm_readAllUsages",
            "pl": null,
            "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    //workspace/standards/usages/:usagecode.json
    psRouter.get('/usages/:usagecode.json', function (paramRequest, paramResponse) {
        var m = {
            "ns": "pmm",
            "op": "pmm_readUsageByCode",
            "pl": {uc: paramRequest.params.usagecode}
        };


        esbMessage(m)
            .then(function (r) {

                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    //create photo standard by standard code
    ///workspace/standards/standards.json
    psRouter.post('/standards.json', function (paramRequest, paramResponse) {

        var m = {
            "ns": "pmm",
            "op": "pmm_createStandard",
            "pl": paramRequest.body
        };
        m.pl.uID = paramRequest.user.id;
        m.pl.oID = paramRequest.user.id;


        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {

                oHelpers.sendResponse(paramResponse, 501, r.er);
            });
    });

    ///workspace/standards/usage.json
    psRouter.post('/usage.json', function (paramRequest, paramResponse) {


        var pl = JSON.parse(paramRequest.body.json);

        var m = {
            "ns": "pmm",
            "op": "pmm_createUsage",
            "pl": pl
        };
        m.pl.uID = paramRequest.user.id;
        m.pl.oID = paramRequest.user.id;


        esbMessage(m)
            .then(function (r) {

                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {

                oHelpers.sendResponse(paramResponse, 501, r.er);
            });
    });

    //update photo standard by standard code
    //workspace/v1/phototoservices/standards/:standardcode.json
    psRouter.put('/standards/:standardcode.json', function (paramRequest, paramResponse) {

        var m = {
            "ns": "pmm",
            "op": "pmm_updateStandardByCode",
            "pl": paramRequest.body
        };

        m.pl.uID = paramRequest.user.id;
        m.pl.oID = paramRequest.user.id;

        esbMessage(m)
            .then(function (r) {

                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {

                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    //delete photo standard by standard code
    //workspace/standards/standards/:standardcode.json
    psRouter.delete('/standards/:standardcode.json', function (paramRequest, paramResponse) {

        if (paramRequest.body.sc === paramRequest.params.standardcode) {


            var m = {
                "ns": "pmm",
                "op": "pmm_deleteStandardByCode",
                "pl": paramRequest.body
            };


            m.pl.uID = paramRequest.user.id;
            m.pl.oID = paramRequest.user.id;


            esbMessage(m)
                .then(function (r) {

                    oHelpers.sendResponse(paramResponse, 200, r.pl);
                })
                .fail(function (r) {
                    oHelpers.sendResponse(paramResponse, 401, r.er);
                });

        }
        else {

            r = {er: 'requeste unidentied!', pl: null}


            oHelpers.sendResponse(paramResponse, 500, r);
        }


    });

    //workspace/standards/usages/:usagecode.json
    psRouter.delete('/usages/:usagecode.json', function (paramRequest, paramResponse) {


        var m = {
            "ns": "pmm",
            "op": "pmm_deleteUsageByCode",
            "pl": paramRequest.body
        };

        m.pl.uID = paramRequest.user.id;
        m.pl.oID = paramRequest.user.id;


        esbMessage(m)
            .then(function (r) {


                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });


    });

    //workspace/inspection/inspection/:status/:code.json
    psRouter.post('/inspection/:status/:code.json', function (paramRequest, paramResponse) {

        var workflowPayload = {
            status : paramRequest.params.status,
            photo : paramRequest.body.photo,
            recipients: [{
                inmail: {to: 'sa'},
                weixin: {to: null},
                sms: {to: '1391720744600'},
                email: {to: null}
            }],
            notification: {
                subject : '蓝正照片不合格提示:',
                notificationType : '事务通知',
                from : '系统',
                body: paramRequest.body.data.reason + (paramRequest.body.data.othersText ? '   ' + paramRequest.body.data.other : "")
            }
        }
        return workflowManager.completeService(paramRequest.body.photo.rc,"LZS105",workflowPayload,paramRequest.user,"DO_NEXT")
            .then(function finish(r){
                console.log("Completing inspection with response",r);
                oHelpers.sendResponse(paramResponse, 200, {pl: r.pl, er: r.er});
            }  ,  function reject(r){
                console.log("Failing inspection with response",r)
                oHelpers.sendResponse(paramResponse, 501, {pl: r.pl, er: r.er});
            })
    })


    psRouter.get('/inspection/:phototype/:activity_id.json', function (paramRequest, paramResponse) {


        console.log('get inspection photo by type-----');

        var phototype = paramRequest.params.phototype;
        var activity_id = paramRequest.params.activity_id;


        var m = {
            "ns": "pmm",
            "op": null,
            "pl": {
                ow: {
                    uid: paramRequest.user.lanzheng.loginName,
                    oid: paramRequest.user.currentOrganization
                },
                ac: activity_id
            },
            "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

        };


        if (phototype === 'unqualified') {

            m.op = 'pmm_getUnqualifedPhotos';


        }
        else if (phototype === 'qualified') {

            m.op = 'pmm_getQualifedPhotos';

        }
        else {

            var r = {pl: null, er: {ec: 404, em: "unkown inspection photo type"}};
            oHelpers.sendResponse(paramResponse, 404, r);

        }


        esbMessage(m)
            .then(function (r) {

                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse,200,r);

            })
            .fail(function (r) {

                console.log(r.er);
                var r = {pl: null, er: {ec: 404, em: "unable to get inspection photos"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });


    });


///workspace/corrections/idphotos.json
    psRouter.get('/idphotos.json', function (paramRequest, paramResponse) {
        oHelpers.sendResponse(paramResponse, 200, idphotos);
    });

// download image for correction
//    psRouter.get('/todo/:status/:activityCode.json', function (paramRequest, paramResponse) {
//
//
//        var ac = paramRequest.params.activityCode;
//        var st = '';
//
//        var m = {
//            "ns": "pmm",
//            "op": "pmm_getPhotosForCorrection",
//            "pl": {
//                ow: {
//                    uid: paramRequest.user.lanzheng.loginName,
//                    oid: paramRequest.user.currentOrganization
//                },
//                ac: ac,
//                st:st
//            }
//        };
//
//        esbMessage(m)
//            .then(function (r) {
//
//                console.log('pmh collected photos for correction---', r);
//
//                oHelpers.sendResponse(paramResponse, 200, r);
//            })
//            .fail(function (r) {
//
//                console.log('pmh error---', r);
//                oHelpers.sendResponse(paramResponse, 501, r);
//            });
//
//    });

    psRouter.post('/ack/:activityCode/:photoname.json', function (paramRequest, paramResponse) {

        console.log('in ack function ...');

        var photoUrl = paramRequest.body.pl.photoname;
        var ac = paramRequest.body.pl.foldername;


        console.log('--paramRequest.body---', paramRequest.body);

        var m = {
            ns: 'pmm',
            op: "pmm_SetCorrectionPhotoAsInProcess",
            pl: {uri: '/photos/' + photoUrl, ac: ac}
        }

        console.log('m----', m);

        esbMessage(m)
            .then(function (r) {


                console.log('photo marked as inprocess, successful');

                var r = {pl: {rs: true}, er: null};
                oHelpers.sendResponse(paramResponse, 200, r);//@todo this does not need response to client


            })
            .fail(function (r) {

                var r = {pl: {rs: false}, er: null};
                oHelpers.sendResponse(paramResponse, 404, r);
            });



    });

// correction failed
    psRouter.post('/fail/:activityCode/:photoname.json', function (paramRequest, paramResponse) {
        //foldername
        //photoname
        console.log('in fail function ...');

        var photoUrl = paramRequest.body.pl.photoname;
        var ac = paramRequest.body.pl.foldername;



        var m = {
            ns: 'pmm',
            op: "pmm_SetCorrectionPhotoAsFailed",
            pl: {uri: '/photos/' + photoUrl, ac: ac}
        }





        esbMessage(m)
            .then(function (r) {

                console.log('photo marked as correction failed, successful');

                var r = {pl: {rs: true}, er: null};
                oHelpers.sendResponse(paramResponse, 200, r);//@todo this does not need response to client


            })
            .then(function(r){

               // m.pl.recipients[0].inmail.to = r.pl.ow.uid;
                console.log('r---------------',r);

                    var m = {
                        ns: 'mdm',
                        vs: '1.0',
                        op: 'sendNotification',
                        pl: {
                            recipients: [{
                                inmail: {to: 'sa'},
                                weixin: {to: null},
                                sms: {to: '13917207446'},
                                email: {to: null}
                            }]
                            , notification: {}
                        }
                    };

                    m.pl.notification.subject = '蓝正照片不合格提示:';
                    m.pl.notification.notificationType = '事务通知';
                    m.pl.notification.from = '系统';
                    m.pl.notification.body = '您的照片制作失败了。。。。';


                    esbMessage(m)
                        .then(function (r) {

                            console.log('sumit to correction/send notification done---',r);
                            oHelpers.sendResponse(paramResponse, 200, r);
                        });

            })
            .fail(function (r) {

                console.log('pmh error----', r);

                var r = {pl: null, er: {ec: 404, em: "unable to mark photo as correction failed"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

// correction succesfull
    psRouter.post('/done/:activityCode/:photoname.json', function (paramRequest, paramResponse) {
        //checksum
        //folerName
        //photoName
        //photoData

        var workflowPayload = {
            formidableResults : undefined,
            toSet : {
                uID: paramRequest.user.lanzheng.loginName,
                oID: paramRequest.user.currentOrganization,
                ow: {//owner of the document, this person can fill out the form is does not have to be the same person as the one who created the response
                    uid: paramRequest.user.lanzheng.loginName,//this is the user login or the session id when this is an anonymous user
                    oid: paramRequest.user.currentOrganization//the current organisation is optional
                },
                photoData: null,
                sg: '30',
                st: '300',
                pp: { //other photos properties
                    ign: null, // 照片名称: image name                                      ===
                    igt: null, // 主题类型: 旅游照片 image type                              ===
                    igs: null, // 拍摄方式: 单板相机 image source                            ===
                    isl: null, // 拍摄地点:  image shooting location                        ===
                    rm: null,  // 照片描述: // 30 remarks 备注                               ===
                    isd: null, // 拍摄日期: // image shooting date                          ?
                    irs: null, // 像素尺寸:84mmX105mm image resolution size                  ?
                    ofs: null, // 文件大小:86Kb //28 original photo size 初始照片文件大小      ===
                    fm: null,  // 27 initial format 初始照片格式                              ===
                    urll: null,
                    urlm: null,
                    urls: null,
                    uri: null
                },
                uri: null, // String to physical photo location // AC1279908_SCM15900655434_UC12996987669_OC_2079877898.jpg
                ac: null,
                rc: null,
                ifm: null
            }
        };

        return q().then(function(){
            var form = new formidable.IncomingForm();
            var deferred = q.defer();
            form.parse(paramRequest, function(err,fields,files){
                var formidableResults = {
                    fields : fields,
                    files : files,
                    photoname : '/photos/' + JSON.parse(fields.json).pl.photoname,
                    err : err
                }
                workflowPayload.formidableResults = formidableResults;
                if(!err)
                    deferred.resolve(formidableResults.photoname);
                else
                    deferred.reject(err)
            });
            return deferred.promise;
        }).then(function(photoname){
            return esbMessage({
            "ns":"pmm",
            "op":"pmm_getPhotoByUri",
            "pl":{
                ac : paramRequest.params.activityCode,
                uri : photoname
            }});
        }).then(function(photo){
            console.log("Finishing photo ","(",paramRequest.params.photoname,"):",photo);
            return workflowManager.completeService(photo.pl.rc,"LZS106",workflowPayload,paramRequest.user,"DO_NEXT");
        }).then(function finish(r){
            console.log("Successfully completing correction. Response is", {pl: {rs: r.pl}, er: r.er});
            oHelpers.sendResponse(paramResponse, 200, {pl: {rs: r.pl}, er: r.er});
        }  ,  function reject(r){
            console.log("Error completing correction. Response is ",{pl: {rs: r.pl}, er: r.er});
            oHelpers.sendResponse(paramResponse, 501, {pl: {rs: r.pl}, er: r.er});
        })
    });

    psRouter.get('/folders/:stage.json', function (paramRequest, paramResponse, paramNext) {

        var stage = paramRequest.params.stage;

        console.log('stage----',stage);

        //
        //if (type === 'idPhotoStandard') {
        //
        //    oHelpers.sendResponse(paramResponse, 200, idPhotoStandard);
        //}
        //else if (type === 'idPhotosUsage') {
        //    oHelpers.sendResponse(paramResponse, 200, idPhotosUsage);
        //}
        //else if (type === 'folders') {
        //
        //    var m = {};
        //    //formHtml
        //
        //    console.log('folders request--------');
        //
        //    q().then(function () {
        //        m.pl = {
        //            loginName: paramRequest.user.lanzheng.loginName,
        //            currentOrganization: paramRequest.user.currentOrganization,
        //            st:null,
        //            sg:null
        //        };
        //        //m.op = 'bmm_getActivities';

            //
            //   if(stage === 'unInspectedFolders'){// inspection
            //       m.pl.st = 100;
            //       m.pl.sg = 20;
            //
            //   }
            //  else  if(stage === 'qualifiedFolders'){// inspection
            //       m.pl.st = 300;
            //       m.pl.sg = 20;
            //
            //   }
            //   else  if(stage === 'unQualifiedFolders'){// inspection
            //       m.pl.st = 400;
            //       m.pl.sg = 20;
            //
            //   }
            //   else  if(stage === 'unProcessed'){// correction
            //       m.pl.st = 100;
            //       m.pl.sg = 30;
            //
            //   }
            //   else  if(stage === 'processSuccessful'){// correction
            //       m.pl.st = 300;
            //       m.pl.sg = 30;
            //
            //   }
            //   else  if(stage === 'processFailed'){// correction
            //       m.pl.st = 400;
            //       m.pl.sg = 30;
            //
            //   }
            //   else  if(stage === 'inProcess'){// correction
            //       m.pl.st = 200;
            //       m.pl.sg = 30;
            //
            //   }
            //
            //   m.op = 'pmm_getActivitiesInfo';
            //
            //    return esbMessage(m);
            //}).then(function resolve(msg) {
            //
            //    console.log('activities---', msg);
            //    oHelpers.sendResponse(paramResponse, 200, msg);
            //}, function reject(er) {
            //    oHelpers.sendResponse(paramResponse, 501, er);
            //});

        //}




            var m = {
                "ns": "pmm",
                "op": "pmm_getActivitiesInfo",
                "pl": {st:null,sg:null},
                "mt":{p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed}

            };


            if(stage === 'unInspectedFolders'){// inspection
                m.pl.st = '100';
                m.pl.sg = '20';

            }
            else  if(stage === 'qualifiedFolders'){// inspection
                m.pl.st = '300';
                m.pl.sg = '20';

            }
            else  if(stage === 'unQualifiedFolders'){// inspection
                m.pl.st = '400';
                m.pl.sg = '20';

            }
            else  if(stage === 'unProcessedFolders'){// correction
                m.pl.st = '100';
                m.pl.sg = '30';

            }
            else  if(stage === 'processSuccessfulFolders'){// correction
                m.pl.st = '300';
                m.pl.sg = '30';

            }
            else  if(stage === 'processFailedFolders'){// correction
                m.pl.st = '400';
                m.pl.sg = '30';

            }
            else  if(stage === 'inProcessFolders'){// correction
                m.pl.st = '200';
                m.pl.sg = '30';

            }


            esbMessage(m)
                .then(function (r) {

                    oHelpers.sendResponse(paramResponse, 200, r);
                })
                .fail(function (r) {
                    console.log('pmh error----', r.er);
                    oHelpers.sendResponse(paramResponse, 401, r.er);
                });


    });

    psRouter.post('/upload.json', function (paramRequest, paramResponse, paramNext) {

        console.log('pmh  uploading photo-----');

        var m = {ns: 'dmm', op: 'dmm_uploadPhoto', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            photoData: null,
            sgc: 10,
            stc: 100,
            pp: { //other photos properties
                ign: null, // 照片名称: image name                                      ===
                igt: null, // 主题类型: 旅游照片 image type                              ===
                igs: null, // 拍摄方式: 单板相机 image source                            ===
                isl: null, // 拍摄地点:  image shooting location                        ===
                rm: null,  // 照片描述: // 30 remarks 备注                               ===
                isd: null, // 拍摄日期: // image shooting date                          ?
                irs: null, // 像素尺寸:84mmX105mm image resolution size                  ?
                ofs: null, // 文件大小:86Kb //28 original photo size 初始照片文件大小      ===
                ifm: null  // 27 initial format 初始照片格式                              ===
            },
            uri: null // String to physical photo location // AC1279908_SCM15900655434_UC12996987669_OC_2079877898.jpg
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function (err, fields, files) {


            var fileInfo = JSON.parse(fields.fileInfo);

            console.log('fields----', fileInfo);

            var old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                file_name = files.file.name;

            console.log('file name:---', file_name);


            fs.readFile(old_path, function (err, data) {
                m.pl.fn = file_name;
                m.pl.ft = paramRequest.params.doctype;
                m.pl.rm = fileInfo.description;
                m.pl.fs = file_size;
                m.pl.fm = file_ext;
                m.pl.fd = data;

                esbMessage(m)
                    .then(function (r) {
                        //paramResponse.writeHead(200, {"Content-Type": "application/json"});

                        console.log('dmh upload successful---', r);

                        //paramResponse.end(JSON.stringify(r));
                        oHelpers.sendResponse(paramResponse,200,r);
                    })
                    .fail(function (r) {
                        console.log('dmh error-----:', r.er);
                        var r = {pl: null, er: {ec: 404, em: "could not save document"}};
                        oHelpers.sendResponse(paramResponse, 404, r);
                    });
            });
        });

    });


    return psRouter;
};


var idPhotosUsage = {
    "pl": [{
        "code": "Y001",
        "field1": "证件办理事务",
        "field2": "蓝证近照；蓝证通办-白色背景；蓝证通办-蓝色背景  等"
    }
        , {
            "code": "Y002",
            "field1": "中小学教育与学生学业事务",
            "field2": "蓝证近照；蓝证通办-白色背景；蓝证通办-蓝色背景  等"
        }, {
            "code": "Y003",
            "field1": "高等教育与学生学业事务",
            "field2": "蓝证近照；蓝证通办-白色背景；蓝证通办-蓝色背景  等"
        }, {
            "code": "Y004",
            "field1": "考试报名事务",
            "field2": "蓝证近照；蓝证通办-白色背景；蓝证通办-蓝色背景  等"
        }, {
            "code": "Y005",
            "field1": "中国出入境事务",
            "field2": "中国护照；港澳通行证；台湾通行证"
        }, {
            "code": "Y006",
            "field1": "亚洲国家签证事务",
            "field2": "日本签证；韩国签证；韩国签证；"
        }, {
            "code": "Y007",
            "field1": "欧洲国家签证事务",
            "field2": "德国签证；法国签证；意大利签证；"
        }, {
            "code": "Y008",
            "field1": "北美洲国家签证事务",
            "field2": "美国签证；加拿大签证；"
        }, {
            "code": "Y009",
            "field1": "南美洲国家签证事务",
            "field2": "巴西签证；墨西哥签证；阿根廷签证；哥伦比亚签证；"
        }]
};

var idPhotoStandard = {
    "pl": [{
        "code": "Z001",
        "field1": "蓝证照近照",
        "field2": "390",
        "field3": "567",
        "field4": "JPG"
    }, {
        "code": "Z002",
        "field1": "蓝证通办-白色背景",
        "field2": "660",
        "field3": "827",
        "field4": "JPG"
    }, {
        "code": "Z003",
        "field1": "蓝证通办-蓝色背景",
        "field2": "390",
        "field3": "567",
        "field4": "JPG"
    }, {
        "code": "Z004",
        "field1": "蓝证通办-红色背景",
        "field2": "390",
        "field3": "867",
        "field4": "JPG"
    }, {
        "code": "Z005",
        "field1": "小1寸-白色背景",
        "field2": "260",
        "field3": "378",
        "field4": "JPG"
    }, {
        "code": "Z006",
        "field1": "小1寸-白色背景",
        "field2": "260",
        "field3": "567",
        "field4": "JPG"
    }, {
        "code": "Z007",
        "field1": "小1寸-蓝色背景",
        "field2": "260",
        "field3": "378",
        "field4": "JPG"
    }, {
        "code": "Z008",
        "field1": "小1寸-红色背景",
        "field2": "390",
        "field3": "567",
        "field4": "JPG"
    }, {
        "code": "Z009",
        "field1": "小1寸-白色背景",
        "field2": "390",
        "field3": "567",
        "field4": "JPG"
    }]
};

var folders = {
    "pl": [{
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 1"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 2"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 3"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 4"
    }, {
        "foldername": "蓝证通用证照"
    }, {
        "foldername": "护照证照"
    }, {
        "foldername": "亚洲签证证照"
    }, {
        "foldername": "小一寸-白底 5"
    }]
    , "total": 33
};

var idphotos = {
    "pl": [
        {
            "photourl": "/commons/images/singlePhoto_03.jpg"
            , "category": "其他照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 0
        }

        , {
            "photourl": "/commons/images/passportPhoto_ID.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 1
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 2
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 3
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 4
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 5
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 6
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 7
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 8
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 9
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 10
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 11
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 12
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 13
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 14
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 15
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 16
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 17
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 18
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 19
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 20
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 21
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 22
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 23
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 24
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 25
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 26
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 27
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 28
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 29
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 30
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 31
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 32
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 33
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 34
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 35
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 36
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 37
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 38
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 39
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 40
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 41
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 42
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 43
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 44
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 45
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 46
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 47
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 48
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 49
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 50
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 51
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 52
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 53
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 54
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 55
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 56
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 57
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 58
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 59
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 60
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 61
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 62
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 63
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 64
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 65
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 66
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 67
        }, {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 68
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 69
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 70
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 71
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 72
        }, {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "code": 73
        }]
}

var folders = {
    "pl": [{
        "foldername": "蓝证通用证照",
        "_id": 0
    }, {
        "foldername": "护照证照",
        "_id": 1
    }, {
        "foldername": "亚洲签证证照",
        "_id": 2
    }, {
        "foldername": "小一寸-白底 1",
        "_id": 3
    }, {
        "foldername": "蓝证通用证照",
        "_id": 4
    }, {
        "foldername": "护照证照",
        "_id": 5
    }, {
        "foldername": "亚洲签证证照",
        "_id": 6
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 7
    }, {
        "foldername": "蓝证通用证照",
        "_id": 8
    }, {
        "foldername": "护照证照",
        "_id": 9
    }, {
        "foldername": "亚洲签证证照",
        "_id": 10
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 11
    }, {
        "foldername": "蓝证通用证照",
        "_id": 12
    }, {
        "foldername": "护照证照",
        "_id": 13
    }, {
        "foldername": "亚洲签证证照",
        "_id": 14
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 15
    }, {
        "foldername": "蓝证通用证照",
        "_id": 16
    }, {
        "foldername": "护照证照",
        "_id": 17
    }, {
        "foldername": "亚洲签证证照",
        "_id": 18
    }, {
        "foldername": "蓝证通用证照",
        "_id": 19
    }, {
        "foldername": "护照证照",
        "_id": 20
    }, {
        "foldername": "亚洲签证证照",
        "_id": 21
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 22
    }, {
        "foldername": "蓝证通用证照",
        "_id": 23
    }, {
        "foldername": "护照证照",
        "_id": 24
    }, {
        "foldername": "亚洲签证证照",
        "_id": 25
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 26
    }, {
        "foldername": "蓝证通用证照",
        "_id": 27
    }, {
        "foldername": "护照证照",
        "_id": 28
    }, {
        "foldername": "亚洲签证证照",
        "_id": 29
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 30
    }, {
        "foldername": "蓝证通用证照",
        "_id": 31
    }, {
        "foldername": "护照证照",
        "_id": 32
    }, {
        "foldername": "亚洲签证证照",
        "_id": 33
    }, {
        "foldername": "蓝证通用证照",
        "_id": 34
    }, {
        "foldername": "护照证照",
        "_id": 35
    }, {
        "foldername": "亚洲签证证照",
        "_id": 36
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 37
    }, {
        "foldername": "蓝证通用证照",
        "_id": 38
    }, {
        "foldername": "护照证照",
        "_id": 39
    }, {
        "foldername": "亚洲签证证照",
        "_id": 40
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 41
    }, {
        "foldername": "蓝证通用证照",
        "_id": 42
    }, {
        "foldername": "护照证照",
        "_id": 43
    }, {
        "foldername": "亚洲签证证照",
        "_id": 44
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 45
    }, {
        "foldername": "蓝证通用证照",
        "_id": 46
    }, {
        "foldername": "护照证照",
        "_id": 47
    }, {
        "foldername": "亚洲签证证照",
        "_id": 48
    }, {
        "foldername": "蓝证通用证照",
        "_id": 49
    }, {
        "foldername": "护照证照",
        "_id": 50
    }, {
        "foldername": "亚洲签证证照",
        "_id": 51
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 52
    }, {
        "foldername": "蓝证通用证照",
        "_id": 53
    }, {
        "foldername": "护照证照",
        "_id": 54
    }, {
        "foldername": "亚洲签证证照",
        "_id": 55
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 56
    }, {
        "foldername": "蓝证通用证照",
        "_id": 57
    }, {
        "foldername": "护照证照",
        "_id": 58
    }, {
        "foldername": "亚洲签证证照",
        "_id": 59
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 60
    }, {
        "foldername": "蓝证通用证照",
        "_id": 61
    }, {
        "foldername": "护照证照",
        "_id": 62
    }, {
        "foldername": "亚洲签证证照",
        "_id": 63
    }, {
        "foldername": "蓝证通用证照",
        "_id": 64
    }, {
        "foldername": "护照证照",
        "_id": 65
    }, {
        "foldername": "亚洲签证证照",
        "_id": 66
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 67
    }, {
        "foldername": "蓝证通用证照",
        "_id": 68
    }, {
        "foldername": "护照证照",
        "_id": 69
    }, {
        "foldername": "亚洲签证证照",
        "_id": 70
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 71
    }, {
        "foldername": "蓝证通用证照",
        "_id": 72
    }, {
        "foldername": "护照证照",
        "_id": 73
    }, {
        "foldername": "亚洲签证证照",
        "_id": 74
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 75
    }, {
        "foldername": "蓝证通用证照",
        "_id": 76
    }, {
        "foldername": "护照证照",
        "_id": 77
    }, {
        "foldername": "亚洲签证证照",
        "_id": 78
    }, {
        "foldername": "蓝证通用证照",
        "_id": 79
    }, {
        "foldername": "护照证照",
        "_id": 80
    }, {
        "foldername": "亚洲签证证照",
        "_id": 81
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 82
    }, {
        "foldername": "蓝证通用证照",
        "_id": 83
    }, {
        "foldername": "护照证照",
        "_id": 84
    }, {
        "foldername": "亚洲签证证照",
        "_id": 85
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 86
    }, {
        "foldername": "蓝证通用证照",
        "_id": 87
    }, {
        "foldername": "护照证照",
        "_id": 88
    }, {
        "foldername": "亚洲签证证照",
        "_id": 89
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 90
    }, {
        "foldername": "蓝证通用证照",
        "_id": 91
    }, {
        "foldername": "护照证照",
        "_id": 92
    }, {
        "foldername": "亚洲签证证照",
        "_id": 93
    }, {
        "foldername": "蓝证通用证照",
        "_id": 94
    }, {
        "foldername": "护照证照",
        "_id": 95
    }, {
        "foldername": "亚洲签证证照",
        "_id": 96
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 97
    }, {
        "foldername": "蓝证通用证照",
        "_id": 98
    }, {
        "foldername": "护照证照",
        "_id": 99
    }, {
        "foldername": "亚洲签证证照",
        "_id": 100
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 101
    }, {
        "foldername": "蓝证通用证照",
        "_id": 102
    }, {
        "foldername": "护照证照",
        "_id": 103
    }, {
        "foldername": "亚洲签证证照",
        "_id": 104
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 105
    }, {
        "foldername": "蓝证通用证照",
        "_id": 106
    }, {
        "foldername": "护照证照",
        "_id": 107
    }, {
        "foldername": "亚洲签证证照",
        "_id": 108
    }, {
        "foldername": "蓝证通用证照",
        "_id": 109
    }, {
        "foldername": "护照证照",
        "_id": 110
    }, {
        "foldername": "亚洲签证证照",
        "_id": 111
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 112
    }, {
        "foldername": "蓝证通用证照",
        "_id": 113
    }, {
        "foldername": "护照证照",
        "_id": 114
    }, {
        "foldername": "亚洲签证证照",
        "_id": 115
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 116
    }, {
        "foldername": "蓝证通用证照",
        "_id": 117
    }, {
        "foldername": "护照证照",
        "_id": 118
    }, {
        "foldername": "亚洲签证证照",
        "_id": 119
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 120
    }, {
        "foldername": "蓝证通用证照",
        "_id": 121
    }, {
        "foldername": "护照证照",
        "_id": 122
    }, {
        "foldername": "亚洲签证证照",
        "_id": 123
    }, {
        "foldername": "蓝证通用证照",
        "_id": 124
    }, {
        "foldername": "护照证照",
        "_id": 125
    }, {
        "foldername": "亚洲签证证照",
        "_id": 126
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 127
    }, {
        "foldername": "蓝证通用证照",
        "_id": 128
    }, {
        "foldername": "护照证照",
        "_id": 129
    }, {
        "foldername": "亚洲签证证照",
        "_id": 130
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 131
    }, {
        "foldername": "蓝证通用证照",
        "_id": 132
    }, {
        "foldername": "护照证照",
        "_id": 133
    }, {
        "foldername": "亚洲签证证照",
        "_id": 134
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 135
    }, {
        "foldername": "蓝证通用证照",
        "_id": 136
    }, {
        "foldername": "护照证照",
        "_id": 137
    }, {
        "foldername": "亚洲签证证照",
        "_id": 138
    }, {
        "foldername": "蓝证通用证照",
        "_id": 139
    }, {
        "foldername": "护照证照",
        "_id": 140
    }, {
        "foldername": "亚洲签证证照",
        "_id": 141
    }, {
        "foldername": "小一寸-白底 2",
        "_id": 142
    }, {
        "foldername": "蓝证通用证照",
        "_id": 143
    }, {
        "foldername": "护照证照",
        "_id": 144
    }, {
        "foldername": "亚洲签证证照",
        "_id": 145
    }, {
        "foldername": "小一寸-白底 3",
        "_id": 146
    }, {
        "foldername": "蓝证通用证照",
        "_id": 147
    }, {
        "foldername": "护照证照",
        "_id": 148
    }, {
        "foldername": "亚洲签证证照",
        "_id": 149
    }, {
        "foldername": "小一寸-白底 4",
        "_id": 150
    }, {
        "foldername": "蓝证通用证照",
        "_id": 151
    }, {
        "foldername": "护照证照",
        "_id": 152
    }, {
        "foldername": "亚洲签证证照",
        "_id": 153
    }, {
        "foldername": "小一寸-白底 5",
        "_id": 154
    }],
    "total": 33
};

