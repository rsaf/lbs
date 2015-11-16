


  // Initialise page
  var initPage = function() {

      var agentHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/responses/agent.html", function(d){
         agentHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html( agentHtml);
						
					   table_effects();
					 })
					
			 }();/*end of init*/


