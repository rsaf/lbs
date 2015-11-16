


  // Initialise page
  var initPage = function() {
      var conventionalHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/responses/conventional.html", function(d){
      conventionalHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html( conventionalHtml);
						
					   table_effects();
					 })
					
  }();/*end of init*/


