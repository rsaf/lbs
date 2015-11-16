


// Initialise page
var initPage = function() {
    var allResponsesHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/responses/all.html", function(d) {
        allResponsesHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(allResponsesHtml);

        table_effects();

    })

}();/*end of init*/


