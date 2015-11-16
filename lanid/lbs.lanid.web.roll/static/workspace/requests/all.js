

// Initialise page
var initPage = function() {


    var allRequestsHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/requests/all.html", function(d) {
        allRequestsHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(allRequestsHtml);

        table_effects();

    })

}();/*end of init*/


