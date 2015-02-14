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
        m.pl.notification.body = paramRequest.body.data[0].value  + '   '  +  paramRequest.body.data[1].value ;
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

