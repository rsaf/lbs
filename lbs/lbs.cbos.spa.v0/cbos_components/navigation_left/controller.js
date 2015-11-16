/**
 * Created by leo on 9/1/15.
 */

define(['cbos'], function(cbos) {

    cbos.controllers('leftNavigationController',['$scope', '$state', '$rootScope', function ($scope, $state,$rootScope) {
        console.log('leftNavigationController loading ');

        $rootScope.$on('newLayoutCreated', function (event, options) {
            $scope.navigation = options.leftNav;
        });
        $scope.navigation = lbs.cbos.user.desktop.apps[$state.params.appName].leftnav.layouts;

    }]);

    cbos.directives('cbosLeftNavigationComponent', function () {
        console.log("cbos leftNavigation component ...");
        return {
            restrict: 'E',
            scope: {
                onChange: '&'
            },
            controller: 'leftNavigationController',
            templateUrl:'cbos_components/navigation_left/view.html'
        }
    });

});
