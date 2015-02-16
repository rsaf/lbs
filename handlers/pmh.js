var oHelpers = require('../utilities/helpers.js');
var    formidable = require('formidable');


module.exports = function (paramPS, esbMessage) {
    var psRouter = paramPS.Router();

//get photo by lzcode
    //workspace/phototoservices/v1/idphotos/:lzcode.json
    psRouter.get('/idphotos/:lzcode.json', function (paramRequest, paramResponse, paramNext) {

        oHelpers.sendResponse(paramResponse, 200, {pl: 'get photo by lzcode', er: null});

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


        var m = {
            "ns": "pmm",
            "op": "pmm_readStandardByCode",
            "pl":{sc: paramRequest.query.sc}
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
            "pl":null
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
            "pl": null
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
            "pl": {uc:paramRequest.params.usagecode}
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
        m.pl.uID= paramRequest.user.id;
        m.pl.oID= paramRequest.user.id;




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
        m.pl.uID= paramRequest.user.id;
        m.pl.oID= paramRequest.user.id;


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
            "pl":  paramRequest.body
        };

        m.pl.uID= paramRequest.user.id;
        m.pl.oID= paramRequest.user.id;

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

        if(paramRequest.body.sc === paramRequest.params.standardcode){


        var m = {
            "ns": "pmm",
            "op": "pmm_deleteStandardByCode",
            "pl": paramRequest.body
        };



        m.pl.uID= paramRequest.user.id;
        m.pl.oID= paramRequest.user.id;



        esbMessage(m)
            .then(function (r) {

                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });

        }
        else
        {

            r = {er: 'requeste unidentied!' , pl:null}


            oHelpers.sendResponse(paramResponse, 500,r );
        }



    });

    //workspace/standards/usages/:usagecode.json
    psRouter.delete('/usages/:usagecode.json', function (paramRequest, paramResponse) {



            var m = {
                "ns": "pmm",
                "op": "pmm_deleteUsageByCode",
                "pl": paramRequest.body
            };

            m.pl.uID= paramRequest.user.id;
            m.pl.oID= paramRequest.user.id;



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


        console.log('\n-----inspection results data:-----', paramRequest.body.data);

        if(paramRequest.body.data){

        var m = {
            ns: 'mdm',
            vs: '1.0',
            op: 'sendNotification',
            pl: {
                recipients: [{
                    inmail: {to: 'guest'},
                    weixin: {to: 'lionleo001'},
                    sms: {to: '15900755434'},
                    email: {to: 'rolland@lbsconsulting.com'}
                }]
                ,notification:{}
            }
        };
        m.pl.notification.subject = '照片不合格提示';
        m.pl.notification.notificationType = '事务通知';

            if(paramRequest.body.data[1]){
                m.pl.notification.body = paramRequest.body.data[0].value  + '   '  +  paramRequest.body.data[1].value ;
            }
            else if(paramRequest.body.data[0]){
                m.pl.notification.body = paramRequest.body.data[0].value ;
            }


         m.pl.notification.from = 'rolladmin';



        console.log('payload ----', m.pl);

        esbMessage(m)
            .then(function(r) {

                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function(r) {

                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not send notification"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

        }


    });

    //
    //psRouter.post('/idphotos.json', function (req, res){
    //    var form = new formidable.IncomingForm();
    //    form.parse(req, function(err, fields, files) {
    //        res.writeHead(200, {'content-type': 'text/plain'});
    //        res.write('received upload:\n');
    //        res.end(util.inspect({fields: fields, files: files}) + '\n');
    //    });
    //    form.on('end', processForm);
    //});

   ///workspace/corrections/idphotos.json
    psRouter.get('/idphotos.json', function (paramRequest, paramResponse){
        oHelpers.sendResponse(paramResponse, 200, idphotos);
    });

// Show the upload form
    psRouter.get('/todo/activityname.json', function (req, paramResponse){

            oHelpers.sendResponse(paramResponse, 200, idphotos);

    });

// Show the upload form
    psRouter.post('/ack/activityname/photoname.json', function (req, res){
        res.writeHead(200, {'Content-Type': 'text/html' });
        var form = '<form action="/upload" enctype="multipart/form-data" method="post"><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
        res.end(form);
    });

// Show the upload form
    psRouter.post('/fail/activityname/photoname.json', function (req, res){
        res.writeHead(200, {'Content-Type': 'text/html' });
        var form = '<form action="/upload" enctype="multipart/form-data" method="post"><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
        res.end(form);
    });

    // Show the upload form
    psRouter.post('/done/activityname/photoname.json', function (req, res){
        res.writeHead(200, {'Content-Type': 'text/html' });
        var form = '<form action="/upload" enctype="multipart/form-data" method="post"><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
        res.end(form);
    });

    //fake endpoints
    psRouter.get('/:type.json', function(paramRequest, paramResponse, paramNext){
      if (paramRequest.params.type === 'idPhotoStandard'){

          oHelpers.sendResponse(paramResponse,200,idPhotoStandard);
      }
      else if(paramRequest.params.type === 'idPhotosUsage'){
          oHelpers.sendResponse(paramResponse,200,idPhotosUsage);
      }
      else if(paramRequest.params.type === 'folders'){
          oHelpers.sendResponse(paramResponse,200,folders);
      }
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
  ,"total":33
};

var idphotos = {"pl": [
    {"photourl": "/commons/images/singlePhoto_03.jpg"
        , "category": "其他照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 0}
    , {"photourl": "/commons/images/passportPhoto_ID.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 1}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 2}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 3}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 4}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 5}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 6}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 7}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 8}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 9}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 10}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 11}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 12}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 13}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 14}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 15}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 16}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 17}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 18}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 19}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 20}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 21}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 22}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 23}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 24}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 25}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 26}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 27}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 28}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 29}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 30}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 31}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 32}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 33}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 34}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 35}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 36}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 37}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 38}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 39}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 40}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 41}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 42}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 43}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 44}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 45}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 46}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 47}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 48}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 49}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 50}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 51}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 52}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 53}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 54}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 55}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 56}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 57}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 58}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 59}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 60}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 61}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 62}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 63}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 64}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 65}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 66}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 67}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 68}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 69}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 70}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 71}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 72}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 73}]}


