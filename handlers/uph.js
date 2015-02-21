///forcing push


var oHelpers= require('../utilities/helpers.js');

   //added
  var  http = require('http');
  var  formidable = require('formidable');
  var fs = require('fs');

//API design supports standard HTTP verbs
//PUT --> Create (Creation)
//GET --> Read (Retrieval)
//POST --> Update (Updating)
//DELETE --> Delete (Destruction)
//two kind of URLs:  collections for example personals and or  specific items within collections such as p1007070990.json
//typically, collections should be nouns.
//collections of collections are possibles ( /workspace/profiles.json a collection and /workspace/profiles/personals.json collection within collection)

//put /workspace/v1/profiles/personals.json  --> will create a new personal user profile
//get /workspace/v1/profiles/personals/p1007070990.json --> will get a particular personal profile , can also be done as put workspace/profiles/:profileID.json,  :profileID.json is a variable
//post /workspace/v1/profiles/personals/p1007070990.json --> will update a particular personal profile
//delete /workspace/v1/profiles/personals/p1007070990.json --> will delete a particular personal profile

module.exports = function(paramPS, paramESBMessage) {
    var upRouter = paramPS.Router();
    var esbMessage = paramESBMessage;

// Upload route.
    //workspace/profiles/v1/upload
    upRouter.post('/upload.json', function(paramRequest, paramResponse){


        var m = {ns: 'upm',op:'upm_uploadAvatar', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            photoData:null,
            ifm:null,
            profileData:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            var profileToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function(err, data) {

                m.pl.photoData= data;
                m.pl.ifm = file_ext;
                m.pl.profileData = profileToUpdate;

                        esbMessage(m)
                            .then(function(r) {
                                    console.log('update successfull');
                                oHelpers.sendResponse(paramResponse,200,r);
                            })
                            .fail(function(r) {
                                console.log('errorror:');
                                console.log(r.er);
                                var r = {pl:null, er:{ec:404,em:"could not save avatar and update profile"}};
                                oHelpers.sendResponse(paramResponse,404,r);
                            });

                    })

            });


        });




//get workspace/profiles/v1/personal.json
    upRouter.get('/personal.json', function(paramRequest, paramResponse){

     //oHelpers.sendResponse(paramResponse,200,personalUserProfile );
        console.log("\n userID :" + paramRequest.user.id);
        var m = {
            "ns":"upm",
            "op": "readPersonalProfileByUserID",
            "pl":{"userAccountID":paramRequest.user.id}
        };

        esbMessage(m)
            .then(function(r) {
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find navigation"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });



    //get workspace/profiles/v1/idphotos.json
    upRouter.get('/idphotos.json', function(paramRequest, paramResponse){

        oHelpers.sendResponse(paramResponse,200,idphotos );

    });

    //get workspace/profiles/v1/otherphotos.json
    upRouter.get('/otherphotos.json', function(paramRequest, paramResponse){

        oHelpers.sendResponse(paramResponse,200,otherphotos );

    });

//get workspace/profiles/v1/personal.json
    upRouter.get('/personal/:profileID.json', function(paramRequest, paramResponse){

        var m = {
            "ns":"upm",
            "op": "readPersonalProfileByUserID",
            "pl":{userAccountID:paramRequest.user.id}
        };

        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find profile"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });



//post workspace/profiles/v1/personal.json
    upRouter.post('/personal.json', function(paramRequest, paramResponse){


        var m = {
            "ns":"upm",
            "op": "updatePersonalProfile",
            "pl":paramRequest.body
        };


        console.log('paramRequest.body----',paramRequest.body);

        esbMessage(m)
            .then(function(r) {

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
           console.log('errorror'+r);
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not update profile"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });




//get workspace/profiles/v1/corporateDetails/:profileID.json
    upRouter.get('/corporateDetails/:profileID.json', function(paramRequest, paramResponse){

        var m = {
            "ns":"upm",
            "op": "readCorporateDetailPageByID",
            "pl":{_id:paramRequest.user.id}
        };

        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find detail page"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });




    //post workspace/profiles/v1/personal.json
    upRouter.put('/corporateDetails/:profile_id.json', function(paramRequest, paramResponse){

        console.log('paramRequest.params.profile_id',paramRequest.params.profile_id);
        console.log('paramRequest.body',paramRequest.body);


        var m = {
            "ns":"upm",
            "op": "updateCorporateDetailProfile",
            "pl":paramRequest.body
        };


        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;

        esbMessage(m)
            .then(function(r) {


                console.log('r',r);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log('uph error:----- ', r);
                var r = {pl:null, er:{ec:404,em:"uph error: could not update corporate details"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });









    //workspace/profiles/v1/upload
    upRouter.post('/corporateDetails/upload.json', function(paramRequest, paramResponse){


        console.log('bingo-----');


        var m = {ns: 'upm',op:'upm_uploadCorporationDetailsLogo', pl: null};
        m.pl = {
            uID:paramRequest.user.lanzheng.loginName,
            oID:paramRequest.user.currentOrganization,
            photoData:null,
            ifm:null,
            profileData:null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function(err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            var profileToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function(err, data) {


                console.log('data-------',data )

                m.pl.photoData= data;
                m.pl.ifm = file_ext;
                m.pl.profileData = profileToUpdate;

                esbMessage(m)
                    .then(function(r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse,200,r);
                    })
                    .fail(function(r) {
                        console.log('uph error:-----');
                        console.log(r.er);
                        var r = {pl:null, er:{ec:404,em:"could not save logo and update profile"}};
                        oHelpers.sendResponse(paramResponse,404,r);
                    });

            })

        });


    });




//put workspace/v1/profiles/:personal.json
    upRouter.put('/personal/:profileID.json', function(paramRequest, paramResponse){
        console.log ()

});



//post workspace/v1/profiles/navigation.json
    upRouter.post('/navigation.json',function(paramRequest, paramResponse){
        var m = {
            "ns":"upm",
            "op": "updateUserNavigation",
            "pl":{ id:paramRequest.user.id,userType:paramRequest.user.userType }
        };

        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find navigation"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });
    });



//get workspace/v1/profiles/navigation.json
    upRouter.get('/navigation.json', function(paramRequest, paramResponse){

        var m = {
            "ns":"upm",
            "op": "getUserNavigation",
            "pl":{ id:paramRequest.user.id,userType:paramRequest.user.userType }
        };

        esbMessage(m)
            .then(function(r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find navigation"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

    upRouter.get('/:type.json', function(paramRequest, paramResponse, paramNext){
      if (paramRequest.params.type === 'personals'){
          oHelpers.sendResponse(paramResponse,200,personal);
      }
      else if(paramRequest.params.type === 'corporates'){
          oHelpers.sendResponse(paramResponse,200,corporate);
      }

    });
    return upRouter;
};



var personal = {
        "pl": [{
            "imageurl": "/commons/images/passportPhoto_other.jpg",
            "name": "Personal name",
            "creator": "系统创建",
            "dateCreated": "2013/07/22",
            "status": "正常"
        }
            , {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "Candy",
                "creator": "Andy",
                "dateCreated": "2013/05/10",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "Lsf",
                "creator": "Andy",
                "dateCreated": "2013/05/20",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "雪中情",
                "creator": "Andy",
                "dateCreated": "2013/06/13",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "漫天飞舞",
                "creator": "雪中情",
                "dateCreated": "2013/05/05",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "forever91",
                "creator": "雪中情",
                "dateCreated": "2013/05/22",
                "status": "正常"
            }]
    }
    ;

var corporate = {
        "pl": [{
            "imageurl": "/commons/images/passportPhoto_other.jpg",
            "name": "Corporate name",
            "creator": "系统创建",
            "dateCreated": "2013/07/22",
            "status": "正常"
        }
            , {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "Candy",
                "creator": "Andy",
                "dateCreated": "2013/05/10",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "Lsf",
                "creator": "Andy",
                "dateCreated": "2013/05/20",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "雪中情",
                "creator": "Andy",
                "dateCreated": "2013/06/13",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "漫天飞舞",
                "creator": "雪中情",
                "dateCreated": "2013/05/05",
                "status": "正常"
            }, {
                "imageurl": "/commons/images/passportPhoto_other.jpg",
                "name": "forever91",
                "creator": "雪中情",
                "dateCreated": "2013/05/22",
                "status": "正常"
            }]
    };


//get     /workspace/v1/profiles/personal.json ==> read
//get     /workspace/v1/profiles/personal/:personal.json ==>   /workspace/profiles/LZ000678987.json ==> read a specific user
//
//create (put)
//put    /workspace/v1/profile/personal.json  ==> creates a new profile
//
//update (delete)
//post   /workspace/v1/profile/personal/:personal.json  ==> update the profile
//
//delete /workspace/v1/profile/personal/:personal.json  ==> mark for delete
//
//get     /workspace/v1/profiles/corporate.json ==> read
//get     /workspace/v1/profiles/corporate/:corporate.json ==>   /workspace/profiles/LZ000678987.json ==> read a specific user
//
//create (put)
//put    /workspace/v1/profile/corporate.json  ==> creates a new profile
//
//update (delete)
//post   /workspace/v1/profiles/corporate/:corporate.json ==> update the profile
//
//delete /workspace/v1/profiles/corporate/:corporate.json  ==> mark for delete



var idphotos = {
    "pl": [
        {
            "photourl": "/commons/images/singlePhoto_03.jpg",
            "category": "其他照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1002
        },
        {
            "photourl": "/commons/images/passportPhoto_ID.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1003
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1004
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1005
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1006
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1007
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1008
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1009
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1010
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1011
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1012
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1013
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1014
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1015
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1016
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1017
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1018
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1019
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1020
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1021
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1022
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1023
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1024
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1025
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1026
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1027
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1028
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1029
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1030
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1031
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1032
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1033
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1034
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1035
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1036
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1037
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1038
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1039
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1040
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1041
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1042
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1043
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1044
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1045
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1046
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1047
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1048
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1049
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1050
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1051
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1052
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1053
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1054
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1055
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1056
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1057
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1058
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1059
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1060
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1061
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1062
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1063
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1064
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1065
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1066
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1067
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1068
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1069
        },
        {
            "photourl": "/commons/images/passportPhoto_other.jpg",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1070
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1071
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1072
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "工作照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1073
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1074
        },
        {
            "photourl": "/commons/images/IDPhotoDemo10.png",
            "category": "身份证照片",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1075
        }
    ]
}

var otherphotos = {

    "pl": [
        {
            "photourl": "/commons/images/IDPhotoDemo1.png",
            "category": "自由畅想",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1002
        },
        {
            "photourl": "/commons/images/IDPhotoDemo5.png",
            "category": "曾经的美好回忆",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1003
        },
        {
            "photourl": "/commons/images/IDPhotoDemo2.png",
            "category": "海南美景",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1004
        },
        {
            "photourl": "/commons/images/IDPhotoDemo3.png",
            "category": "美好心情",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1005
        },
        {
            "photourl": "/commons/images/IDPhotoDemo4.png",
            "category": "IMG001",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1006
        },
        {
            "photourl": "/commons/images/IDPhotoDemo7.png",
            "category": "IMG002",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1007
        },
        {
            "photourl": "/commons/images/photo2.jpg",
            "category": "逛逛",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1008
        },
        {
            "photourl": "/commons/images/photo3.jpg",
            "category": "my pic",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1009
        },
        {
            "photourl": "/commons/images/IDPhotoDemo5.png",
            "category": "曾经的美好回忆",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1010
        },
        {
            "photourl": "/commons/images/IDPhotoDemo2.png",
            "category": "海南美景",
            "pixelSize": "22mmx32mm",
            "fileSize": "120Kb",
            "uploadDate": "2013/07/22",
            "_id": 1011
        }
    ]
}



