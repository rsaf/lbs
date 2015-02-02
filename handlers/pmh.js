var oHelpers = require('../utilities/helpers.js');

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
            "op": "readPhotoStandardByCode",
            "pl": {sc: 'zyz'}
        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    //update photo standard by standard code
    //workspace/v1/phototoservices/standards/:standardcode.json
    psRouter.post('/standards/:standardcode.json', function (paramRequest, paramResponse) {
        var m = {
            "ns": "pmm",
            "op": "updatePhotoStandardByCode",
            "pl": {sc: 'zyz'}
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
    //workspace/v1/phototoservices/standards.json
    psRouter.put('/standards.json', function (paramRequest, paramResponse) {
        var m = {
            "ns": "pmm",
            "op": "createPhotoStandard",
            "pl": {sc: 'zyz'}
        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    //delete photo standard by standard code
    //workspace/v1/phototoservices/standards/:standardcode.json
    psRouter.delete('/standards/:standardcode.json', function (paramRequest, paramResponse) {
        var m = {
            "ns": "pmm",
            "op": "deletePhotoStandardByCode",
            "pl": {sc: 'zyz'}
        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r.pl);
            })
            .fail(function (r) {
                oHelpers.sendResponse(paramResponse, 401, r.er);
            });
    });

    psRouter.post('/idphotos.json', function (req, res){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n');
            res.end(util.inspect({fields: fields, files: files}) + '\n');
        });
        form.on('end', processForm);
    });

// Show the upload form
    psRouter.get('/idphotos.json', function (req, res){
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


