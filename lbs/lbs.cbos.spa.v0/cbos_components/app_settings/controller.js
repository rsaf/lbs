/**
 * Created by leo on 10/24/15.
 */

/**
 * Created by leo on 10/13/15.
 */

define(['cbos'], function(cbos) {

    cbos.controllers('appsettingsController',['$scope', '$state', '$rootScope','$css', '$element','get_appsettings_json', function ($scope, $state,$rootScope,$css, $element,get_appsettings_json) {

        // var lid = app_data.navigationleft.layoutsnav[$stateParams.layoutName.toUpperCase()].lid;
        //var message = {
        //    "sqm": {"parent": $attrs.tid},
        //    "op": "ams_read_entities",
        //    "pl": {
        //        "rows": {}
        //    }
        //};
        //lbs.cbos.message(message).then(function (r) {
        //    console.log("SPA: read tables row data json ===========> ", r);
        //
        //    var rows =  fillup(r.pl.rows, 8);
        //    $scope.rows = rows;
        //});
        //
        //$scope.componentTitle = $attrs.title;
        //$css.add('cbos_components/canvas/table/runtime/resources/css/table.css');


        $scope.data = get_appsettings_json;

    }]);

    cbos.controllers("cbosUiTreeController", ['$scope','$stateParams',function($scope,$stateParams) {

       // $scope.collapsed = true;

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

      //  $scope.data = lbs.cbos.user.navigationtop.appsnav[$stateParams.appName.toUpperCase()].settings.components;

        //$scope.data = [
        //    {
        //        'id': 1,
        //        'title': 'Canvas1',
        //        'nodes': [
        //            {
        //                'id': 11,
        //                'title': 'Workflow',
        //                'nodes': [
        //                    {
        //                        'id': 111,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 112,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 113,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 114,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }, {
        //                'id': 12,
        //                'title': 'Form',
        //                'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
        //                'nodes': [
        //                    {
        //                        'id': 121,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 122,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 123,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 124,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }, {
        //                'id': 13,
        //                'title': 'Table',
        //                'nodes': [
        //                    {
        //                        'id': 131,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 132,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    }
        //                ]
        //            },
        //            {
        //                'id': 14,
        //                'title': 'Chart',
        //                'nodes': [
        //                    {
        //                        'id': 141,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 142,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 143,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 144,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }
        //        ]
        //    },
        //    {
        //        'id': 2,
        //        'title': 'Canvas1',
        //        'nodes': [
        //            {
        //                'id': 11,
        //                'title': 'Workflow',
        //                'nodes': [
        //                    {
        //                        'id': 111,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 112,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 113,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 114,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }, {
        //                'id': 12,
        //                'title': 'Form',
        //                'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
        //                'nodes': [
        //                    {
        //                        'id': 121,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 122,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 123,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 124,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }, {
        //                'id': 13,
        //                'title': 'Table',
        //                'nodes': [
        //                    {
        //                        'id': 131,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 132,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    }
        //                ]
        //            },
        //            {
        //                'id': 14,
        //                'title': 'Chart',
        //                'nodes': [
        //                    {
        //                        'id': 141,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 142,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 143,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 144,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }
        //        ]
        //    },
        //    {
        //        'id': 3,
        //        'title': 'Canvas1',
        //        'nodes': [
        //            {
        //                'id': 11,
        //                'title': 'Workflow',
        //                'nodes': [
        //                    {
        //                        'id': 111,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 112,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 113,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 114,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }, {
        //                'id': 12,
        //                'title': 'Form',
        //                'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
        //                'nodes': [
        //                    {
        //                        'id': 121,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 122,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 123,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 124,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }, {
        //                'id': 13,
        //                'title': 'Table',
        //                'nodes': [
        //                    {
        //                        'id': 131,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 132,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    }
        //                ]
        //            },
        //            {
        //                'id': 14,
        //                'title': 'Chart',
        //                'nodes': [
        //                    {
        //                        'id': 141,
        //                        'title': 'Process 1',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 142,
        //                        'title': 'Process 2',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 143,
        //                        'title': 'Process 3',
        //                        'nodes': []
        //                    },
        //                    {
        //                        'id': 144,
        //                        'title': 'Process 4',
        //                        'nodes': []
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //]

    }]);

});

