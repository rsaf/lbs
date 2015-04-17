/**
 * endpoints for /workspace/photos
 * created by harmmeiier@gmail.com
 * returns static json for all endpoints
 */
var oHelpers = require('../utilities/helpers.js');
var fs  = require('fs');
var    formidable = require('formidable');

module.exports = function (paramService, esbMessage)
{
  var photosRouter = paramService.Router();

  photosRouter.get('/:photoType.json', function (paramRequest, paramResponse, paramNext) {
    if (paramRequest.params.photoType === 'idphotos') {
      oHelpers.sendResponse(paramResponse, 200, idphotos);
    }
    else if (paramRequest.params.photoType === 'processing') {


        var m = {
            "ns": "pmm",
            "op": "pmm_getUnderProcessingPhotosByOwner",
            "pl":{
                ow:{ uid: paramRequest.user.lanzheng.loginName,
                    oid: paramRequest.user.currentOrganization
                   }
                }
        };

        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                 console.log('dmh error---',r);
                oHelpers.sendResponse(paramResponse, 501, r);
            });



      //oHelpers.sendResponse(paramResponse, 200, processing);
    }

    else if (paramRequest.params.photoType === 'otherphotos') {
        var m = {
            "ns": "dmm",
            "op": "dmm_getUserPhotos",
            "pl":null
        };
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization
        };
        esbMessage(m)
            .then(function (r) {
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                oHelpers.sendResponse(paramResponse, 501, r);
            });

    }
  });

  ///workspace/photos/:photocode.json
  photosRouter.delete('/:photocode.json', function(paramRequest, paramResponse, paramNext){



      var m= {ns: null,op:'dmm_markPhotoForDelete', pl: null};
      m.pl = {
          uID:paramRequest.user.lanzheng.loginName,
          oID:paramRequest.user.currentOrganization,
          _id:paramRequest.params.photocode
      };



//      var m= {ns: null,op:'dmm_markPhotoForDelete', pl: {}};
//
//      m.pl.uID=paramRequest.user.lanzheng.loginName;
//      m.pl.oID=paramRequest.user.currentOrganization;
//      m.pl._id=paramRequest.params.photocode;



      console.log("photocode: ",paramRequest.params.photocode);


      esbMessage(m)
          .then(function (r) {

              console.log('deleted photo response: ',r)
              oHelpers.sendResponse(paramResponse, 200, r);
          })
          .fail(function (r) {

              console.log('error ----: ', r.er)

              oHelpers.sendResponse(paramResponse, 501, r);
          });

  });

// /workspace/photos/upload.json
  photosRouter.post('/upload.json', function (paramRequest, paramResponse, paramNext) {

    var m = {ns: 'dmm',op:'dmm_uploadPhoto', pl: null};
    m.pl = {
        uID:paramRequest.user.lanzheng.loginName,
        oID:paramRequest.user.currentOrganization,
        photoData:null,
        sgc:10,
        stc:100,
        opp:{ //other photos properties
            ign:null, // 照片名称: image name                                      ===
            igt:null, // 主题类型: 旅游照片 image type                              ===
            igs:null, // 拍摄方式: 单板相机 image source                            ===
            isl:null, // 拍摄地点:  image shooting location                        ===
            rm:null,  // 照片描述: // 30 remarks 备注                               ===
            isd:null, // 拍摄日期: // image shooting date                          ?
            irs:null, // 像素尺寸:84mmX105mm image resolution size                  ?
            ofs:null, // 文件大小:86Kb //28 original photo size 初始照片文件大小      ===
            ifm:null  // 27 initial format 初始照片格式                              ===
        },
        uri: null // String to physical photo location // AC1279908_SCM15900655434_UC12996987669_OC_2079877898.jpg
    };


      var form = new formidable.IncomingForm();
      form.parse(paramRequest, function(err, fields, files) {

        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            file_name =files.file.name;


        fs.readFile(old_path, function(err, data) {
            m.pl.photoData= data;
            m.pl.opp.ifm = file_ext;
            m.pl.opp.ofs = file_size;
            m.pl.opp.ign = file_name;
            m.pl.opp.igt = fields['imgInfo[1][value]'];
            m.pl.opp.igs = fields['imgInfo[2][value]'];
            m.pl.opp.isl = fields['imgInfo[3][value]'];
            m.pl.opp.rm  = fields['imgInfo[4][value]'];
            //m.pl.opp.isd = fields['imgInfo[5][value]'];  // the date from the user input needs to be validated
            m.pl.opp.isd = Date.now();
            m.pl.opp.irs = fields['imgInfo[6][value]'];;

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
        });
      });

  });

    // http://localhost/#/workspace/documents/
    //workspace/blobs/documents/all.json


    photosRouter.get('/:doctype/all.json', function (paramRequest, paramResponse, paramNext) {

                console.log('dmh get use documents------');

            var m = {
                "ns": "dmm",
                "op": "dmm_getUserDocuments",
                "pl":null
            };
            m.pl = {
                ft:paramRequest.params.doctype,
                uID:paramRequest.user.lanzheng.loginName,
                oID:paramRequest.user.currentOrganization
               };

        esbMessage(m)
                .then(function (r) {

                    console.log('dmh get document successful----',r);
                    oHelpers.sendResponse(paramResponse, 200, r);
                })
                .fail(function (r) {

                    console.log('dmh error----:',r);
                    oHelpers.sendResponse(paramResponse, 501, r);
                });


    });



    //
//m.pl = {
//    fn: null,
//    ft: null,
//    rm: null,
//    fs: null,
//    fm: null,
//    uri: null
//    uID: null,
//    oID: null,
//    fd: null
//}
    //workspace/blobs/documents/upload.json
    photosRouter.post('/:doctype/upload.json', function (paramRequest, paramResponse, paramNext) {

        console.log('dmh  uploading document-----');

        var m = {ns: 'dmm',op:'dmm_uploadDocument', pl: null};
        m.pl = {
            fn: null,
            ft: null,
            rm: null,
            fs: null,
            fm: null,
            uri: null,
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            fd:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {


            var fileInfo = JSON.parse(fields.fileInfo);

            console.log('fields----', fileInfo);

            var old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                file_name =files.file.name;

                console.log('file name:---',file_name);


            fs.readFile(old_path, function(err, data) {
                m.pl.fn = file_name;
                m.pl.ft = paramRequest.params.doctype;
                m.pl.rm  = fileInfo.description;
                m.pl.fs = file_size;
                m.pl.fm = file_ext;
                m.pl.fd = data;

                esbMessage(m)
                    .then(function (r) {
                        paramResponse.writeHead(200, {"Content-Type": "application/json"});

                        console.log('dmh upload successful---',r);

                        paramResponse.end(JSON.stringify(r));
                    })
                    .fail(function (r) {
                        console.log('dmh error-----:',r.er);
                        var r = {pl: null, er: {ec: 404, em: "could not save document"}};
                        oHelpers.sendResponse(paramResponse, 404, r);
                    });
            });
        });

    });


    photosRouter.delete('/documents/:doc_id.json', function (paramRequest, paramResponse, paramNext) {

        var m= {ns: null,op:'dmm_markDocumentForDelete', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            _id:paramRequest.params.doc_id
        };


//      var m= {ns: null,op:'dmm_markPhotoForDelete', pl: {}};
//
//      m.pl.uID=paramRequest.user.lanzheng.loginName;
//      m.pl.oID=paramRequest.user.currentOrganization;
//      m.pl._id=paramRequest.params.photocode;



        console.log("doc_id: ",paramRequest.params.doc_id);


        esbMessage(m)
            .then(function (r) {

                console.log('deleted document response: ',r)
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {

                console.log('dmr error ----: ', r.er)

                oHelpers.sendResponse(paramResponse, 501, r);
            });

    });

    return photosRouter;
};


var processing = {"pl":[{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":0}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":1}},{"urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":2}},{"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":3}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":4}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":5}},{"urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":6}},{"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":7}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":8}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":9}},{"urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":10}},{"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":11}}]}

var idphotos = {"pl":[
    {
    "urll":"/commons/images/big_photo1.jpg",
    "urlm":"/commons/images/passportPhoto_other.jpg",
    "urls":"/commons/images/passportPhoto_other.jpg",
    "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":0}},
    {    "urll":"/commons/images/big_photo2.jpg",
        "urlm":"/commons/images/IDPhotoDemo10.png",
        "urls":"/commons/images/IDPhotoDemo10.png",
        "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":1}},
    {
        "urll":"/commons/images/big_photo3.jpg",
        "urlm":"/commons/images/passportPhoto_ID.jpg",
        "urls":"/commons/images/passportPhoto_ID.jpg",
        "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":2}},
    {
        "urll":"/commons/images/big_photo4.jpg",
        "urlm":"/commons/images/passportPhoto_ID.jpg",
        "urls":"/commons/images/passportPhoto_ID.jpg",
        "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":3}},
    {
        "urll":"/commons/images/passportPhoto_other.jpg",
        "urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg",
        "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":4}},
    {"urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg",
        "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":5}},
    {"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png",
        "opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":6}},
    {"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":7}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":8}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":9}},{"urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":10}},{"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":11}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":12}},{"urlm":"/commons/images/passportPhoto_ID.jpg","urls":"/commons/images/passportPhoto_ID.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":13}},{"urlm":"/commons/images/passportPhoto_other.jpg","urls":"/commons/images/passportPhoto_other.jpg","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":14}},{"urlm":"/commons/images/IDPhotoDemo10.png","urls":"/commons/images/IDPhotoDemo10.png","opp":{"igt":"身份证照片","irs":"22mmx32mm","ofs":"120Kb","isd":"2013/07/22","_id":15}}]}
