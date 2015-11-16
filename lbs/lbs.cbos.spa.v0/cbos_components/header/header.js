/**
 * Created by lbs005 on 8/12/15.
 */

define(['cbos'], function(cbos) {


    'use strict'

    console.log("cbos object in header controller .. ", cbos);

    cbos.controllers('headerController', function ($scope, $state, gettextCatalog) {
        console.log(' header controllers loading ');
        $scope.user = lbs.cbos.user;


      $scope.switchlanguage = function(){
          console.log("Current Language %s", gettextCatalog.currentLanguage );
          if (gettextCatalog.currentLanguage === 'zh_CN'){
              gettextCatalog.currentLanguage='en';
          }
          else if (gettextCatalog.currentLanguage === 'en'){
              gettextCatalog.currentLanguage = 'zh_CN'
          }
          $state.forceReload();
          console.log("Current Language %s", gettextCatalog.currentLanguage );
      }

    });

    cbos.directives('cbosHeader', function () {
        console.log("cbos header directives ...");
        return {
            restrict: 'E',
            scope: {
                onChange: '&'
            },
            controller: 'headerController',
            templateUrl: 'cbos_components/header/view.html'
        }
    });

    cbos.controllers('mobileSearchBox', function ($scope, $modal) {
        $scope.showSearch = function () {
            // alert('show search');
            // Pre-fetch an external template populated with a custom scope
            var myModal = $modal({
                scope: $scope,
                templateUrl: 'cbos_components/header/resources/partials/mobileSearchBox.html'
            });
            // Show when some event occurs (use $promise property to ensure the template has been loaded)
            $scope.myModal = function () {
                myModal.$promise.then(myModal.show());
            };
        }

    });

    cbos.controllers('mobileMenuAside', ['spaLogout', '$scope', '$aside','$state','$rootScope', function (spaLogout, $scope, $aside,$state,$rootScope) {

        var myOtherAsideRef = null;
        $scope.navigation = {}; //will store the navigations for opened apps;
        $scope.showSideMenu = function () {

            var appName = $state.params&&$state.params.appName?$state.params.appName:'DESKTOP';
            $scope.appName = appName;

            if($scope.navigation[appName]){
                showNavigation();
            }
            else if(appName==='DESKTOP'){

                $scope.navigation['DESKTOP'] =  lbs.cbos.user.desktop.leftnav.layouts;  //must already be set by the routes;
                showNavigation();
            }
            else{


                $scope.appInfo = lbs.cbos.user.desktop.apps[appName];

                lbs.cbos.message({
                    "op": "ams_read_entity",
                    "sqm": {"parent":lbs.cbos.user.desktop.apps[appName].eid},
                    "pl": {"navigationleft": {}}
                }).then(function success(r) {
                    $scope.navigation[appName] = lbs.cbos.user.desktop.apps[appName].layouts;
                    showNavigation();
                });
            }


        };


        $scope.logout = function () {
            console.log('USER ======> loged out');
            spaLogout.request({}).then(function success(r){
                if(myOtherAsideRef) {myOtherAsideRef.hide();}
                lbs.cbos.user = null;
                $state.go('login');
            }).then(null, function failure(er){

            })

        };



        function showNavigation(){
            myOtherAsideRef = $aside({
                scope: $scope,
                templateUrl: 'cbos_components/header/resources/partials/mobileDesktopMenu.html',
                keyboard:false
            });
            myOtherAsideRef.$promise.then(function () {
                myOtherAsideRef.show();
            });
        }

    }]);

    cbos.controllers('menuController', ['$scope', '$modal', 'lbs.cbos.moduleHelper.spaView','$state','$rootScope','spaLogout', function ($scope, $modal, spaView,$state,$rootScope, spaLogout) {

        var self = this;
        var mobileMenuAsideRef = null;

        $scope.showSideMenu = function () {
            mobileMenuAsideRef = $aside({
                scope: $scope,
                templateUrl: 'cbos_components/header/resources/partials/mobileDesktopMenu.html'
            });
            mobileMenuAsideRef.$promise.then(function () {
                mobileMenuAsideRef.show();
            });
        };
        $scope.logout = function () {
            if(mobileMenuAsideRef){mobileMenuAsideRef.hide()};
            console.log('USER ======> loged out');
            spaLogout.request({}).then(function success(r){
                lbs.cbos.user = null;
                $state.go('login');
            }).then(null, function failure(er){

            })
        };


        $scope.createCanvas = function(){

            var canvasCode = lbs.cbos.generateCode();

            var message = {
                "op": "ams_create_entity",
                "pl": {
                    "canvas": {
                        parent:lbs.cbos.user.desktop.apps[$state.params.appName].eid,
                        ufid: canvasCode
                    }
                }
            };

            console.log('create canvas---------',message);

            lbs.cbos.message(message).then(function(response){
                console.log('canvas created succesfully----------',response);
                lbs.cbos.user.desktop.apps[$state.params.appName]["canvases"]={};
                lbs.cbos.user.desktop.apps[$state.params.appName].canvases[canvasCode] = response.pl.canvas;
                $state.go('desktop.app.canvas.general',{canvasName:canvasCode});
            });


        };

    }]);




    cbos.directives('cbosToolboxSlider', ['$window',function ($window) {
        return {
            restrict: 'A',
            controller:'toolBoxAppIconsRender',
            link: function (scope, elem, attrs) {



                elem.on('click touch', function () {

                   // var width = $window.innerWidth;

                    var cbosToolBox = angular.element(document.getElementById('cbosToolBox'));
                    var topNavigation = angular.element(document.getElementsByClassName('topNavigation'));
                    var toolbox_slick_prev =  angular.element(document.getElementsByClassName('toolbox-slick-prev'));
                    var toolbox_slick_next =  angular.element(document.getElementsByClassName('toolbox-slick-next'));
                    var tootboxSliderHelper =  angular.element(document.getElementsByClassName('tootboxSliderHelper'));
                    var mainContainerInner =  angular.element(document.getElementsByClassName('mainContainerInner'));
                    var animationTime = '250';


                    if(cbosToolBox.hasClass('initClass')){
                        cbosToolBox[0].style.visibility = 'visible';
                        topNavigation[0].style.marginTop = '0';
                        cbosToolBox.slideDown(animationTime);
                        toolbox_slick_prev.slideDown(animationTime);
                        toolbox_slick_next.slideDown(animationTime);
                        cbosToolBox.removeClass('initClass');
                        cbosToolBox.removeClass('closed');
                        cbosToolBox.addClass('open');
                        tootboxSliderHelper[0].style.height='110px';
                        tootboxSliderHelper.slideDown(animationTime);
                        mainContainerInner.animate({scrollTop: 0}, "fast");
                    }
                    else{

                        if(cbosToolBox.hasClass('closed')){
                            cbosToolBox.removeClass('closed');
                            cbosToolBox.addClass('open');
                            tootboxSliderHelper[0].style.height='110px';
                            cbosToolBox.slideDown(animationTime);
                            toolbox_slick_prev.slideDown(animationTime);
                            toolbox_slick_next.slideDown(animationTime);
                            tootboxSliderHelper.slideDown(animationTime);
                            mainContainerInner.animate({scrollTop: 0}, "fast");
                        }
                        else{
                            cbosToolBox.removeClass('open');
                            cbosToolBox.addClass('closed');
                            cbosToolBox.slideUp(animationTime);
                            toolbox_slick_prev.slideUp(animationTime);
                            toolbox_slick_next.slideUp(animationTime);
                            tootboxSliderHelper.slideUp(animationTime);
                        }
                    }

                });
            }
        };
    }]);

 });


