//All lanID specific business logics for the personal photo module (document management module) are handle here

/*
 var m = {
 "ns":"olm",
 "op": "readOperationsLog",
 "pl": {"userAccountID": "value1", "opType":"value2", "pageNumber":"value3", "pageSize":"value4"}
 };

 var r = {
 "er":"value",
 "pl": "value",
 "mv": null
 }
 */

var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramService, esbMessage)
{
  var photosRouter = paramService.Router();

    photosRouter.get('/:photoType.json', function(paramRequest, paramResponse, paramNext){
    //console.log('get all json called  ');

        if (paramRequest.params.photoType === 'idphotos'){
            oHelpers.sendResponse(paramResponse,200,idPhotos);
        }
        else if(paramRequest.params.photoType === 'otherPhotos'){
            oHelpers.sendResponse(paramResponse,200,otherPhotos);
        }

        else if(paramRequest.params.photoType === 'processing'){
            oHelpers.sendResponse(paramResponse,200,processsing);
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

  return photosRouter;
};


var idPhotos = {
    "pl": [{"photourl":"/commons/images/passportPhoto_ID.jpg","category":"其他照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/passportPhoto_ID.jpg","category":"身份证照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/passportPhoto_other.jpg","category":"身份证照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/passportPhoto_other.jpg","category":"身份证照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/passportPhoto_other.jpg","category":"身份证照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/passportPhoto_other.jpg","category":"身份证照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo10.png","category":"工作照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo10.png","category":"身份证照片","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"}]
};


var otherPhotos = {
    "pl": [{"photourl":"/commons/images/IDPhotoDemo1.png","category":"自由畅想","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo5.png","category":"曾经的美好回忆","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo2.png","category":"海南美景","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo3.png","category":"美好心情","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo4.png","category":"IMG001","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/IDPhotoDemo7.png","category":"IMG002","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/photo2.jpg","category":"逛逛","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"/commons/images/photo3.jpg","category":"my pic","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"}]
};

var processsing = {
    "pl": [{"photourl":"//localhost/commons/images/passportPhoto_ID.jpg","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/passportPhoto_ID.jpg","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/passportPhoto_other.jpg","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/passportPhoto_other.jpg","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/passportPhoto_other.jpg","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/passportPhoto_other.jpg","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/IDPhotoDemo10.png","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"},{"photourl":"//localhost/commons/images/IDPhotoDemo10.png","category":"","pixelSize":"22mmx32mm","fileSize":"120Kb","uploadDate":"2013/07/22"}]
};
