

// Initialise page
var initPage = function() {


    var rejectedHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/requests/rejected.html", function(d) {
        rejectedHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(rejectedHtml);

        table_effects();

    })

}();/*end of init*/




