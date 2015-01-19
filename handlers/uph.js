
var oHelpers= require('../utilities/helpers.js');

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

