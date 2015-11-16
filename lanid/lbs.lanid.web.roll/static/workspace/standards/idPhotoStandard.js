/**
 * Created by rollandsafort on 12/19/14.
 */



// Initialise page
var initPage = function() {

    var  activitiesListHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/standards/idPhotoStandard.html", function(d) {
        activitiesListHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(activitiesListHtml);

        table_effects();
        $('.selectpicker').selectpicker();
       // updateWorkSpaceRightContainerOnClick(".createNewActivity", "/publishing/services/publishing");

    })

}();/*end of init*/


