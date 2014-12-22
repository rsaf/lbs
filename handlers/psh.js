
var oHelpers= require('../utilities/helpers.js');

module.exports = function(paramPS, paramESB) {
var psRouter = paramPS.Router();

//get photo by lzcode
 //workspace/phototoservices/v1/idphotos/:lzcode.json
psRouter.get('/idphotos/:lzcode.json', function(paramRequest, paramResponse, paramNext){

  oHelpers.sendResponse(paramResponse,200,{pl:'get photo by lzcode', er: null});

});

  //get all photos by activity id
  //workspace/photoservices/v1/idphotos/:activityID.json
  psRouter.get('/idphotos/:activityId.json',function(paramRequest, paramResponse, paramNext){
    oHelpers.sendResponse(paramResponse,200,{pl:'get all photos by activity code', er: null});

  });

  //get photo by activity id and special code
  //workspace/photoservices/v1/idphotos/:activityID/:tzcode.json
psRouter.get('/idphotos/:activitiyID/:photoID.json',function(paramRequest, paramResponse, paramNext){

  oHelpers.sendResponse(paramResponse,200,{pl:'get all photos by special code', er: null});
});

  return psRouter;
};

