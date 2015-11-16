


// Initialise page
var initPage = function() {

    var publicFormsHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/activities/publicforms.html", function(d) {
        publicFormsHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(publicFormsHtml);

        table_effects();

    })

}();/*end of init*/


