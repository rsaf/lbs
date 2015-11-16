/**
 * Created by leo on 9/7/15.
 */
define(['cbos'], function(cbos) {
    console.log("news controller loaded");

    cbos.controllers('tableNewsController', function ($scope){
        console.log(' news controller executed ');
    });

    cbos.directives('cbosTableNews', function() {
        console.log("news directives  executed ...");
        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'tableNewsController',
            templateUrl: 'cbos_components/news/view.html'
        }
    });
});
