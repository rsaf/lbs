
/**
 *
 * Created by lbs005 on 8/17/15.
 * lbs
 * lbs.cbos
 *
 * lbs.cbos.user                                                                        << loaded on user login >>
 *
 * lbs.cbos.user.topnavigation                                                          << loaded on user login >>
 * lbs.cbos.user.desktop                                                                << loaded on user login >>
 *
 * lbs.cbos.user.desktop.canvases.dcanvas
 * lbs.cbos.user.desktop.canvases.dcanvas.tables
 * lbs.cbos.user.desktop.canvases.dcanvas.tables.companynews
 * lbs.cbos.user.desktop.canvases.dcanvas.tables.companytwits
 * lbs.cbos.user.desktop.canvases.dcanvas.tables.mydocuments
 * lbs.cbos.user.desktop.canvases.dcanvas.tables.mytasks
 * lbs.cbos.user.desktop.canvases.dcanvas.tables.appsfreq
 * lbs.cbos.user.desktop.canvases.dcanvas.forms
 * lbs.cbos.user.desktop.canvases.dcanvas.workflows
 * lbs.cbos.user.desktop.canvases.dcanvas.charts
 * lbs.cbos.user.desktop.layouts.dlayout
 * lbs.cbos.user.desktop.layouts.dlayout.components
 * lbs.cbos.user.desktop.layouts.dlayout.components.component1
 * lbs.cbos.user.desktop.layouts.dlayout.components.component2
 *
 * lbs.cbos.user.desktop.apps                                                           << loaded on user login >>
 *
 * lbs.cbos.user.desktop.apps.app1
 * lbs.cbos.user.desktop.apps.app1.leftnavigation
 * lbs.cbos.user.desktop.apps.app1.canvases
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.tables
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.tables.table1
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.tables.table2
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.forms
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.forms.forms1
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.forms.forms2
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.workflows
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.workflows.workflow1
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.workflows.workflow2
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.charts
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.charts.chart1
 * lbs.cbos.user.desktop.apps.app1.canvases.canvas1.tables.chart2
 * lbs.cbos.user.desktop.apps.app1.layouts
 * lbs.cbos.user.desktop.apps.app1.layouts.layout1
 * lbs.cbos.user.desktop.apps.app1.layouts.layout1.components
 * lbs.cbos.user.desktop.apps.app1.layouts.layout1.components.component1
 * lbs.cbos.user.desktop.apps.app1.layouts.layout1.components.component2
 * lbs.cbos.user.desktop.apps.app1.layouts.layout1.components.component3
 * lbs.cbos.user.desktop.apps.app1.layouts.layout1.components.component4
 *
 *
 */



var lbs = {};
lbs.cbos = {};
lbs.cbos.lib = {};
lbs.cbos.apps = {};
lbs.cbos.navigationtop = {};
lbs.cbos.user = {};
lbs.cbos.configs = {"version": "1.0.0", "license": "private"};
lbs.cbos.workflow = {pl:{
    code : "CBW000001",
    marked : "A",
    edges : {
    },
    nodes : {
        "A" : {
            name : "START",
            code : "CBN000009",
            link: "cbos_components/canvas/workflow/resources/images/flowChartIcons_10.png",
            x : 50,
            y : 200
        }
    }
}};
lbs.cbos.node_defs = {
    "CBN000003": {
        "name" : "email node name",
        "input" : {
            "from" : "pl.subject",
            "to" : "pl.email",
            "body" : "pl.body"
        },
        "view":"cbos_components/canvas/workflow/resources/partials/nodes/email.html"
    },
    "CBN000006": {
        "name" : "Branch Workflow on Condition",
        "input" : { "expression" : "pl.expression"},
        "view":"cbos_components/canvas/workflow/resources/partials/nodes/condition.html"
    },
    "CBN000009": {
        "name" : "Start of workflow",
        "input" : {},
        "view":"cbos_components/canvas/workflow/resources/partials/nodes/start.html"
    },
    "CBN000010": {
        "name" : "End of workflow",
        "input" : {},
        "view":"cbos_components/canvas/workflow/resources/partials/nodes/end.html"
    }
};
lbs.cbos.generateCode =  function (length) {
    var ln = length||10;
    var code = _.reduce(_.sample("abcdefghijklmnopqrstuvwxyz123456789",ln),function(agg,val){return agg+val;},"");
    return "c"+code;
};

define(['base/js/routes.js','base/js/factories.js'], function(routes,factories){
    'use strict';
    //lbs.cbos.init = angular.module('lbs.cbos.init',[]);

    //app init
    lbs.cbos.base = angular.module('lbs.cbos.base',['ngTouch','ngAnimate','ui.bootstrap','mgcrea.ngStrap.modal', 'mgcrea.ngStrap.aside', 'mgcrea.ngStrap.tooltip' ,'duScroll','ui.router','slick','ui.tree','door3.css', 'gettext','rt.debounce','ngSanitize']);




    //factories config
    factories(lbs.cbos.base.factory);

    //routes config
    routes.config(lbs.cbos.base.config);




    lbs.cbos.base.controller('bodyController',['lbs.cbos.spaMessage','lbs.cbos.changeState','$scope','$rootScope','$state', function(spaMessage,changeState,$scope, $rootScope,$state){

       // console.log('SPA: loading body controller');
        //console.log("spaMessage object ", spaMessage);
        //$scope.fadeTransition = true;
        lbs.cbos.message = spaMessage.request;
        lbs.cbos.state = changeState;

        $rootScope.$state = $state;



        lbs.cbos.lib.mobileOrPcDevice($rootScope); //set pc or mobile only styles

       // console.log('lbs.cbos.user----lbs.cbos.user----',lbs.cbos.user);


        if (lbs.cbos.user) {

            //console.log("SPA: this is current url ", $state.current);
            if ($state.current.name==='login'||$state.current.name=='')  { // only do this when on root url or login page
                console.log("SPA: trying redirecting ..}}}} ");
                $rootScope.slideTransition = true; //todo: overwrite the transition on the body controller, later on we will need to set the trasitions for left navigation items;
                $state.go('desktop');
            }
        }

    }]);
    lbs.cbos.base.controller('loginCtrl', ['$scope','$state','lbs.cbos.spaLogin','lbs.cbos.spaMessage', 'lbs.cbos.api','$rootScope', function($scope,$state,spaLoginFactory,spaMessage, apiMessage,$rootScope ) {
        console.log("SPA: loading login controller ...");

        //@Todo remove this references.. this is not the right place to set them.. and there are not useful ...
        lbs.cbos.wms = spaMessage;
        lbs.cbos.api = apiMessage;

        $scope.submit = function() {
            var m = {"pl":$scope.user};
            console.log(m);
            spaLoginFactory.request(m).then(function success(r){
               // console.log('response data-----',r);
                if ( r.pl && r.pl.user && r.pl.user.loginstatus){
                    lbs.cbos.user = r.pl.user;
                     console.log("SPA: apps ...  ", lbs.cbos.user.desktop.apps);
                    $rootScope.slideTransition = true; //todo: overwrite the transition on the body controller, later on we will need to set the trasitions for left navigation items;
                    $state.go('desktop');
                }
                else{
               //     console.log('login fail!---');
                    //@todo handle login failure here
                }
            }).then(null, function failure(r){
             //cbos-toolbox-slider   console.log('login failed ', r);
            });
        };
    }]);




    //global references config
    lbs.cbos.base.config(['$controllerProvider', '$compileProvider',function($controllerProvider, $compileProvider){
        lbs.cbos.controllers = $controllerProvider.register;
        lbs.cbos.directives = $compileProvider.directive;
        //  lbs.cbos.filters = $filterProvider.register;
        //  lbs.cbos.factories = $provide.factory;
        // lbs.cbos.services = $provide.service;

    }]);

    lbs.cbos.base.config(function($provide) {
        //angular ui configs
        $provide.decorator('$state', function($delegate, $stateParams) {
            $delegate.forceReload = function() {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });
    });
    lbs.cbos.base.config(function($asideProvider) {
        //angularstrap aside's configuration
        angular.extend($asideProvider.defaults, {
            animation: 'am-slideLeft',
            placement: 'left'
        });
    });
    lbs.cbos.base.config(function($modalProvider) {
        //angularstrap modal's configuration
        angular.extend($modalProvider.defaults, {
            animation: 'am-flip-x',
            backdrop:'static'
        });
    });
    lbs.cbos.base.run(function($rootScope,$state,$stateParams,$templateCache, gettextCatalog,$window){



        var w = angular.element($window);


        $rootScope.$on('$stateChangeStart', function(event, toState, toParams,fromState,fromParams) {
            if (toState.redirectTo) {   //redirect
                event.preventDefault();
                toState.redirectParams = toState.redirectParams||{};
               var params =  _.assign(toState.redirectParams,toParams); //extend toState.redirectParams with toParams : assign will prioritize the first object
                $state.go(toState.redirectTo, params);
            }
        });
        $rootScope.$on( '$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) { //todo: this should be removed on production

            console.log( 'Resolve Error:!!!!!!!!!!!! ', error);

            if(error) {throw error;}


        });
        //gettextCatalog.setCurrentLanguage('zh_CN');
        //console.log("LANGUAGE TRANSLATION SERVICES %s", gettextCatalog);
        //console.log('SPA: the run function');
        $(".ellipsis").dotdotdot({
            // configuration goes here
        });
        w.bind('resize', function () {


            $(".ellipsis").dotdotdot({ // re-run ellipis
                // configuration goes here

            });
        });



        $('.carousel').carousel({
            interval: false
        });
    });
    return lbs.cbos;
});


lbs.cbos.design_layouts_by_code = {
    'ly001':{view:'cbos_layouts/templates/design-time/grids/2y.html', type:'2y'},
    'ly002':{view:'cbos_layouts/templates/design-time/grids/2y-y2x1-y2x2.html', type:'2y-y2x1-y2x2'},
    'ly003':{view:'cbos_layouts/templates/design-time/grids/2y-y2x1-y2x2-y2x3.html', type:'2y-y2x1-y2x2-y2x3'},
    'ly004':{view:'cbos_layouts/templates/design-time/grids/2y-sidebar.html', type:'2y-sidebar'},
    'ly005':{view:'cbos_layouts/templates/design-time/grids/1y.html', type:'1y'}
};




lbs.cbos.lib.mobileOrPcDevice = function ($rootScope) {


    var width = window.innerWidth;
    if(width<768){
        $rootScope.cbosMobileMode = true;
    }
    else{
        $rootScope.cbosMobileMode = false;
    }
};