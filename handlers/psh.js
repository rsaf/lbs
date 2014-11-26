
module.exports = function(paramPS, paramESB)
{
var psRouter = paramPS.Router();

//get Activity by lzcode
//get --> https://os.lanid.cn/v1/ps/activities/:lzcode.json
psRouter.get('/activities/:lzcode.json', function(paramRequest, paramResponse, paramNext){

});

//post photo(s) by activity id
//post --> https://os.lanid.cn/v1/ps/activities/:activityId/photos.json
psRouter.post('/activities/:activityId/photos.json', function(paramRequest, paramResponse, paramNext){

});

//get photo by activity id and photo id
//get --> https://os.lanid.cn/v1/ps/activities/:activityId/photos/:photoId.json
psRouter.get('/activities/:activitiyId/photos/:photoId.json',function(paramRequest, paramResponse, paramNext){

});

//get all photos by activity id
//get --> https://os.lanid.cn/v1/ps/activities/:activityId/photos.json
psRouter.get('/activities/:activityId/photos.json',function(paramRequest, paramResponse, paramNext){

});

  return psRouter;
}

