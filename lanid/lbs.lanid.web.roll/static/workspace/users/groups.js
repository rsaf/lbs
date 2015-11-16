
var initPage = function() {
    var groupsHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/users/groups.html", function(d) {
        groupsHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html( groupsHtml);

        table_effects();

    })

}();/*end of init*/
