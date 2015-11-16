

// Initialise page
var initPage = function() {


    var unprocessHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/requests/unprocess.html", function(d) {
        unprocessHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(unprocessHtml);

        table_effects();

    })

}();/*end of init*/




