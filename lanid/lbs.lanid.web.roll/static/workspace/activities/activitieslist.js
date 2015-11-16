
// Initialise page
var initPage = function() {

var  activitiesListHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/activities/activitieslist.html", function(d) {
        activitiesListHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(activitiesListHtml);

        table_effects();
       // updateWorkSpaceRightContainerOnClick(".createNewActivity", "/publishing/services/publishing");

    })

}();/*end of init*/


