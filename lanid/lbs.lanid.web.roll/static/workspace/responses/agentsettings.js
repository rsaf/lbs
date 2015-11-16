

// Initialise page
var initPage = function() {

    var agentSettingsHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/responses/agentsettings.html", function(d){
        agentSettingsHtml= d;
    });

    $(document).ajaxStop(function () {

        $("#right_container").html(agentSettingsHtml);

        table_effects();
    })

}();/*end of init*/



