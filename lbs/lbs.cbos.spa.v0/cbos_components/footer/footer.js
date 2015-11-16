/**
 * Created by lbs005 on 8/12/15.
 */


define(['cbos'], function(cbos) {
    console.log("footer controller loaded");

    cbos.controllers('footerController', function ($scope){
        console.log(' footer controller executed ');
    });

    cbos.directives('cbosFooter', function() {

        console.log("cbos footer directives  executed ...");

        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'footerController',
            templateUrl: 'cbos_components/footer/view.html'
        }
    });
});


