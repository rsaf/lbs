
var initPage = function() {
    var allUsersHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/users/all.html", function(d) {
        allUsersHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html( allUsersHtml);

        table_effects();

    })

}();/*end of init*/
