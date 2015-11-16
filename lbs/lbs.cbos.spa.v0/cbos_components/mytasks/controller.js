/**
 * Created by leo on 9/7/15.
 */
define(['cbos'], function(cbos) {
    console.log("my tasks controller loaded");

    cbos.controllers('tableMytasksController', function ($scope){
        console.log(' my tasks controller executed ');
    });

    cbos.directives('cbosTableMytasks', function() {

        console.log("cbos my tasks directives  executed ...");

        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'tableMytasksController',
            templateUrl: 'cbos_components/mytasks/view.html'
        }
    });
});


