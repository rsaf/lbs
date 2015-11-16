/**
 * Created by leo on 11/2/15.
 */


define(['cbos'],function(cbos){

    cbos.directives('cbosAddComponent', function() {
        return {
            templateUrl:function(element, attrs){
                return 'base/directives/cbos-add-'+attrs['type']+'.html';
            },
            require:'^cbosAddComponentContainer',
            scope:{
                lig:'@'
            },
            controller:function($scope,$stateParams){
                $scope.appName = $stateParams.appName;
            }
        };
    });
    cbos.directives('cbosAddComponentContainer', function() {
        return {
            templateUrl: 'base/directives/cbos-add-component-container.html',
            scope:{
                lig:'@'
            }
        };
    });

});