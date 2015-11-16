
// Initialise page
var initPage = function() {


    var activitiesFormsHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/activities/activitiesforms.html", function(d) {
        activitiesFormsHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(activitiesFormsHtml);

        table_effects();

    })

}();/*end of init*/


