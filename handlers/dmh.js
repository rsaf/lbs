/**
 * endpoints for /workspace/photos
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js'),
         fs = require('fs');

//var uploader = require('blueimp-file-upload-expressjs')(options);

module.exports = function(paramService, esbMessage)
{
  var photosRouter = paramService.Router();

    photosRouter.get('/:photoType.json', function(paramRequest, paramResponse, paramNext){
        if (paramRequest.params.photoType === 'idphotos'){
            oHelpers.sendResponse(paramResponse,200,idphotos);
        }
        else if(paramRequest.params.photoType === 'processing'){
            oHelpers.sendResponse(paramResponse,200,processing);
        }

        else if(paramRequest.params.photoType === 'otherphotos'){
            oHelpers.sendResponse(paramResponse,200,otherphotos);
        }
  });

  ///workspace/photos/details/:photocode.json
  photosRouter.get('/details/:photocode.json', function(paramRequest, paramResponse, paramNext){


        var photoDetails = {
          name:'教师资料格式照片'
         ,photoType:'工作证证照'
         ,resolution:'25mmX35mm'
         ,shootingMode:'单反相机'
         ,fileSize:'160Kb'
         ,shootingAddress:'上海柯达影像网络'
         ,uploadDate:'2014/3/28'
         ,shootingDate:'2014/3/13'
         ,photoUri:'/commons/images/passportPhoto_other.jpg'

        }


        if (paramRequest.params.photocode){


          oHelpers.sendResponse(paramResponse,200,photoDetails);
        }
        else{
            var r = {pl:null, er:{ec:500,em:"invalid photo id"}};
            oHelpers.sendResponse(paramResponse,500,r);
        }


  });





  ///workspace/photos/delete/:photocode.json
  photosRouter.delete('/delete/:photocode.json', function(paramRequest, paramResponse, paramNext){


    var deleted = {status:true}


    if (paramRequest.params.photocode){


      oHelpers.sendResponse(paramResponse,200,deleted);
    }
    else{
      var r = {pl:null, er:{ec:500,em:"invalid photo id"}};
      oHelpers.sendResponse(paramResponse,500,r);
    }


  });






// /workspace/photos/upload.json
 // uploader.post('/upload.json', function(paramRequest, paramResponse, paramNext){
   photosRouter.post('/upload.json', function(paramRequest, paramResponse, paramNext){


     console.log('---------------uploading picture-------\n', paramRequest.Payoad);
    console.log('---------------uploading picture-------',paramRequest._readableState.buffer);



    var m = {
      ns: 'dmm',
      vs: '1.0',
      op: 'dmm_uploadPhoto',
      pl: null
    };



     paramResponse.writeHead(200, {"Content-Type": "application/json"});
     paramResponse.end(JSON.stringify(m));


//
//        var form = new formidable.IncomingForm();
//        form.parse(paramRequest, function(err, fields, files) {
//
//
//          // `file` is the name of the <input> field of type `file`
//          var old_path = files.file.path,
//              file_size = files.file.size,
//              file_ext = files.file.name.split('.').pop(),
//              file_name = files.file.name;
//
//          console.log('real file name: '+files.file.name);
//
//          fs.readFile(old_path, function(err, data) {
//            console.log('read data----------',data);
//            m.pl = {
//              imageData: data,
//              imageExt:  file_ext,
//              ign: file_name,
//              uID: paramRequest.user.id,
//              oID:paramRequest.user.id
//            };
//
//          });
//        });
//
//
//
//
//    esbMessage(m)
//        .then(function(r) {
//
//          paramResponse.writeHead(200, {"Content-Type": "application/json"});
//          paramResponse.end(JSON.stringify(r));
//        })
//        .fail(function(r) {
//
//          console.log(r.er);
//          var r = {pl:null, er:{ec:404,em:"could not save image"}};
//          oHelpers.sendResponse(paramResponse,404,r);
//        });


  });

  return photosRouter;
};


var idphotos = {
  "pl": [{
      "photourl": "/commons/images/singlePhoto_03.jpg",
      "category": "其他照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":1
    },
    {
      "photourl": "/commons/images/passportPhoto_ID.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":2
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":3
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":4
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":5
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":6
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":7
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":8
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":9
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":10
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":11
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":12
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":13
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":14
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":15
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":16
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":17
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":18
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":19
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":20
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":21
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":22
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":23
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22",
      "code":24
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "工作照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "身份证照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }]
};

var processing = {
  "pl": [{
      "photourl": "/commons/images/passportPhoto_ID.jpg",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }
    , {
      "photourl": "/commons/images/passportPhoto_ID.jpg",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/passportPhoto_other.jpg",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo10.png",
      "category": "",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }]
};

var otherphotos = {
  "pl": [{
      "photourl": "/commons/images/IDPhotoDemo1.png",
      "category": "自由畅想",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
       , "code":1
    }
    , {
      "photourl": "/commons/images/IDPhotoDemo5.png",
      "category": "曾经的美好回忆",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":2
    }, {
      "photourl": "/commons/images/IDPhotoDemo2.png",
      "category": "海南美景",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":3
    }, {
      "photourl": "/commons/images/IDPhotoDemo3.png",
      "category": "美好心情",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":4
    }, {
      "photourl": "/commons/images/IDPhotoDemo4.png",
      "category": "IMG001",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":5
    }, {
      "photourl": "/commons/images/IDPhotoDemo7.png",
      "category": "IMG002",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":6
    }, {
      "photourl": "/commons/images/photo2.jpg",
      "category": "逛逛",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":7
    }, {
      "photourl": "/commons/images/photo3.jpg",
      "category": "my pic",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":8
    }, {
      "photourl": "/commons/images/IDPhotoDemo5.png",
      "category": "曾经的美好回忆",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":9
    }, {
      "photourl": "/commons/images/IDPhotoDemo2.png",
      "category": "海南美景",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
      , "code":10
    }]
};
