/**
 * Created by leo on 9/7/15.
 */

define(['cbos'], function(cbos) {
    console.log("cbos clock controller loaded");

    cbos.controllers('ClockController', function ($scope){
        console.log(' cbos clock controller executed ');
    });

    cbos.directives('cbosClock', function() {

        console.log("cbos clock directives  executed ...");

        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'ClockController',
            templateUrl: 'cbos_components/clock/view.html'
        }
    });
});



