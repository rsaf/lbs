/**
 * Created by leo on 9/1/15.
 */

//lbs.cbos.controllers('layoutController', function ($http, $scope, $sce){
//   $http.get('cbos_components/layouts/desktop_demo/view.html').then(function success(r){
//       $scope.layoutView= $sce.trustAsHtml(r.data);
//   }).then(null, function failure(r){
//       console.log(r);
//   });
//});
////'<div ng-controller="layoutController" ng-bind-html="layoutView"></div>'
//

define(['../../cbos'], function(cbos) {
    console.log("cbos object in layout out controller js ", cbos);
    cbos.controllers('layoutController', function ($http, $scope, $sce){
    console.log("layout controller method has been call, scope variable is available");
    });
});
