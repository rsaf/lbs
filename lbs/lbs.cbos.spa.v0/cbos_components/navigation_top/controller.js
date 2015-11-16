
define(['cbos'], function(cbos) {
    cbos.controllers('navigationTopController', ['$scope', '$rootScope','$state', function ($scope, $rootScope,$state) {
        $scope.topnav = lbs.cbos.user.desktop.topnav.apps;
        $rootScope.$on('newAppCreated', function (event, options) {
            $scope.topnav = lbs.cbos.user.desktop.topnav.apps;
        });
    }]);
    cbos.directives('cbosNavigationTop', function() {
        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'navigationTopController',
            templateUrl: 'cbos_components/navigation_top/view.html'
        }
    });
    cbos.directives('cbosTopNavigationItem', ['$compile','$rootScope',function( $compile){
        return{
            restrict:'A',
            controller:'menuController',
            scope:{},
            link:function(scope, elem, attrs){
            }
        };
    }]);
    cbos.controllers('toolBoxAppIconsRender', function($scope){
        var width = window.innerWidth;
        var iconWidth = 96;
        var deduct = 200;
        if(width<= 480){
            iconWidth = 86;
            deduct = 100;
        }
        if(width >= 1230){
            deduct = 300;
        }
        if(width >= 1400){
            deduct = 500;
        }
        var numberToShow = Math.floor((width-deduct)/(iconWidth));
        var totalSize = lbs.cbos.base.appIcons.length;
        //console.log('totalSize-----',totalSize);
        $scope.numberToShow = numberToShow+"";
        $scope.appIcons = lbs.cbos.base.appIcons;
        $scope.sigleWidth = 100/numberToShow;
        //console.log('$scope.totalSize-----',totalSize);
        //console.log('numberToShow-----',numberToShow);
        $scope.toolBoxView = '';
        $scope.setToolBoxView = function (view) {
            $scope.toolBoxView = view;
            //console.log('updating view',$scope.toolBoxView);
        };

        //caroussel config

    });

});


