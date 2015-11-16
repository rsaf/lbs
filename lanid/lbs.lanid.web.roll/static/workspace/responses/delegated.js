

// Initialise page
var initPage = function() {

    var delegatedHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/responses/delegated.html", function(d){
        delegatedHtml= d;
    });

    $(document).ajaxStop(function () {

        $("#right_container").html(delegatedHtml);

        table_effects();
    })

}();/*end of init*/

