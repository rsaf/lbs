

// Initialise page
var initPage = function() {


    var approvedHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/requests/approved.html", function(d) {
        approvedHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(approvedHtml);

        table_effects();

    })

}();/*end of init*/




