
module.exports = function(paramPS, paramESB) {
var psRouter = paramPS.Router();

//get Activity by lzcode
 //workspace/phototoservices/v1/idphotos/:lzcode.json
psRouter.get('/idphotos/:lzcode.json', function(paramRequest, paramResponse, paramNext){

});

  //get all photos by activity id
  //workspace/photoservices/v1/idphotos/:activityID.json
  psRouter.get('/idphotos/:activityId.json',function(paramRequest, paramResponse, paramNext){

  });

  //get photo by activity id and special code
  //workspace/photoservices/v1/idphotos/:activityID/:tzcode.json
psRouter.get('/idphotos/:activitiyID/:photoID.json',function(paramRequest, paramResponse, paramNext){

});

  return psRouter;
};

