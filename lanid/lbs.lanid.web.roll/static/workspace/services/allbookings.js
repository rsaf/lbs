


// Initialise page
var initPage = function() {
    var  allBookingsHtml;   // Main template HTML



    // Load the HTML template
    $.get("/workspace/services/allbookings.html", function(d) {
        allBookingsHtml= d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(allBookingsHtml);

        table_effects();

    })

}();/*end of init*/


