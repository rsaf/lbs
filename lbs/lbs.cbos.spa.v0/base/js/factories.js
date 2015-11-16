/**
 * Created by lbs005 on 11/2/15.
 */



define([],function(){

  //lbs.cbos.factories
 return function(cbosFactory){
     cbosFactory('lbs.cbos.spaLogin', ['$http', function ($http) {
         return  {request:function (m){
             console.log('trying to login user ');
             return $http.post('/api/login.json', m.pl).then(function success (response) {
                 console.log('user login  ',response);
                 return response.data;}).then(null, function failure(response){
                 //@Todo handle error properly
                 return response.data;
             });
         }
         };
     }]);
     cbosFactory('lbs.cbos.spaUser', ['$http', function ($http) {
         return {
             request: function (m) {
                 console.log('SPA: trying to load  user data ...');
                 return $http.get('/api/user.json').then(function success(response) {
                     console.log('SPA: user data response  ', response);
                     return response.data;
                 }).then(null, function failure(response) {
                     //@Todo handle error properly
                     return response.data;
                 });
             }
         };
     }]);
     cbosFactory('lbs.cbos.api', ['$http', function ($http) {
         return {
             message: function (m) {
                 console.log(m);
                 if (m.vb === 'post') {
                     return $http.post(m.ep, m).then(function success(response) {
                         console.log('server response  ', response);
                         return response.data;
                     }).then(null, function failure(response) {
                         //@Todo handle error properly
                         return response.data;
                     });
                 }
                 else {
                     return $http.get(m.ep, m).then(function success(response) {
                         console.log('server response ', response);
                         return response.data;
                     }).then(null, function failure(response) {
                         //@Todo handle error properly
                         return response.data;
                     });
                 }
             }
         };
     }]);
     cbosFactory('spaLogout', ['$http', function ($http) {
         return  {request:function (m){
             return $http.get('/api/logout.json').then(function (response) {
                 return response.data;});
         }
         };
     }]);
     cbosFactory('lbs.cbos.changeState', ['$state','$stateParams', function ($state,$stateParams) {
         return  {toState:function (arg){
             console.log('toState  ====== ',arg);
             $state.go(arg.name,arg.param);
         },
             params:$stateParams
         };
     }]);
     cbosFactory('lbs.cbos.recover.login', ['lbs.cbos.spaLogin','$modal', function (spaLoginFactory,$modal) {

         return  {
             modalPromt:function(){

                 var modal =  $modal({templateUrl: 'base/views/modalLogin.html',controller:'loginCtrl', show: false});
                 return modal.$promise.then(modal.show);

             }
         };
     }]);
     cbosFactory('lbs.cbos.spaMessage', ['$http','lbs.cbos.moduleHelper.recover', function ($http,recoverFactory) {
         console.log('SPA: setting up spaMessage factory');
         var returnSpaMessage =  {
             request: function(m){
                 console.log(m);
                 var message = {
                     "m": {        //todo this message should be defined in a config function that will be injected as dependecy on the spaMessage factory
                         "dns": "wms",
                         "sns": "spa",
                         "vr": "1.0.0",
                         "ac": null,
                         "op" : m.op,
                         "wf": m.wf,
                         "pl": JSON.parse(JSON.stringify(m.pl)),
                         "sqm": m.sqm,
                         "er": null
                     }
                 };
                 return $http.post('/wms/message.json', message).then( function success(response) {
                     return response.data;
                 }).then(null, function reject(response){
                     return  recoverFactory.recover(m).then(function () {
                         console.log('after recover success----');
                     }).then(null, function reject(reason) {
                         console.log('after recover fail----');
                         return reason;
                     });
                 });
             }
         };
         return returnSpaMessage;
     }]);
     cbosFactory('lbs.cbos.moduleHelper.recover',['lbs.cbos.recover.login','lbs.cbos.util.showFailureMessage', function(recoverLoginFactory,showFailureMessage){
         console.log('SPA: settup up recovery factory');
         return {
             recover: function(arg){
                 console.log('lbs.cbos.util.showFailureMessage return object');


                 return recoverLoginFactory.modalPromt(arg);


                 if(arg&&arg.custom){ //todo can be used to pass custom messages from the getMessage() method
                     showFailureMessage.show({message:arg.custom});
                 }


                 // else if (arg && arg.msg && arg.msg.responseJSON && arg.msg.responseJSON.er) {
                 //   if (arg.msg.responseJSON.er.ec === 8401 || arg.msg.responseJSON.er.ec === 8404) {
                 //      return recoverLoginFactory.modalPromt(arg);
                 //    }
                 // }
                 else if (arg && arg.msg && arg.msg.readyState === 0) {
                     console.log('do something for not connected', arg);

                     showFailureMessage.show({message:'Not connected, please check your connection!'});

                     //@todo: handle a disconnected state
                 }
                 else if (arg && arg.msg && arg.msg.status === 500) {

                     showFailureMessage.show({message:'Server error: please try again later!'});

                 }
                 else if (arg && arg.msg && arg.msg.status === 404) {

                     showFailureMessage.show({message:'resource not found, please try again!'});

                 }
                 else {
                     console.log('Unkown failure:', arg);
                     showFailureMessage.show({message:'Unknown failure, please try again later!'});
                 }


                 var d = jQuery.Deferred();
                 setTimeout(function () {
                     console.log('rejecting');
                     d.reject('Unable to recover or recover not implemented.');//todo: must reject so that the spaMessage doesn't go into an endless loop.
                 });
                 return d.promise();
             }
         };

     }]);
     cbosFactory('lbs.cbos.moduleHelper.spaView', ['$http', function ($http) {


         return {

             request: function (url){

                 console.log('lbs.cbos.moduleHelper.spaView');

                 $http.get(url).then(
                     function success(response) {
                         return response.data;
                     }
                     ,function reject(response){

                         alert('failed to get view');

                     });

             }


         };

     }]);
     cbosFactory('lbs.cbos.util.showFailureMessage',['lbs.cbos.moduleHelper.spaView','$sce','$modal',function(spaView,$sce,$modal){

         return {
             show: function(arg){
                 console.log('lbs.cbos.util.showFailureMessage');
                 // if(arg&&arg.message){
                 // $scope.message = arg.message;
                 var modal =  $modal({templateUrl: 'base/views/faillure.html',controller:function(){}, show: false});
                 return modal.$promise.then(modal.show);

                 //   }
             }
         };
     }]);

     cbosFactory('lbs.cbos.lazyLoader', ['$q', function ($q) {

             return {
                    loadDependencies:function(deps){
                        var deferred = $q.defer();

                             if(deps && deps instanceof Array) {
                                 require(deps, function() {
                                     deferred.resolve();
                                 });
                             } else {
                                 deferred.resolve();
                             }

                         return deferred.promise;
                     }
                 };


          }]);


  }


});
