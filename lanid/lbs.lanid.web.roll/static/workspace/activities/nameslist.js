
// Initialise page
var initPage = function() {

    var  namesListHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/activities/nameslist.html", function(d) {
        namesListHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(namesListHtml);

        table_effects();

    })

}();/*end of init*/


