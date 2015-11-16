/**
 * Created by leo on 9/7/15.
 */

define(['cbos'], function(cbos) {
    console.log("twits controller loaded");

    cbos.controllers('tableTwitsController', function ($scope){
        console.log(' twits controller executed ');
    });

    cbos.directives('cbosTableTwits', function() {

        console.log("twits directives  executed ...");

        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'tableTwitsController',
            templateUrl: 'cbos_components/twits/view.html'
        }
    });
});


