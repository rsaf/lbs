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
