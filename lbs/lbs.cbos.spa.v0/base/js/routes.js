/**
 * Created by leo on 6/3/15.
 */



define([], function() {

    var routes = {};


    routes.config =  function (appConfig) {
        appConfig(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider){
            $stateProvider
                .state('login', {
                    url: "/login",
                    templateUrl: "cbos_layouts/login/views/login.html"
                })
                .state('desktop', {
                    url: "/desktop",
                    templateUrl: "cbos_layouts/desktop/main.view.html",
                    controller:['$scope','$state','$stateParams','getDesktopScripts','get_Desktop_left_navigation',function($scope,$state,$stateParams,getDesktopScripts,get_Desktop_left_navigation){
                        $scope.app_left_navigation = {};
                    }],
                    data: {
                        withLeftNav:false
                    }
                    ,resolve:{
                        getDesktopScripts:['lbs.cbos.lazyLoader',function(lazyLoader){

                         return lazyLoader.loadDependencies([
                                    'cbos_layouts/desktop/desktop.js',
                                    'cbos_components/header/header.js',
                                    'cbos_components/footer/footer.js',
                                    'cbos_components/navigation_top/controller.js',
                                    'cbos_components/news/controller.js',
                                    'cbos_components/twits/controller.js',
                                    'cbos_components/frequent_apps/controller.js',
                                    'cbos_components/mydocuments/controller.js',
                                    'cbos_components/mytasks/controller.js',
                                    'cbos_components/clock/controller.js',
                                    'cbos_components/navigation_left/controller.js',
                                    'cbos_components/canvas/table/runtime/controller.js',
                                    'cbos_components/canvas/chart/runtime/controller.js',
                                    'base/js/controller.js',
                                    'base/js/commons.js'
                                ]);
                        }],

                        get_Desktop_left_navigation:['$stateParams',function($stateParams){

                            var parent_eid = lbs.cbos.user.desktop.eid;

                            return  lbs.cbos.message({
                                "op": "ams_read_entity",
                                "sqm": {"parent": parent_eid},
                                "pl": {"navigationleft": {}}
                            }).then(function success(r) {
                                lbs.cbos.user.desktop.leftnav = r.pl.navigationleft;
                                lbs.cbos.user.desktop.leftnav.layoutsnav = _.indexBy(r.pl.navigationleft.layouts, 'ln');
                            });


                          }]


                    }
                })
                .state('desktop.app', {
                    url: "/apps/:appName",
                    redirectTo:'desktop.app.layout',
                    redirectParams:{layoutName:'home'},
                    resolve: {
                        get_left_navigation: function ($http,$stateParams) {

                            console.log('lbs.cbos.user.desktop.apps------',lbs.cbos.user.desktop.apps);
                            if(lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav&&lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav.layoutsnav){
                                    return;
                            }else{
                                var parent_eid = lbs.cbos.user.desktop.apps[$stateParams.appName].eid;
                                return  lbs.cbos.message({
                                    "op": "ams_read_entity",
                                    "sqm": {"parent": parent_eid},
                                    "pl": {"navigationleft": {}}
                                }).then(function success(r) {
                                    //console.log("navigation items ", r.pl.navigationleft.layouts);
                                    //$scope.navigationleft = r.pl.navigationleft.layouts;
                                    console.log("navigation left scope ",r );
                                    lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav = r.pl.navigationleft;
                                    lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav.layoutsnav = _.indexBy(r.pl.navigationleft.layouts, 'ln');
                                }).then(null, function failure(er){
                                    //@Todo handle errors properly
                                });
                            }

                        }
                    },
                    data: {
                        withLeftNav:true
                    },
                    views: {
                        'mainView': {
                            templateUrl: function ($stateParams) {
                                return lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav.dltu
                            }
                        },
                        'mainLeftNav':{
                            templateUrl:'cbos_layouts/templates/run-time/leftNav/leftNav.html'
                        }
                    }
                })
                .state('desktop.createApp', {
                    url: "/createApp",
                    redirectTo:'desktop.createApp.selectView',
                    redirectParams:{gridId:'ly001'},
                    onEnter: [ '$state', '$modal','$rootScope', function($state, $modal,$rootScope) {
                        var createApppModalRef =   $modal({
                            templateUrl: "cbos_layouts/desktop/partials/createApp.html",
                            resolve: {
                                item: function() { return  {appAddess: '', appTitle: 'app', layout: '', ltu: ''}; }
                            },
                            controller: ['$scope', 'item', function($scope, item) {


                                console.log('create app  nav ----',$state);
                                $scope.newApp = item;
                                $scope.dismiss = function(){ $state.go('desktop'); createApppModalRef.hide();};
                                $scope.submitAppCreation = function(){desktop_submitAppCreation($rootScope,$scope,$state,createApppModalRef);}
                            }],
                            show: false
                        });
                        createApppModalRef.$promise.then(createApppModalRef.show);
                    }]
                })
                .state('desktop.createApp.selectView', {
                    url: "/:gridId",
                    views: {
                        'designLeftnav@': {
                            templateUrl: 'cbos_layouts/templates/design-time/leftNav/leftNav.html'
                        },
                        'designGridView@': {
                            templateUrl:function($stateParam){ return  lbs.cbos.design_layouts_by_code[$stateParam.gridId].view;}
                        }
                    }
                })
                .state('desktop.app.layout', {
                    url: "/:layoutName",
                    resolve:{
                        getLayoutController: ["$q", function($q) {
                            var deferred = $q.defer();
                            require(["cbos_layouts/controller.js"], function() {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }]
                    },
                    views: {
                        'mainView@desktop': {
                            templateUrl: function ($stateParams) {
                                console.log("SPA Generating sub grid view");
                                return lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav.layoutsnav[$stateParams.layoutName.toUpperCase()].ltu;
                            },
                            controller: ['$scope', '$state','$stateParams','$templateCache', function($scope, $state, $stateParams,$templateCache) {
                                console.log("SPA RELOADING STARTING ...." );

                                if (lbs.cbos.from_create_layout || lbs.cbos.from_add_component){

                                    //$scope.tablesInfo = {}; //will be updated by the runtime table directive controller;

                                    lbs.cbos.from_create_layout = false;
                                    lbs.cbos.from_add_component = false;
                                    //$rootScope.slideTransition = false;
                                    $state.transitionTo($state.current, $stateParams, {
                                        reload: true, inherit: true, notify: true
                                    });

                                };

                            }]
                        }
                    }
                })
                .state('desktop.app.layout.uploadComponent', {
                    url: "/upload/:componentType/:componentId",

                    onEnter: [ '$state', '$modal','$rootScope', function($state, $modal,$rootScope) {
                        var modalRef =   $modal({
                            templateUrl: "cbos_layouts/partials/upload-component.html",
                            resolve: {


                                uploadCanvases:function(){

                                    var message = {
                                        "sqm": {"parent": lbs.cbos.user.desktop.apps[$state.params.appName]._id},
                                        "op": "ams_read_entities",
                                        "pl": {"canvass":{}}
                                    };

                                    console.log('uploadCanvases----',message);

                                    return lbs.cbos.message(message).then(function(response){
                                        //console.log('got uploadCanvases->>>>>>>----',response);
                                        return response.pl.canvass;
                                    });

                                }
                            },
                            controller: ['$scope','$templateCache','$stateParams', 'uploadCanvases', function($scope,$templateCache,$stateParams, uploadCanvases) {

                                $scope.newComponent = {title: '', table: {},view:{},form:{}, lig: ''};
                                $scope.canvases = uploadCanvases;
                                $scope.tables = [];
                                $scope.views = [];
                                $scope.forms = [];



                                $scope.canvasSelected = function(canvas){
                                    console.log('canvas-----selected -----',canvas);


                                    var message = {
                                        "sqm": {"parent":canvas.eid},
                                        "op": "ams_read_entities",
                                        "pl": {"tables":{}}
                                    };

                                    return lbs.cbos.message(message).then(function(tables){
                                        console.log('got tables->>>>>>>----',tables);
                                        $scope.tables = tables.pl.tables;
                                    });
                                };

                                $scope.tableSelected = function(table){
                                    console.log('table-----selected -----',table);
                                    $scope.views = table?table.views:[];
                                    $scope.forms = table?table.forms:[];
                                    $scope.newComponent.table = table;
                                };

                                $scope.viewSelected = function(view){
                                    console.log('view-----selected -----',view);
                                    $scope.newComponent.view = view;
                                };

                                $scope.formSelected = function(form){
                                    console.log('form-----selected -----',form);
                                    $scope.newComponent.form = form;
                                };

                                $scope.dismiss = function(){ $state.go('desktop.app.layout',{appName:$state.params.appName,layoutName:$state.params.layoutName}); modalRef.hide();};
                                $scope.submitModalForm = function(){     console.log('newComponent------',$scope.newComponent);
                                    //var targeLayout = lbs.cbos.user.navigationtop.appsnav[$state.params.appName.toUpperCase()].dlayout;

                                    var targeLayout =  lbs.cbos.user.desktop.apps[$state.params.appName].leftnav.layoutsnav[$state.params.layoutName.toUpperCase()];
                                    var  recordFormId =  $scope.newComponent.form.fid;
                                    var recordTableId = $scope.newComponent.table.ufid;


                                    var message = {
                                        "op": "ams_add_cbos_component",
                                       //"sqm" : {"recordTableId":recordTableId, "recordFormId": recordFormId},
                                        "pl": {
                                            "layout": {
                                                "eid": targeLayout.lid,
                                                "lcp": null
                                            }
                                        }
                                    };

                                    //"cpd" : '<cbos-table-runtime tid="'+$scope.newComponent.table.eid+'"  rtid="'+ recordTableId + '"  rfid="'+recordFormId+'"  vtu="'+$scope.newComponent.view.vtu+'"  ftu="'+$scope.newComponent.form.ftu+'" title="'+$scope.newComponent.title+'"></cbos-table-runtime>'

                                    if($state.params.componentType === 'table'){

                                        message.pl.layout.lcp = {
                                            "lig": $state.params.componentId,
                                            "tid": $scope.newComponent.table.eid,
                                            "rtid": recordTableId,
                                            "rfid": recordFormId,
                                            "vtu": $scope.newComponent.view.vtu,
                                            "mvtu": $scope.newComponent.view.mvtu,
                                            "ftu": $scope.newComponent.form.ftu,
                                            "mftu": $scope.newComponent.form.mftu,
                                            "title": $scope.newComponent.title
                                         };
                                    }
                                    else  {
                                        message.pl.layout.lcp = {};//to be set for chart
                                    }
                                    console.log('upload component message-----',message);

                                    //remove template from cache
                                    //todo: clear browerser cache and clear angular cache($templateCache) not fixing the issue!
                                    var cachedtemplate = lbs.cbos.user.desktop.apps[$stateParams.appName].leftnav.layoutsnav[$stateParams.layoutName.toUpperCase()].ltu;
                                    console.log('----------get template 1--------',$templateCache.get(cachedtemplate));
                                    $templateCache.remove(cachedtemplate);
                                    console.log('----------get template 2--------',$templateCache.get(cachedtemplate));
                                    lbs.cbos.message(message).then(function(response){
                                        console.log('component uploaded successfully-------',response);
                                        $scope.dismiss();
                                        //  $state.go('desktop.app.layout',{appName:$state.params.appName,layoutName:$state.params.layoutName},{reload:true}); modalRef.hide();
                                    });

                                }
                            }],
                            show: false
                        });
                        modalRef.$promise.then(modalRef.show);
                    }]
                })
                .state('desktop.app.layout.addTableRecord', {
                    url: "/tables/:recordTableId/forms/:recordFormId",
                    onEnter: [ '$state', '$modal','$rootScope','$stateParams', function($state, $modal,$rootScope,$stateParams) {
                        var modalRef =   $modal({
                            templateUrl: lbs.cbos.layoutTablesInfo[$stateParams.recordTableId].ftu,
                            resolve: {
                            },
                            controller: ['$scope', function($scope) {

                                var selector = angular.element(getAllElementsByTagNameAttributeValue('cbos-table-runtime','rfid',$stateParams.recordFormId));
                                var scope = selector.isolateScope();


                                console.log('scope--------',scope,selector);

                                $scope.newRecord = {};

                                $scope.autoSaveFormData = function(value){
                                    console.log('autoSaveFormData--------',value);


                                    _.mapKeys(value, function(value, key) {
                                        $scope.newRecord[key] = value;
                                    });

                                    console.log('$scope.newRecord----',$scope.newRecord);
                                };
                                $scope.dismiss = function(){ $state.go('desktop.app.layout',{appName:$state.params.appName,layoutName:$state.params.layoutName}); modalRef.hide();};
                                $scope.submitModalForm = function(){
                                    console.log('newRecord------',$scope.newRecord);
                                    //var targeLayout = lbs.cbos.user.navigationtop.appsnav[$state.params.appName.toUpperCase()].dlayout;



                                    var message = {
                                        "op": "ams_create_entity",
                                        "pl": {
                                            "row": {
                                                parent:  lbs.cbos.layoutTablesInfo[$stateParams.recordTableId].eid,
                                                rdt: $scope.newRecord, //row data,
                                                ufid: lbs.cbos.generateCode()
                                            }
                                        }
                                    };

                                    console.log('add record message-----',message);

                                    lbs.cbos.message(message).then(function(response){
                                        console.log('record added successfully-------',response);

                                        if(scope&&response.pl){
                                            var newRowsData = scope.rows||[];
                                            newRowsData.unshift(response.pl.row);
                                            newRowsData = newRowsData.slice(0,13);
                                            scope.rows = newRowsData;
                                        }
                                        $scope.dismiss();
                                    });

                                };
                            }],
                            show: false
                        });
                        modalRef.$promise.then(modalRef.show);
                    }]
                })
                .state('desktop.app.layout.addTableRecordMobile', {
                    url: "/mtables/:mrecordTableId/mforms/:mrecordFormId",
                    resolve:{
                    },
                    views: {
                        'mainView@desktop': {
                            templateUrl: function ($stateParams) {
                                   return lbs.cbos.layoutTablesInfo[$stateParams.mrecordTableId].mftu;
                                  },
                            controller: ['$scope', '$state','$stateParams', function($scope, $state, $stateParams) {


                                $scope.newRecord = {};

                                $scope.autoSaveFormData = function(value){
                                    console.log('autoSaveFormData--------',value);


                                    _.mapKeys(value, function(value, key) {
                                        $scope.newRecord[key] = value;
                                    });

                                    console.log('$scope.newRecord----',$scope.newRecord);
                                };
                                $scope.dismiss = function(){ $state.go('desktop.app.layout',{appName:$state.params.appName,layoutName:$state.params.layoutName});};
                                $scope.submitForm = function(){
                                    console.log('newRecord------',$scope.newRecord);
                                    //var targeLayout = lbs.cbos.user.navigationtop.appsnav[$state.params.appName.toUpperCase()].dlayout;



                                    var message = {
                                        "op": "ams_create_entity",
                                        "pl": {
                                            "row": {
                                                parent:  lbs.cbos.layoutTablesInfo[$stateParams.mrecordTableId].eid,
                                                rdt: $scope.newRecord, //row data,
                                                ufid: lbs.cbos.generateCode()
                                            }
                                        }
                                    };

                                    console.log('add record message-----',message);

                                    lbs.cbos.message(message).then(function(response){
                                        console.log('record added successfully-------',response);
                                        $scope.dismiss();
                                    });

                                };

                            }]
                        }
                    }
                })
                .state('desktop.app.createLayout', {
                    url: "/layout/create",
                    redirectTo:'desktop.app.createLayout.selectView',
                    redirectParams:{gridId:'ly001'},
                    onEnter: [ '$state', '$modal','$rootScope', function($state, $modal,$rootScope) {
                        var createLayoutModalRef =   $modal({
                            templateUrl: "cbos_layouts/partials/createLayout.html",
                            resolve: {
                                item: function() { return      {appTitle: $state.params.appName, layoutAddess: '', name: 'layout',layout:'',ltu: ''}; }
                            },
                            controller: ['$scope', 'item', function($scope, item) {
                                $scope.newLayout = item;
                                $scope.dismiss = function(){ $state.go('desktop.app',{appName:$state.params.appName}); createLayoutModalRef.hide();};
                                $scope.submitLayoutCreation = function(){app_submitLayoutCreation($rootScope,$scope,$state,createLayoutModalRef);}
                            }],
                            show: false
                        });
                        createLayoutModalRef.$promise.then(createLayoutModalRef.show);
                    }]
                })
                .state('desktop.app.createLayout.selectView', {
                    url: "/:gridId",
                    views: {
                        'designLeftnav@': {
                            templateUrl: 'cbos_layouts/templates/design-time/leftNav/leftNav.html'
                        },
                        'designGridView@': {
                            templateUrl:function($stateParam){ return  lbs.cbos.design_layouts_by_code[$stateParam.gridId].view;}
                        }
                    }
                })
                .state('desktop.app.canvas', {
                    url: "/canvases/:canvasName",
                    redirectTo:'desktop.app.canvas.general',
                    data: {
                        withLeftNav:false
                    },
                    resolve: {
                        getCanvases:['$state','$stateParams',function($state,$stateParams){


                            var message = {
                                "sqm": {"parent": lbs.cbos.user.desktop.apps[$stateParams.appName].eid},
                                "op": "ams_read_entities",
                                "pl": {"canvass":{}}
                            };

                            console.log('getCanvases----',message);

                            return lbs.cbos.message(message).then(function(response){
                                console.log('canvases->>>>>>>----',response);
                                lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav = _.indexBy(response.pl.canvass,'ufid');
                                lbs.cbos.user.desktop.apps[$stateParams.appName].canvases=response.pl.canvass;
                                return response;
                            });

                        }],
                        getScriptFiles: ["$q", function($q) {
                            var deferred = $q.defer();
                            require(["cbos_components/canvas/canvas.js"], function() {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }]
                    },
                    views:{
                        'mainViewWithoutLeftNav@desktop':{
                            templateUrl:"cbos_components/canvas/canvas.html",
                            controller:'canvasController'
                        }
                    }
                })
                .state('desktop.app.canvas.general', {
                    url: "/general",
                    resolve: {
                        getCanvas:['$state','$stateParams',function($state,$stateParams){

                            var message = {
                                "op": "ams_get_canvas_components",
                                "pl": {"canvas":{
                                    "ufid": $stateParams.canvasName
                                }}
                            };

                            console.log('getCanvas components----', message);

                            return lbs.cbos.message(message).then(function(response){
                                console.log('canvas components ->>>>>>>----',response);
                                lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav[$stateParams.canvasName].canvas_node =response.pl.canvas_node;
                                return response;
                            });

                        }]
                    },
                    views: {
                        'configTemplate': {
                            templateUrl: "cbos_components/canvas/generalConfig.html",
                            controller:function($scope, $stateParams ){
                                $scope.$watch('canvasTitle',function(newval,oldval){
                                    console.log('updating CANVAS NAME -----',newval);
                                    if(newval != oldval){
                                        var message = {
                                            "op": "ams_update_entity",
                                            "pl": {
                                                "canvas": {
                                                    "eid": $scope.canvas.eid,
                                                    "name": newval
                                                }
                                            }
                                        };

                                        console.log('updating table message-----',message);

                                        lbs.cbos.message(message).then(function(response){
                                            console.log('table name updated  ------',response);
                                        });

                                    }

                                });
                                //$scope.data = lbs.cbos.canvasGeneralCollpase; //for ui-tree data;
                                $scope.components_nodes = lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav[$stateParams.canvasName].canvas_node.nodes;
                            }
                        },
                        'previewTemplate': {
                            templateUrl: "cbos_components/canvas/workflow/workFLowPreview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.workflows', {
                    url: "/workflows",
                    redirectTo:'desktop.app.canvas.workflows.workflow',
                    redirectParams:{workflowId:''},
                    views: {
                        'configTemplate': {
                            templateUrl: "cbos_components/canvas/workflow/workFLowConfig.html",
                            controller: 'workflowController'
                        },
                        'previewTemplate': {
                            templateUrl: "cbos_components/canvas/workflow/workFLowPreview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.workflows.workflow', {
                    url: "/:workflowId",
                    controller: 'currentWorkflowController',
                    resolve: {
                        workflow: function ($stateParams, $state) {                                     //todo the response of the resolved should be passed as dependency to the controlle function.
                            return lbs.cbos.message({pl: {code: $stateParams.workflowId}, op: 'wms_open_template'})
                                .then(function (response) {
                                    console.log("WORKFLOW RESPONSE IS", response);

                                    if (!response.pl && !response.er && response.code) {

                                        $state.go('desktop.app.canvas.workflows.workflow', {workflowId: response.code});
                                        return;
                                    }

                                    lbs.cbos.workflow = response;
                                    lbs.cbos.workflow.pl = response.pl || {};
                                    return response;
                                });
                        }
                    },
                    views: {
                        'elementConfigTemplate': {
                            templateUrl: function ($stateParams) {
                                return 'cbos_components/canvas/workflow/singleWorkflow.html';
                            }
                        }
                    }
                })
                .state('desktop.app.canvas.workflows.workflow.node', {
                    url: "/nodes/:nodeId",
                    template: '',
                    views: {
                        'currentNode': {
                            templateUrl: function ($stateParams) {
                                var nodeId = $stateParams.nodeId;
                                var nodeCode = lbs.cbos.workflow.pl.nodes[nodeId].code;
                                return lbs.cbos.node_defs[nodeCode].view;
                            },
                            controller: 'workflowNodeController'
                        }
                    }
                })
                .state('desktop.app.canvas.tables', {
                    url: "/tables",
                    resolve:{

                        getUserTables:function($stateParams,getCanvases){
                            var message = {
                                "sqm": {"parent": lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav[$stateParams.canvasName].eid},
                                "op": "ams_read_entities",
                                "pl": {"tables":{}}
                            };

                            return lbs.cbos.message(message).then(function(r){
                                console.log('get tables response->>>>>>>----',r);
                                return r;
                            });
                        }

                    },
                    views: {
                        'configTemplate': {
                            templateUrl: "cbos_components/canvas/table/tableConfig.html",
                            controller:['$rootScope','$scope','$state','getUserTables',function($rootScope,$scope,$state,getUserTables){

                                if(getUserTables&&getUserTables.pl&&getUserTables.pl.tables&&getUserTables.pl.tables.length){

                                    $scope.tcontainer.tables = getUserTables.pl.tables;
                                    $scope.tcontainer.tables.forEach(function(table){
                                        table.fieldnav = _.indexBy(table.fields,'fid');
                                        table.viewnav = _.indexBy(table.views,'vid');
                                    });
                                    $scope.tcontainer.tablesnav = _.indexBy($scope.tcontainer.tables,'ufid');

                                    lbs.cbos.user.desktop.apps[$state.params.appName].canvasesnav[$state.params.canvasName].tables = $scope.tcontainer.tables;
                                    lbs.cbos.user.desktop.apps[$state.params.appName].canvasesnav[$state.params.canvasName].tablesnav = $scope.tcontainer.tablesnav;

                                    if($state.params.tableId){

                                        if($state.params.viewId){

                                            if($state.params.fieldId){
                                                $state.go('desktop.app.canvas.tables.table.view.field',{tableId:$scope.tcontainer.tablesnav[$state.params.tableId].ufid,viewId:$scope.tcontainer.tablesnav[$state.params.tableId].viewnav[$state.params.viewId].vid,fieldId:$scope.tcontainer.tablesnav[$state.params.tableId].fieldnav[$state.params.fieldId].fid});
                                            }
                                            else{
                                                $state.go('desktop.app.canvas.tables.table.view',{tableId:$scope.tcontainer.tablesnav[$state.params.tableId].ufid,viewId:$scope.tcontainer.tablesnav[$state.params.tableId].viewnav[$state.params.viewId].vid});
                                            }
                                        }
                                        else{
                                            $state.go('desktop.app.canvas.tables.table',{tableId:$scope.tcontainer.tablesnav[$state.params.tableId].ufid});
                                        }
                                    }
                                    else{
                                        console.log('not  table id available----------');
                                        // $scope.tables.tableList.cols = tables[tables.length-1].fields;
                                        $state.go('desktop.app.canvas.tables.table.view.field',{tableId: $scope.tcontainer.tables[ $scope.tcontainer.tables.length-1].ufid,viewId: $scope.tcontainer.tables[ $scope.tcontainer.tables.length-1].views[0].vid,fieldId: $scope.tcontainer.tables[ $scope.tcontainer.tables.length-1].views[0].vfields[0].fid});
                                    }

                                }
                                else{

                                    canvas_createTable($state,$scope,$rootScope);
                                };



                            }]
                        },
                        'previewTemplate': {
                            templateUrl: "cbos_components/canvas/table/tablePreview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.tables.table',{
                    url: "/:tableId",
                    views:{
                        "currentTable":{
                            templateUrl:"cbos_components/canvas/table/resources/partials/single-view-preview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.tables.table.view',{
                    url: "/views/:viewId",
                    views:{
                        'eyelistView@desktop.app.canvas.tables':{
                            templateUrl:'cbos_components/canvas/table/resources/partials/eyelist.html'
                        }
                    }
                })
                .state('desktop.app.canvas.tables.table.view.field',{
                    url: "/fields/:fieldId",
                    views:{
                        "columnConfig@desktop.app.canvas.tables": {
                            templateUrl: "cbos_components/canvas/table/resources/partials/new-column.html",
                            controller:['$stateParams','$rootScope','$scope',function($stateParams,$rootScope,$scope){

                                var currentCol = $stateParams.fieldId;
                                $scope.currentCol = currentCol;

                                $scope.$watch('tcontainer.tablesnav[$state.params.tableId].fieldnav[currentCol].fn',function(newval,oldval){
                                    if(newval&&newval != oldval){
                                        $rootScope.$broadcast('updateTableColumnData',{fn:newval,fid:$stateParams.fieldId});
                                    }
                                });


                                $scope.$watch('tcontainer.tablesnav[$state.params.tableId].fieldnav[currentCol].ft',function(newval,oldval){
                                    if(newval&&newval != oldval){
                                        $rootScope.$broadcast('updateTableColumnData',{ft:newval,fid:$stateParams.fieldId});
                                    }
                                });



                            }]
                        }
                    }
                })
                .state('desktop.app.canvas.forms', {
                    url: "/forms",
                    resolve:{

                        forms_getUserTables:function($stateParams,getCanvases){
                            var message = {
                                "sqm": {"parent": lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav[$stateParams.canvasName].eid},
                                "op": "ams_read_entities",
                                "pl": {"tables":{}}
                            };

                            return lbs.cbos.message(message).then(function(r){
                                console.log('get form tables response->>>>>>>----',r);
                                return r;
                            });
                        }

                    },
                    views: {
                        'configTemplate': {
                            templateUrl: "cbos_components/canvas/form/formConfig.html",
                            controller:['$rootScope','$scope','$state','forms_getUserTables',function($rootScope,$scope,$state,forms_getUserTables){

                                if(forms_getUserTables&&forms_getUserTables.pl&&forms_getUserTables.pl.tables&&forms_getUserTables.pl.tables.length){

                                    $scope.tcontainer.tables = forms_getUserTables.pl.tables;
                                    $scope.tcontainer.tables.forEach(function(table){    //todo the nested loop should be replaced with a more efficient way.
                                        table.fieldsnav = _.indexBy(table.fields,'fid');
                                        table.forms.forEach(function(form){

                                            form.ffields.forEach(function(field){

                                                field.fd = field.fd||lbs.cbos.canvas_tablesformTypeMap[table.fieldsnav[field.fid].ft][0].dir;
                                                field.label = field.label||table.fieldsnav[field.fid].fn;
                                                field.ft = field.ft||lbs.cbos.canvas_tablesformTypeMap[table.fieldsnav[field.fid].ft][0].type;
                                            });
                                            form.fieldsnav = _.indexBy(form.ffields,'fid');
                                        });
                                        table.formsnav = _.indexBy(table.forms,'fid');
                                    });
                                    $scope.tcontainer.tablesnav = _.indexBy($scope.tcontainer.tables,'ufid');

                                    console.log('------$scope.tcontainer.tablesnav>>>>>>>>>}}}------',$scope.tcontainer.tablesnav);

                                    //lbs.cbos.user.navigationtop.appsnav[$state.params.appName.toUpperCase()].canvasesnav[$state.params.canvasName].tables = $scope.tcontainer.tables;
                                    //lbs.cbos.user.navigationtop.appsnav[$state.params.appName.toUpperCase()].canvasesnav[$state.params.canvasName].tablesnav = $scope.tcontainer.tablesnav;


                                    if($state.params.formTableId){

                                        if($state.params.formId){

                                            if($state.params.formFieldId){
                                                $state.go('desktop.app.canvas.forms.table.form.field',{formTableId:$scope.tcontainer.tablesnav[$state.params.formTableId].ufid,formId:$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fid,formFieldId:$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[$state.params.formFieldId].fid});
                                            }
                                            else{
                                                $state.go('desktop.app.canvas.forms.table.form',{formTableId:$scope.tcontainer.tablesnav[$state.params.formTableId].ufid,formId:$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fid});
                                            }
                                        }
                                        else{
                                            $state.go('desktop.app.canvas.forms.table',{formTableId:$scope.tcontainer.tablesnav[$state.params.formTableId].ufid});
                                        }
                                    }
                                    else{
                                        // console.log('<<<<<<<>>>>>>>form table id available----------');
                                        // $scope.tables.tableList.cols = tables[tables.length-1].fields;
                                        $state.go('desktop.app.canvas.forms.table.form.field',{formTableId: $scope.tcontainer.tables[ $scope.tcontainer.tables.length-1].ufid,formId: $scope.tcontainer.tables[ $scope.tcontainer.tables.length-1].forms[0].fid,formFieldId: $scope.tcontainer.tables[ $scope.tcontainer.tables.length-1].forms[0].ffields[0].fid});
                                    }

                                }


                            }]
                        },
                        'previewTemplate': {
                            templateUrl: "cbos_components/canvas/form/formPreview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.forms.table',{
                    url: "/:formTableId",
                    views:{
                        "currentTable":{
                            templateUrl:"cbos_components/canvas/table/resources/partials/single-view-preview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.forms.table.form',{
                    url: "/form/:formId",
                    views:{
                        'eyelistView@desktop.app.canvas.forms':{
                            templateUrl:'cbos_components/canvas/table/resources/partials/eyelist.html'
                        }
                    }
                })
                .state('desktop.app.canvas.forms.table.form.field',{
                    url: "/fields/:formFieldId",
                    views:{
                        "columnConfig@desktop.app.canvas.forms": {
                            templateUrl: "cbos_components/canvas/form/resources/partials/new-formField.html",
                            controller:['$stateParams','$state','$rootScope','$scope','debounce',function($stateParams,$state,$rootScope,$scope,debounce){




                                var selectedFormField = _.findWhere($scope.tcontainer.tablesformTypeMap[$scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[$state.params.formFieldId].ft],{'type':$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[$state.params.formFieldId].ft});
                                console.log('selectedFormField-----',$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[$state.params.formFieldId].ft,selectedFormField);

                                $scope.tcontainer.tablesnav[$state.params.formTableId].selectedFromType = selectedFormField||$scope.tcontainer.tablesformTypeMap[$scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[$state.params.formFieldId].ft][0];


                                $scope.$watch('tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[$state.params.formFieldId].label',function(newval,oldval){
                                    if(newval&&newval != oldval){
                                        //console.log('label changed-----',newval);
                                        $rootScope.$broadcast('updateTableFormData',{label:newval,fid:$stateParams.formFieldId});
                                    }
                                });


                                $scope.tcontainer.saveSelectedFormFieldType = function(newVal){
                                    if(newVal){
                                        // console.log('form type changed-----',newVal);
                                        $rootScope.$broadcast('updateTableFormData',{ft:newVal,fid:$stateParams.formFieldId});
                                    }

                                };



                            }]
                        }
                    }
                })
                .state('desktop.app.canvas.chartSets',{
                    url: "/chartsets/:chartsetID",
                    views: {
                        'configTemplate': {
                            templateUrl: "cbos_components/canvas/chart/chartConfig.html"
                        },
                        'previewTemplate': {
                            templateUrl: "cbos_components/canvas/chart/chartPreview.html"
                        }
                    }
                })
                .state('desktop.app.canvas.chartSet.chart',{
                    url: "/charts/chartId"
                })
                .state('desktop.app.appsettings', {
                    url: "/settings/appsettings"  ,
                    data: {
                        withLeftNav:false
                    },
                    resolve: {
                        get_appsettings_json:['$state','$stateParams',function($state,$stateParams){
                            var message = {
                                "op": "ams_get_app_components",
                                "pl": {
                                    "app": {
                                        "eid": lbs.cbos.user.desktop.apps[$stateParams.appName].eid,
                                        "name": $stateParams.appName
                                    }
                                }
                            };
                            console.log('get app components ----',message);
                            return lbs.cbos.message(message).then(function(response){
                                //console.log('components->>>>>>>----',response);
                                lbs.cbos.user.desktop.apps[$stateParams.appName].settings={};
                                lbs.cbos.user.desktop.apps[$stateParams.appName].settings.components=response.pl.components;
                                return response.pl.components;
                            });

                        }],
                        get_appsettings_controller: ["$q", function($q) {
                            var deferred = $q.defer();
                            require(["cbos_components/app_settings/controller.js"], function() {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }]
                    },
                    views:{
                        'mainViewWithoutLeftNav@desktop':{
                            templateUrl:"cbos_components/app_settings/view.html",
                            controller:'appsettingsController'
                        }
                    }
                   })
                .state('desktop.desktopsettings', {
                    url: "/desktopsettings"  ,
                    resolve: {
                        get_appsettings_json:['$state','$stateParams',function($state,$stateParams){
                            var message = {
                                "op": "ams_get_app_components",
                                "pl": {
                                    "app": {
                                        "eid": lbs.cbos.user.desktop.eid,
                                        "name": "desktop"
                                    }
                                }
                            };
                            console.log('get app components ----',message);
                            return lbs.cbos.message(message).then(function(response){
                                console.log('components->>>>>>>----',response);
                                lbs.cbos.user.desktop.settings={};
                                lbs.cbos.user.desktop.settings.components=response.pl.components;
                                return response.pl.components;
                            });

                        }],
                        get_appsettings_controller: ["$q", function($q) {
                            var deferred = $q.defer();
                            require(["cbos_components/app_settings/controller.js"], function() {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }]
                    },
                    views:{
                        'mainViewWithoutLeftNav':{
                            templateUrl:"cbos_components/app_settings/view.html",
                            controller:'appsettingsController'
                        }
                    }
                });
            $urlRouterProvider.otherwise("/login");
        }]);
    };
    return routes;

});

