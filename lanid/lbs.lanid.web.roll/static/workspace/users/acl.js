


var initPage = function() {
    var aclHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/users/acl.html", function(d) {
        aclHtml= d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html( aclHtml);

        table_effects();

    })

}();/*end of init*/


