
// Initialise page
var initPage = function() {


    var servicesListHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/activities/serviceslist.html", function(d) {
        servicesListHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(servicesListHtml);

        table_effects();

    })

}();/*end of init*/


