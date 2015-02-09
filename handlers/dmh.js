/**
 * endpoints for /workspace/photos
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers= require('../utilities/helpers.js');

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

// /workspace/photos/upload.json
  photosRouter.post('/upload.json', function(paramRequest, paramResponse, paramNext){


    var m = {
      ns: 'dmm',
      vs: '1.0',
      op: 'dmm_uploadPhoto',
      pl: null
    };



        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {


          // `file` is the name of the <input> field of type `file`
          var old_path = files.file.path,
              file_size = files.file.size,
              file_ext = files.file.name.split('.').pop(),
              file_name = files.file.name;

          console.log('real file name: '+files.file.name);

          fs.readFile(old_path, function(err, data) {
            console.log('read data----------',data);
            m.pl = {
              imageData: data,
              imageExt:  file_ext,
              ign: file_name,
              uID: paramRequest.user.id,
              oID:paramRequest.user.id
            };

          });
        });




    esbMessage(m)
        .then(function(r) {

          paramResponse.writeHead(200, {"Content-Type": "application/json"});
          paramResponse.end(JSON.stringify(r));
        })
        .fail(function(r) {

          console.log(r.er);
          var r = {pl:null, er:{ec:404,em:"could not save image"}};
          oHelpers.sendResponse(paramResponse,404,r);
        });


  });

  return photosRouter;
};


var idphotos = {
  "pl": [{
      "photourl": "/commons/images/singlePhoto_03.jpg",
      "category": "其他照片",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    },
    {
      "photourl": "/commons/images/passportPhoto_ID.jpg",
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
    },
    {
      "photourl": "/commons/images/passportPhoto_other.jpg",
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
    }
    , {
      "photourl": "/commons/images/IDPhotoDemo5.png",
      "category": "曾经的美好回忆",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo2.png",
      "category": "海南美景",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo3.png",
      "category": "美好心情",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo4.png",
      "category": "IMG001",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo7.png",
      "category": "IMG002",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/photo2.jpg",
      "category": "逛逛",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/photo3.jpg",
      "category": "my pic",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo5.png",
      "category": "曾经的美好回忆",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }, {
      "photourl": "/commons/images/IDPhotoDemo2.png",
      "category": "海南美景",
      "pixelSize": "22mmx32mm",
      "fileSize": "120Kb",
      "uploadDate": "2013/07/22"
    }]
};
