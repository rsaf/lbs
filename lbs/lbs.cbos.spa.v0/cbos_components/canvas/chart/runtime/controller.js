/**
 * Created by leo on 10/23/15.
 */


define(['cbos'], function(cbos) {

    cbos.controllers('cbosChartRuntimeController',['$scope', '$state', '$rootScope','$css', '$element', '$attrs', function ($scope, $state,$rootScope,$css, $element, $attrs) {
        $scope.componentTitle = $attrs.title;
        //var message = {
        //    "sqm": {"parent": $attrs.tid},
        //    "op": "ams_read_entities",
        //    "pl": {
        //        "rows": {}
        //    }
        //};
        //lbs.cbos.message(message).then(function (r) {
        //    console.log("SPA: read chart data json ===========> ", r);
        //    $scope.rows = rows;
        //});

        var chart = c3.generate({
            bindto: '#chart',
            data: {
                columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25]
                ],
                axes: {
                    data2: 'y2'
                },
                types: {
                    data2: 'bar' // ADD
                }
            },
            axis: {
                y: {
                    label: {
                        text: 'Y Label',
                        position: 'outer-middle'
                    }
                },
                y2: {
                    show: true,
                    label: {
                        text: 'Y2 Label',
                        position: 'outer-middle'
                    }
                }
            }
        });


        //$css.add('cbos_components/canvas/table/runtime/resources/css/table.css');

    }]);

    cbos.directives('cbosChartRuntime', function () {
        console.log("cbos run time Chart component ...");
        return {
            restrict: 'E',
            scope: {
                onChange: '&'
            },
            controller: 'cbosChartRuntimeController',
            templateUrl: function(elem, attr){
                //return attr.vtu;
                return 'cbos_components/canvas/chart/runtime/view.html'
            }
            //css: 'cbos_components/canvas/table/runtime/resources/css/table.css'
        }
    });

});

