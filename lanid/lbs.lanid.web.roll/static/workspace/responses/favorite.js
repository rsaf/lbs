


// Initialise page
var initPage = function() {
    var favoriteHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/responses/favorite.html", function(d) {
        favoriteHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(favoriteHtml);

        table_effects();

    })

}();/*end of init*/


