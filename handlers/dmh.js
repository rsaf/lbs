/**
 * endpoints for /workspace/photos
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers = require('../utilities/helpers.js');
var fs  = require('fs');

module.exports = function (paramService, esbMessage)
{
  var photosRouter = paramService.Router();

  photosRouter.get('/:photoType.json', function (paramRequest, paramResponse, paramNext) {
    if (paramRequest.params.photoType === 'idphotos') {
      oHelpers.sendResponse(paramResponse, 200, idphotos);
    }
    else if (paramRequest.params.photoType === 'processing') {
      oHelpers.sendResponse(paramResponse, 200, processing);
    }

    else if (paramRequest.params.photoType === 'otherphotos') {
      oHelpers.sendResponse(paramResponse, 200, otherphotos);
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
  photosRouter.post('/upload.json', function (paramRequest, paramResponse, paramNext) {


    var m = {ns: 'dmm',op:'dmm_uploadPhoto', pl: null};
    m.pl = {
        uID:paramRequest.user.lanzheng.loginName,
        oID:'54c1c79c4d754999038abf1c',
        imageData:null,
        imageExt: null,
        //sg:{code:10, text:原照}, //Stage, possible values {10 'original',20 'inspection', 30 'correction', 40 'processing', 50 'activity', 60 'personal', 70 'corporate' }
        //st:{code:100, text:等待},  //Status, possible values {100: pending, 200: success, 300: rejected }
        //rc:'54c1c79c4d754999038abf1b', //business activity response code code
        //tc:'54c1c79c4d754999038abf1b', // business activity transaction code
        uri: null, // String to physical photo location // AC1279908_SCM15900655434_UC12996987669_OC_2079877898.jpg
        ign:null // imageName
    };




      var form = new formidable.IncomingForm();
      form.parse(paramRequest, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            file_name =files.file.name;


        console.log('-------fields--------', fields);

        fs.readFile(old_path, function(err, data) {
            m.pl.imageData= data;
            m.pl.imageExt = file_ext;
            m.pl.ign = file_name;
            console.log('-------data--------', data);

         // m.pl =
          esbMessage(m)
              .then(function (r) {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
              })
              .fail(function (r) {

                console.log(r.er);
                var r = {pl: null, er: {ec: 404, em: "could not save image"}};
                oHelpers.sendResponse(paramResponse, 404, r);
              });



          //
          //fs.writeFile(new_path, data, function(err) {
          //  console.log('data--------', data);
          //  fs.unlink(old_path, function(err) {
          //    if (err) {
          //      paramResponse.status(500);
          //      paramResponse.json({'success': false});
          //    } else {
          //      paramResponse.status(200);
          //      paramResponse.json({'success': true});
          //    }
          //  });
          //});
          //


        });
      });












  });

  return photosRouter;
};

var idphotos = {"pl": [
    {"photourl": "/commons/images/singlePhoto_03.jpg"
      , "category": "其他照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 0}
    , {"photourl": "/commons/images/passportPhoto_ID.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 1}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 2}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 3}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 4}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 5}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 6}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 7}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 8}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 9}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 10}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 11}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 12}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 13}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 14}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 15}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 16}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 17}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 18}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 19}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 20}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 21}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 22}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 23}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 24}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 25}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 26}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 27}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 28}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 29}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 30}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 31}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 32}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 33}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 34}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 35}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 36}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 37}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 38}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 39}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 40}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 41}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 42}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 43}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 44}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 45}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 46}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 47}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 48}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 49}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 50}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 51}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 52}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 53}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 54}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 55}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 56}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 57}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 58}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 59}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 60}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 61}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 62}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 63}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 64}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 65}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 66}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 67}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 68}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 69}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 70}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "工作照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 71}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 72}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "身份证照片", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 73}]}

var processing = {"pl": [{"photourl": "/commons/images/passportPhoto_ID.jpg", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 0}, {"photourl": "/commons/images/passportPhoto_ID.jpg", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 1}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 2}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 3}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 4}, {"photourl": "/commons/images/passportPhoto_other.jpg", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 5}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 6}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 7}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 8}, {"photourl": "/commons/images/IDPhotoDemo10.png", "category": "", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 9}]};

var otherphotos = {"pl": [{"photourl": "/commons/images/IDPhotoDemo1.png", "category": "自由畅想", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 0}, {"photourl": "/commons/images/IDPhotoDemo5.png", "category": "曾经的美好回忆", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 1}, {"photourl": "/commons/images/IDPhotoDemo2.png", "category": "海南美景", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 2}, {"photourl": "/commons/images/IDPhotoDemo3.png", "category": "美好心情", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 3}, {"photourl": "/commons/images/IDPhotoDemo4.png", "category": "IMG001", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 4}, {"photourl": "/commons/images/IDPhotoDemo7.png", "category": "IMG002", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 5}, {"photourl": "/commons/images/photo2.jpg", "category": "逛逛", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 6}, {"photourl": "/commons/images/photo3.jpg", "category": "my pic", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 7}, {"photourl": "/commons/images/IDPhotoDemo5.png", "category": "曾经的美好回忆", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 8}, {"photourl": "/commons/images/IDPhotoDemo2.png", "category": "海南美景", "pixelSize": "22mmx32mm", "fileSize": "120Kb", "uploadDate": "2013/07/22", "code": 9}]}
