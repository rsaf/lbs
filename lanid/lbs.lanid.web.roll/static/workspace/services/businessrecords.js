
var personalMasterHtml, businessRecordsHtml;   // Main template HTML
var userProfileJson;
tdata = {};  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }

// Initialise page
var initPage = function() {



    // Load the HTML template
    $.get("/workspace/services/businessrecords.html", function(d) {
        businessRecordsHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(businessRecordsHtml);

        table_effects();

    })

}();/*end of init*/


