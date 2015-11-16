define(['cbos'], function(cbos) {
    console.log("my documents controller loaded");

    cbos.controllers('tableMydocumentsController', function ($scope){
        console.log(' my documents controller executed ');
    });

    cbos.directives('cbosTableMydocuments', function() {

        console.log("cbos my documents directives  executed ...");

        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'tableMydocumentsController',
            templateUrl: 'cbos_components/mydocuments/view.html'
        }
    });
});


