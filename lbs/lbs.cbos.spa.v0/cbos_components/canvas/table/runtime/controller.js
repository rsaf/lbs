/**
 * Created by leo on 10/13/15.
 */

define(['cbos'], function(cbos) {


    cbos.controllers('cbosTableRuntimeController',['$scope', '$state', '$rootScope','$css', '$element', '$attrs', function ($scope, $state,$rootScope,$css, $element, $attrs) {


         cbos.layoutTablesInfo = {}; //also defined in the layout controller;
         cbos.layoutTablesInfo[$attrs.rtid] = {eid:$attrs.tid, ftu:$attrs.ftu,mftu:$attrs.mftu};


        if($rootScope.cbosMobileMode)
        { $scope.linkTo  = "desktop.app.layout.addTableRecordMobile({mrecordTableId:'"+ $attrs.rtid+"',mrecordFormId:'"+$attrs.rfid+"'})";

        }
        else{
            $scope.linkTo  = "desktop.app.layout.addTableRecord({recordTableId:'"+ $attrs.rtid+"',recordFormId:'"+$attrs.rfid+"'})";
        }

        // var lid = app_data.navigationleft.layoutsnav[$stateParams.layoutName.toUpperCase()].lid;
        var message = {
            "sqm": {"parent": $attrs.tid},
            "op": "ams_read_entities",
            "pl": {
                "rows": {}
            }
        };
      lbs.cbos.message(message).then(function (r) {
           var rows =    $rootScope.cbosMobileMode?r.pl.rows:lbs.cbos.lib.fillup(r.pl.rows, 14);
           $scope.rows = rows;
      });

        $scope.componentTitle = $attrs.title;
        $css.add('cbos_components/canvas/table/runtime/resources/css/table.css');

    }]);

    cbos.directives('cbosTableRuntime', ['$rootScope',function ($rootScope) {
        console.log("cbos run time Table component ...");
        return {
            restrict: 'E',
            scope: {
                onChange: '&'
            },
            controller: 'cbosTableRuntimeController',
            templateUrl: function(elem, attr){

                if($rootScope.cbosMobileMode)
                    return attr.mvtu;
                else return attr.vtu;
                //return 'cbos_components/canvas/table/runtime/view.html'
            }
            //css: 'cbos_components/canvas/table/runtime/resources/css/table.css'
        }
    }]);

});
