/**
 * Created by leo on 8/9/15.
 */





define(['cbos'], function(cbos) {


    cbos.controllers('canvasController', ['$scope','$state','$stateParams','$rootScope','debounce',function ($scope,$state,$stateParams,$rootScope,debounce) {




        $scope.saveCanvasElementDraft = function(){


            var currentCanvasElement = $state.current.name.split('.')[3]; //tables, forms, chartSets, workflows

            if(currentCanvasElement==='tables'||currentCanvasElement==='forms'){
                console.log('save tables draft');

                var message = {
                    "op": "ams_create_entity_done",
                    "sqm": {"ct": currentCanvasElement},
                    "pl": {
                        "table": {
                            "eid": $scope.tcontainer.tablesnav[$state.params.tableId]?$scope.tcontainer.tablesnav[$state.params.tableId].eid:$scope.tcontainer.tablesnav[$state.params.formTableId].eid
                        }
                    }
                };


                console.log('save tables draft submiting message',message);

                lbs.cbos.message(message).then(function(response){

                    console.log('create table done -----',response);
                });

            }
            else  if(currentCanvasElement==='chartSets'){
                console.log('save chartSets draft');

            }
            else  if(currentCanvasElement==='workflows'){
                console.log('save workflows draft');

                 lbs.cbos.workflow.pl = current_workflow_design;  //todo: the 'current_workflow_design' must have been removed by edwards.
                 lbs.cbos.workflow.op = "wms_publish_workflow_design";
                 lbs.cbos.message(lbs.cbos.workflow);

            }

        };

        $scope.workflow = lbs.cbos.workflow;


        $scope.configTreeData = [
            {
                'id': 1,
                'title': 'Input',
                'nodes': [
                    {
                        'id': 11,
                        'title': 'Product',
                        'nodes': []
                    },
                    {
                        'id': 12,
                        'title': 'Quantity',
                        'nodes': []
                    }
                ]
            }, {
                'id': 2,
                'title': 'Ouput',
                'nodrop': true,
                'nodes': [
                    {
                        'id': 21,
                        'title': 'output',
                        'nodes': []
                    }
                ]
            }
        ];

        $scope.canvasTableFieldTypes = cbos.canvasTableFieldTypes;
        $scope.appName = $stateParams.appName;
      //  $scope.canvasName = $stateParams.canvasName;
        $scope.canvasTitle = lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav[$state.params.canvasName].name;
        $scope.workflowId = $stateParams.workflowId;
        $scope.canvas = lbs.cbos.user.desktop.apps[$stateParams.appName].canvasesnav[$state.params.canvasName];


        $scope.tcontainer = {}; //todo: anything related to create table with be added in this object

        lbs.cbos.canvasTables =  $scope.tcontainer;
        $scope.tcontainer.rows = lbs.cbos.dynamicTable.rows;

        $scope.tcontainer.createNewTable = function(){
            canvas_createTable($state,$scope);
        };

        $scope.tcontainer.createNewTableView = function(){
            canvas_createView($state,$scope);
        };

        $scope.tcontainer.createNewTableForm = function(){
            canvas_createForm($state,$scope);
        };

        $scope.tcontainer.tablesformTypeMap = cbos.canvas_tablesformTypeMap;
        $scope.tcontainer.canvas_tablesformDirsMap =   cbos.canvas_tablesformDirsMap;


            $scope.$watch('tcontainer.tablesnav[$state.params.tableId].viewnav[$state.params.viewId].vn',function(newval,oldval){
                if(newval != oldval&&newval!=null&&newval!=undefined){
                    var message = {
                        "op": "ams_update_entity",
                        "pl": {
                            "table": {
                                "eid": $scope.tcontainer.tablesnav[$state.params.tableId].eid ,
                                "views": $scope.tcontainer.tablesnav[$state.params.tableId].viewnav[$state.params.viewId]
                            }
                        }
                    };
                    lbs.cbos.message(message).then(function(response){
                        console.log('table view upadted  ------',response);
                    });


                }
            });



            $scope.$watch('tcontainer.tablesnav[$state.params.tableId].name',function(newval,oldval){
                if(newval != oldval&&newval!=null&&newval!=undefined){
                    var message = {
                        "op": "ams_update_entity",
                        "pl": {
                            "table": {
                                "eid": $scope.tcontainer.tablesnav[$state.params.tableId].eid ,
                                "name": newval
                            }
                        }
                    };

                    lbs.cbos.message(message).then(function(response){
                        console.log('table name updated  ------',response);
                    });

                }

            });


        $scope.$watch('tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].name',function(newval,oldval){
            if(newval != oldval&&newval!=null&&newval!=undefined){

                var updatedItem =  $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId];

                if(updatedItem){
                    updatedItem =  _.omit(updatedItem,'fieldsnav');
                }
                var message = {
                    "op": "ams_update_entity",
                    "pl": {
                        "table": {
                            "eid": $scope.tcontainer.tablesnav[$state.params.formTableId].eid ,
                            "forms":updatedItem
                        }
                    }
                };

                console.log('updating form name--------------',message);

                lbs.cbos.message(message).then(function(response){
                    console.log('form name updated  ------',response);
                });

            }

        });


        $scope.tcontainer.tableSelectionChanged = function(newvalue){
           //console.log('newvalue-----table-----',newvalue);
            if(newvalue){
                $scope.tcontainer.dropDownSelectedView = newvalue.views[0];
                $state.go('desktop.app.canvas.tables.table.view.field',{tableId:newvalue.ufid,viewId:newvalue.views[0].vid});
            }

        };

        $scope.tcontainer.formTableSelectionChanged = function(newvalue){
            console.log('newvalue---form--table-----',newvalue);
            if(newvalue){
                $scope.tcontainer.dropDownSelectedForm = newvalue.forms[0];
                $state.go('desktop.app.canvas.forms.table.form.field',{formTableId:newvalue.ufid,formId:newvalue.forms[0].fid});
            }

        };

        $scope.tcontainer.tableViewSelectionChanged = function(newvalue){
          //  console.log("newvalue:------view------",newvalue);
            if(newvalue){
                $state.go('desktop.app.canvas.tables.table.view.field',{viewId:newvalue.vid});
            }

        };

        $scope.tcontainer.tableFormSelectionChanged = function(newvalue){
             console.log("newvalue:------form------",newvalue);
            if(newvalue){

                $state.go('desktop.app.canvas.forms.table.form.field',{formId:newvalue.fid});
            }

        };

        $rootScope.$on('cbosAddTableCollumn',function(event,data){
          var  currentCol = data.fid;

            var targetTable = $scope.tcontainer.tablesnav[$state.params.tableId];

            var currentView = $scope.tcontainer.tablesnav[$state.params.tableId].viewnav[$state.params.viewId];
            var defaultForm = _.findWhere($scope.tcontainer.tablesnav[$state.params.tableId].forms,{'fid':targetTable.dfid});  //assuming we only have one form here, which is the default form.
            var defaultView = _.findWhere($scope.tcontainer.tablesnav[$state.params.tableId].views,{'vid':targetTable.dvid});

            if(currentView){
                currentView.vfields.push({fid:currentCol,ufid:currentCol});
            }

            if(defaultForm){
                defaultForm.ffields.push({fid:currentCol,ufid:currentCol});
            }

            var message = {
                "op": "ams_update_entity",
                "pl": {
                    "table": {
                        "eid": targetTable.eid  ,
                        "fields":{fn:' ',fid:currentCol},
                        "views":currentView,
                        "forms":defaultForm
                    }
                }
            };

            console.log('updating table message-----',message);

            lbs.cbos.message(message).then(function(response){
               // console.log('new table column added ------',response);

                if(response&&response.pl&&response.pl.table&&response.pl.table.fields){

                    var createdField = _.findWhere(response.pl.table.fields,{'fid':currentCol});

                    var linkto = "desktop.app.canvas.tables.table.view.field({appName:'"+$state.params.appName+"',canvasName:'"+$state.params.canvasName+"',tableId:'"+$state.params.tableId+"',viewId:'"+$state.params.viewId+"',fieldId:'"+currentCol+"'})";

                    createdField.linkTo = linkto;
                    createdField.selected = true;
                    $scope.tcontainer.tablesnav[$state.params.tableId].fields.push(createdField);
                    $scope.tcontainer.tablesnav[$state.params.tableId].fieldnav[currentCol] = createdField;
                    $state.go('desktop.app.canvas.tables.table.view.field',{appName:$state.params.appName,canvasName:$state.params.canvasName,tableId:$state.params.tableId,viewId:$state.params.viewId,fieldId:currentCol});

                }
            });



        });

        $rootScope.$on('updateTableColumnData',function(event,data){

                  var  currentCol = data.fid;


            console.log('data-----',data,event);

            if(data.fn){
                $scope.tcontainer.tablesnav[$state.params.tableId].fieldnav[currentCol].fn =data.fn;
            }
            else if(data.ft){
                $scope.tcontainer.tablesnav[$state.params.tableId].fieldnav[currentCol].ft = data.ft;
            }

            if(data.fn||data.ft) {

                var message = {
                    "op": "ams_update_entity",
                    "pl": {
                        "table": {
                            "eid":   $scope.tcontainer.tablesnav[$state.params.tableId].eid,
                            "fields": $scope.tcontainer.tablesnav[$state.params.tableId].fieldnav[currentCol]}
                    }
                };

                //views: [
                //    {vid: currentCol, vn: currentCol, vfields:[{fid:currentCol}]}
                //]

                //  console.log('updating table field message-----',message);

                lbs.cbos.message(message).then(function(response){
                    console.log('table field updated ------',response);
                });


            }
        });

        $rootScope.$on('updateTableFormData',function(event,data){

            var  currentCol = data.fid;

            console.log('data-----',data,event);

            if(data.label){
                $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[currentCol].label =data.label;
            }

            else if(data.ft){
                $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[currentCol].ft = data.ft.type;
                $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[currentCol].fd =  data.ft.dir;

               var itemIndex =  _.findIndex( $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields,{'fid':currentCol});

                if(itemIndex)
                {$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields[itemIndex].fd =  $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[currentCol].fd;
                 $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields[itemIndex].ft  = $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav[currentCol].ft;
                    console.log('$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields[itemIndex].fd',$scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields[itemIndex]);
                }
            }

            if(data.label||data.ft) {
                var updatedItem  = $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId];

                if(updatedItem){
                    updatedItem = _.omit(updatedItem,'fieldsnav');
                }

            var message = {
                    "op": "ams_update_entity",
                    "pl": {
                        "table": {
                            "eid":   $scope.tcontainer.tablesnav[$state.params.formTableId].eid,
                            "forms": updatedItem
                        }
                    }
                };

                 console.log('updating table field message-----',message);

                lbs.cbos.message(message).then(function(response){
                    console.log('form field updated ------',response);
                });
            }

        });





    function updateTableFormField(data){ //todo this can now be done in the item list container controller

        var message = {
                "op": "ams_update_entity",
                "pl": {
                    "table": {
                        "eid": $scope.tcontainer.tablesnav[$state.params.tableId].eid ,
                        "views": $scope.tcontainer.tablesnav[$state.params.tableId].viewnav[$state.params.viewId]
                    }
                }
            };

            console.log('updating table form message-----',message);

            lbs.cbos.message(message).then(function(response){
                console.log('table view updated  ------',response);
            });
        };

    }]);


    cbos.controllers('workflowController', ['$scope','$state','$stateParams',function ($scope,$state,$stateParams) {

        $scope.workflowElements =  cbos.workflowElements;

    }]);

    // declare a new module, and inject the $compileProvider
    cbos.directives('cbosCompile', ['$compile','$state', function ($compile,$state) {
            return function(scope, element, attrs) {

                var paramsStr;
                scope.$watch(
                    function(scope) {
                        // watch the 'compile' expression for changes
                        var compileInput = attrs.cbosCompile?attrs.cbosCompile.split(','):[];

                        var htmlStr = compileInput[0];
                        paramsStr = (compileInput[1]);
                        return scope.$eval(htmlStr);
                    },
                    function(value) {
                        // when the 'compile' expression changes
                        // assign it into the current DOM

                        element.html(value);

                        element.contents().attr('label',"{{$parent.tcontainer.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].fieldsnav['"+paramsStr+"'].label}}");


                        // compile the new DOM and link it to the current
                        // scope.
                        // NOTE: we only compile .childNodes so that
                        // we don't get into infinite loop compiling ourselves
                        $compile(element.contents())(scope);
                    }
                );
            };
        }]);

    cbos.controllers('workflowNodeController', ['$scope','$state','$stateParams',function ($scope,$state,$stateParams) {
        $scope.workflowNode = $stateParams.nodeId;  //set workflow node so to find the current node from the cavans controller workflow object.
        $scope.workflowId = $stateParams.workflowId;
    }]);

    cbos.controllers('ItemsContainerController', ['$state','$stateParams','$rootScope',function($state,$stateParams,$rootScope) {

        var self = this;



        var currentCanvasElement = $state.current.name.split('.')[3]; //tables, forms, chartSets, workflows


        if(currentCanvasElement==='tables'){
            this.items = this.currentTableObject.tablesnav[$stateParams.tableId].fields;//currentTableObject is set in the directive's html
            var currentViewFields = this.currentTableObject.tablesnav[$stateParams.tableId].viewnav[$stateParams.viewId].vfields;
            currentViewFields = _.indexBy(currentViewFields,'fid');

            this.items.forEach(function(field){ //todo: this link should be build directly in the html but it's somehow not working there
                var fid = field.fid;
                field.linkTo = 'desktop.app.canvas.tables.table.view.field({appName:"'+$stateParams.appName+'",canvasName:"'+$stateParams.canvasName+'",tableId:"'+$state.params.tableId+'",viewId:"'+$state.params.viewId+'",fieldId:"'+fid+'"})';
                field.selected = currentViewFields[fid]?true:false;
            });
        }
        else if(currentCanvasElement==='forms'){
            this.items = this.currentTableObject.tablesnav[$stateParams.formTableId].fields;//currentTableObject is set in the directive's html
            var currentFormFields = this.currentTableObject.tablesnav[$stateParams.formTableId].formsnav[$stateParams.formId].ffields;
            currentFormFields = _.indexBy(currentFormFields,'fid');
            this.items.forEach(function(field){ //todo: this link should be build directly in the html but it's somehow not working there
                var fid = field.fid;
                field.linkTo = 'desktop.app.canvas.forms.table.form.field({appName:"'+$stateParams.appName+'",canvasName:"'+$stateParams.canvasName+'",formTableId:"'+$state.params.formTableId+'",formId:"'+$state.params.formId+'",formFieldId:"'+fid+'"})';
                field.selected = currentFormFields[fid]?true:false;
            });
        }

        this.switchStatus = function (item) {

            console.log('item----',item);



            if(currentCanvasElement === 'tables'){
                if(item.selected){

                    console.log('de-selected-----');
                    _.pullAt(self.currentTableObject.tablesnav[$state.params.tableId].viewnav[$state.params.viewId].vfields, _.findIndex(self.currentTableObject.tablesnav[$state.params.tableId].viewnav[$state.params.viewId].vfields,{'fid':item.fid}));
                }
                else{
                    console.log('selected-----');
                    self.currentTableObject.tablesnav[$state.params.tableId].viewnav[$state.params.viewId].vfields.push({'fid':item.fid});

                }

                var message1 = {
                    "op": "ams_update_entity",
                    "pl": {
                        "table": {
                            "eid":self.currentTableObject.tablesnav[$state.params.tableId].eid ,
                            "views":self.currentTableObject.tablesnav[$state.params.tableId].viewnav[$state.params.viewId]
                        }
                    }
                };

                console.log('updating table view message-----',message1);

                lbs.cbos.message(message1).then(function(response){
                    console.log('table view updated  ------',response);
                });

            }
            else if(currentCanvasElement === 'forms'){

                if(item.selected){
                    console.log('user unselected---');
                    _.pullAt(self.currentTableObject.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields, _.findIndex( self.currentTableObject.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields,{'fid':item.fid}));
                }
                else{
                    console.log('user selected---');
                    self.currentTableObject.tablesnav[$state.params.formTableId].formsnav[$state.params.formId].ffields.push({'fid':item.fid,'fd':cbos.canvas_tablesformTypeMap[item.ft][0].dir});
                }


                var message2 = {
                    "op": "ams_update_entity",
                    "pl": {
                        "table": {
                            "eid":self.currentTableObject.tablesnav[$state.params.formTableId].eid ,
                            "forms":self.currentTableObject.tablesnav[$state.params.formTableId].formsnav[$state.params.formId]
                        }
                    }
                };

                console.log('updating table view message-----',message2);

                lbs.cbos.message(message2).then(function(response){
                    console.log('table form updated  ------',response);
                });
            }

            item.selected = !item.selected;
           // $rootScope.$broadcast(eventname,{field:item});

        };

        this.addNew = function(){
            var fieldId = lbs.cbos.generateCode();
            $rootScope.$broadcast('cbosAddTableCollumn',{fid:fieldId});
        };


        $rootScope.$on('updateTableColumnData',function(event,data){
             var index = _.findIndex( self.items, { 'fid':data.fid});
            if(index>-1&&data.fn){self.items[index].fn = data.fn;}
        });

    }]);

    //todo the directives and controllers below should move to thier respective components/folders

    cbos.directives('cbosItem', function () {

        console.log("cbos cbosEyeSelector directives");

        return {
            scope: {
                'item': '=set',
                'switch': '&'
            },
            replace: true,
            controller: function() {},
            controllerAs: 'ctrl',
            bindToController: true,
            restrict: 'EA',
            templateUrl: 'base/directives/list-tem.html'
        };
    });

    cbos.directives('cbosItemsList', function () {

        return {
            scope: {
                'items': '=',
                'switch': '&'
            },
            restrict : 'EA',
            controller: function() {},
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'base/directives/cbos-list.html'
        };
    });

    cbos.directives('cbosItemsContainer', function(){
        return {
            controller: 'ItemsContainerController',
            controllerAs: 'ctrl',
            bindToController: true,
            scope:{
                currentTableObject:'='
            },
            templateUrl: 'base/directives/lits-items-container.html'
        };
    });

    cbos.directives('cbosTable', function () {
        return {
            restrict: 'EA',
            templateUrl: 'base/directives/cbos-table.html'
        };
    });

    cbos.directives('cbosTableContainer', function(){
        return {
            templateUrl: 'base/directives/cbos-table-container.html'
        };
    });

    cbos.directives('cbosCanvasInput', function() {
        return {
            templateUrl:'cbos_components/canvas/form/resources/partials/cbos-canvas-input.html',
            scope:{type:'@',required:'@',label:'@'}
        };
    });


    cbos.directives('cbosCanvasSelect', function() {
        return {
            templateUrl:'cbos_components/canvas/form/resources/partials/cbos-canvas-select.html',
            scope:{required:'@',label:'@'}
        };
    });

    cbos.directives('cbosCanvasTextarea', function() {
        return {
            templateUrl:'cbos_components/canvas/form/resources/partials/cbos-canvas-textarea.html',
            scope:{required:'@',label:'@'}
        };
    });


    cbos.directives('cbosCanvasRadio', function() {  //todo: update view for the user to specify the two choice(name and two labels)
        return {
            templateUrl:'cbos_components/canvas/form/resources/partials/cbos-canvas-radio.html',
            scope:{required:'@',label:'@'}
        };
    });

    cbos.directives('cbosCanvasFileInput', function() {
        return {
            templateUrl:'cbos_components/canvas/form/resources/partials/cbos-canvas-file-input.html',
            scope:{required:'@',label:'@'}
        };
    });



    cbos.controllers("cbosUiTreeController", ['$scope',function($scope) {

        $scope.remove = function (scope) {
            scope.remove();
        };

        $scope.toggle = function (scope) {
            scope.toggle();
        };

        $scope.moveLastToTheBeginning = function () {
            var a = $scope.data.pop();
            $scope.data.splice(0, 0, a);
        };

    }]);

    function canvas_createView($state,$scope){

        var entityId = lbs.cbos.generateCode();
        var  newView = {vfields: $scope.tcontainer.tablesnav[$state.params.tableId].fields, vid: entityId, vn: "View-"+entityId};

        var message = {
            "op": "ams_update_entity",
            "pl": {
                "table": {
                    "eid": $scope.tcontainer.tablesnav[$state.params.tableId].eid ,
                    "views": newView
                }
            }
        };


        return lbs.cbos.message(message).then(function(response){

            console.log(' view created-----',response);

            if(response&&response.pl&&response.pl.table){

             var   currentValue = _.findWhere(response.pl.table.views,{'vid':entityId});

             $scope.tcontainer.tablesnav[$state.params.tableId].views.push(currentValue);
             $scope.tcontainer.tablesnav[$state.params.tableId].viewnav  = _.indexBy($scope.tcontainer.tablesnav[$state.params.tableId].views,'vid')||{};;

                $scope.tcontainer.dropDownSelectedView = currentValue;
                $state.go('desktop.app.canvas.tables.table.view.field',{viewId:entityId});

           }
        });

    }

    function canvas_createForm($state,$scope){

        var entityId = lbs.cbos.generateCode();
        var  newItem = {fid: entityId, name: "Form-"+entityId, ffields:$scope.tcontainer.tablesnav[$state.params.formTableId].fields,ufid: entityId };

        var message = {
            "op": "ams_update_entity",
            "pl": {
                "table": {
                    "eid": $scope.tcontainer.tablesnav[$state.params.formTableId].eid ,
                    "forms": newItem
                }
            }
        };


        return lbs.cbos.message(message).then(function(response){

            console.log('form created-----',response);

            if(response&&response.pl&&response.pl.table){

                var   currentValue = _.findWhere(response.pl.table.forms,{'fid':entityId});

                $scope.tcontainer.tablesnav[$state.params.formTableId].forms.push(currentValue);

                $scope.tcontainer.tablesnav[$state.params.formTableId].forms.forEach(function(form){
                    form.ffields.forEach(function(field){
                        field.fd = field.fd||lbs.cbos.canvas_tablesformTypeMap[ $scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[field.fid].ft]?lbs.cbos.canvas_tablesformTypeMap[ $scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[field.fid].ft][0].dir:'';
                        field.label = field.label||$scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[field.fid].fn;
                        field.ft = field.ft||lbs.cbos.canvas_tablesformTypeMap[$scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[field.fid].ft]?lbs.cbos.canvas_tablesformTypeMap[$scope.tcontainer.tablesnav[$state.params.formTableId].fieldsnav[field.fid].ft][0].type:'';
                    });

                    form.fieldsnav = _.indexBy(form.ffields,'fid');
                });
                $scope.tcontainer.tablesnav[$state.params.formTableId].formsnav  = _.indexBy($scope.tcontainer.tablesnav[$state.params.formTableId].forms,'fid')||{};
                $scope.tcontainer.dropDownSelectedForm = currentValue;

                $state.go('desktop.app.canvas.forms.table.form.field',{formId:entityId});

            }
        });
    }

    cbos.eyeLists = {

        'tables':[{fn:'GUID',selected:true,fid:1000,linkTo:'desktop.app.canvas.tables.table.view.field({appName:"crm",canvasName:"dynamicCanvas",tableId:"t0001",viewId:"v0001",fieldId:"1000"})'}],
        'forms':[{fn:'GUID',selected:true,linkTo:'desktop'},
            {fn:'FORMS',selected:false,linkTo:'desktop'},
            {fn:'Quantity',selected:false,linkTo:'desktop'},
            {fn:'MOQ',selected:false,linkTo:'desktop'},
            {fn:'Supplier',selected:false,linkTo:'desktop'},
            {fn:'Production Name',selected:true,linkTo:'desktop'},
            {fn:'GUID',selected:true,linkTo:'desktop'},
            {fn:'Name',selected:false,linkTo:'desktop'},
            {fn:'Quantity',selected:false,linkTo:'desktop'},
            {fn:'MOQ',selected:true,linkTo:'desktop'}
        ],

        'charts':[{fn:'GUID',selected:false,linkTo:'desktop'},
            {fn:'CHARTS',selected:false,linkTo:'desktop'},
            {fn:'Quantity',selected:false,linkTo:'desktop'},
            {fn:'MOQ',selected:false,linkTo:'desktop'},
            {fn:'Supplier',selected:false,linkTo:'desktop'},
            {fn:'Production Name',selected:false,linkTo:'desktop'},
            {fn:'GUID',selected:true,linkTo:'desktop'},
            {fn:'Name',selected:false,linkTo:'desktop'},
            {fn:'Quantity',selected:false,linkTo:'desktop'},
            {fn:'MOQ',selected:true,linkTo:'desktop'}
        ]

    };

    cbos.workflowElements = [
        {code:'CBN000006',icon:'cbos_components/canvas/workflow/resources/images/flowChartIcons_03.png'},
        {code:'CBN000003',icon:'cbos_components/canvas/workflow/resources/images/flowChartIcons_05.png'},
        {code:'CBN000010',icon:'cbos_components/canvas/workflow/resources/images/flowChartIcons_13.png'},
        {code:'CBN000009',icon:'cbos_components/canvas/workflow/resources/images/flowChartIcons_10.png'}
    ];

    cbos.dynamicTable = {
        "cols":[ {fn:"GUID",ft:"String",fid:"001"}],
        "rows":[{},{},{},{},{},{},{},{},{},{},{},{}]
    };

    cbos.canvasGeneralCollpase = [
        {
            'id': 1,
            'title': 'Workflow',
            'nodes': [
                {
                    'id': 11,
                    'title': 'Process 1',
                    'nodes': []
                },
                {
                    'id': 12,
                    'title': 'Process 2',
                    'nodes': []
                },
                {
                    'id': 13,
                    'title': 'Process 3',
                    'nodes': []
                },
                {
                    'id': 14,
                    'title': 'Process 4',
                    'nodes': []
                }
            ]
        },
        {
            'id': 2,
            'title': 'Form',
            'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
            'nodes': [
                {
                    'id': 21,
                    'title': 'Process 1',
                    'nodes': []
                },
                {
                    'id': 22,
                    'title': 'Process 2',
                    'nodes': []
                },
                {
                    'id': 23,
                    'title': 'Process 3',
                    'nodes': []
                },
                {
                    'id': 24,
                    'title': 'Process 4',
                    'nodes': []
                }
            ]
        },
        {
            'id': 3,
            'title': 'Table',
            'nodes': [
                {
                    'id': 31,
                    'title': 'Process 1',
                    'nodes': []
                },
                {
                    'id': 32,
                    'title': 'Process 2',
                    'nodes': []
                }
            ]
        },
        {
            'id': 4,
            'title': 'Chart',
            'nodes': [
                {
                    'id': 41,
                    'title': 'Process 1',
                    'nodes': []
                },
                {
                    'id': 42,
                    'title': 'Process 2',
                    'nodes': []
                },
                {
                    'id': 43,
                    'title': 'Process 3',
                    'nodes': []
                },
                {
                    'id': 44,
                    'title': 'Process 4',
                    'nodes': []
                }
            ]
        }
    ];

    cbos.canvasTableFieldTypes = ["String","Number","Boolean","Date","File","Expression","Choice","Lookup"];

    cbos.canvas_tablesformTypeMap = {
        'String': [{type: 'Text', dir: '0001'}, {type: 'Textarea', dir: '1000'}],
        'Number': [{type: 'Number', dir: '0010'}, {type: 'Range', dir: '0010'}],
        'Date': [{type: 'Date', dir: '0011'}, {type: 'DateTime', dir: '0100'}],
        'Expression': [{type: 'Text', dir: '0001'}],
        'Lookup': [{type: 'Text', dir:'0001'}],
        'Choice': [{type: 'Single Choice', dir: '0101'}, {type: 'Multiple Choices', dir: '0101'}],
        'Boolean': [{type: 'Radio', dir: '0110'}],
        'File': [{type: 'image', dir: '0111'}, {type: 'document', dir: '0111'}]
    };


    cbos.canvas_tablesformDirsMap = {
        '0001': '<cbos-canvas-input  type="text"  required="true" ></cbos-canvas-input>',
        '0010': '<cbos-canvas-input  type="number"  required="true" ></cbos-canvas-input>',
        '0011': '<cbos-canvas-input  type="date"   ></cbos-canvas-input>',
        '0100': '<cbos-canvas-input  type="datetime"   ></cbos-canvas-input>',
        '0101':'<cbos-canvas-select  required="true" cbos-form-directives="true"></cbos-canvas-select>',
        '0110':'<cbos-canvas-radio  ></cbos-canvas-radio>',
        '0111':'<cbos-canvas-file-input  ></cbos-canvas-file-input>',
        '1000':'<cbos-canvas-textarea  ></cbos-canvas-textarea>'
    };

});