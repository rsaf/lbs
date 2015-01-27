
var oHelpers= require('../utilities/helpers.js');


//added
http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');





















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

//

module.exports = function(paramPS, paramESBMessage) {
    var upRouter = paramPS.Router();
    var esbMessage = paramESBMessage;









// Upload route.
    //workspace/profiles/v1/upload
    upRouter.post('upload.json', function(req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            // `file` is the name of the <input> field of type `file`
            var old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                index = old_path.lastIndexOf('/') + 1,
                file_name = old_path.substr(index),
               // new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

               // new_path = path.join('/uploads/'+ file_name + '.' + file_ext);

               new_path =  '/Users/rollandsafort/Desktop/test/'+ file_name + '.' + file_ext;

            console.log('---------------old_path',old_path,'---------------------');

            fs.readFile(old_path, function(err, data) {

                console.log('---------------data :',data,'---------------------');
                console.log('---------------file_size :',file_size,'---------------------');
                console.log('--------------- file_name: ', file_name,'---------------------');
                console.log('--------------- new_path: ', new_path,'---------------------');

                fs.writeFile(new_path, data, function(err) {
                    fs.unlink(old_path, function(err) {
                        if (err) {
                            res.status(500);
                            res.json({'success': false});
                        } else {
                            res.status(200);
                            res.json({'success': true, 'data':"<img src:'+ data+'+>"});
                        }
                    });
                });
            });
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


                console.log('-------------resource fetched successfully------------------:');
                console.log('---------------requested resource--------------------:');
                console.log(r);

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
                var r = {pl:null, er:{ec:404,em:"could not find navigation"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });

//post workspace/profiles/v1/personal.json
    upRouter.post('/personal.json', function(paramRequest, paramResponse){

        console.log('--------------- new post request--------------------');
        console.log('--------------- new post request--------------------');
        console.log('--------------- new post request--------------------');
        console.log('------------------post body--------------------:');
        console.log(paramRequest.body);
        console.log('--------------- end of new post request--------------------');
        console.log('--------------- end of new post request--------------------');
        console.log('--------------- end of new post request--------------------');



        var m = {
            "ns":"upm",
            "op": "createPersonalProfile",
            "pl":paramRequest.body
        };

//        m.pl.userAccountID="54c1c79c4d754999038abf1b";
//        m.pl.lzID = "642d0eff3748330000dc5631";
//        m.pl.lzID.completion = 10;

        esbMessage(m)
            .then(function(r) {


                var feedback = {'status':true}
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);

                oHelpers.sendResponse(paramResponse,200,r);
            })
            .fail(function(r) {
           console.log('errorror'+r);

                var feedback = {'status':false}
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log('feedback----------',feedback);
                console.log(r.er);
                var r = {pl:null, er:{ec:404,em:"could not find navigation"}};
                oHelpers.sendResponse(paramResponse,404,r);
            });

    });





    //post workspace/profiles/v1/personal.json
    upRouter.post('/upload.json', function(paramRequest, paramResponse){

        console.log('--------------- new post request--------------------');
        console.log('--------------- new post request--------------------');
        console.log('--------------- new post request--------------------');
        console.log(paramRequest);


        console.log('--------------- end of new post request--------------------');
        console.log('--------------- end of new post request--------------------');
        console.log('--------------- end of new post request--------------------');
        oHelpers.sendResponse(paramResponse,200,paramRequest.body);





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
      if (paramRequest.params.type === 'personal'){
          oHelpers.sendResponse(paramResponse,200,personal);
      }
      else if(paramRequest.params.type === 'corporate'){
          oHelpers.sendResponse(paramResponse,200,corporate);
      }

    });
    return upRouter;
};

//
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

var personalUserProfile = {
    "pl":{
        "basic":{
            "avatar":"../../commons/images/bachend/backendProfilePic.png"
            ,"userName":"Frankie"
            ,"gender":"女"
            ,"dateOfBirth":"1990/10/20"
            ,"country":"中国"
            ,"placeOfBrith":"江苏省南京市"
            ,"currentResidence":"江苏省南京市"

        }
        ,"private":{
            "lastestPhoto":"../../commons/images/Latest-photo.jpg"
            ,"IDNumber":"无"
            ,"fullName":"无"
            ,"lanID":"无"

        }
        ,"contacts":{
            "email":"**780183@qq.con"
            ,"linkToPhone":"150****0157可直接使用此号码登录"
            ,"linkToQQ":"未设置QQ绑定"
            ,"linkToWechat":"未设置微信绑定"

        }
    }
};




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
};

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

