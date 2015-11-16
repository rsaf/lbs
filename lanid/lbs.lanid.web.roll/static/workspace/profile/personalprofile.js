


 // Initialise page
  var initPage = function() {
      var personalProfileHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/profile/personalprofile.html", function(d){
      personalProfileHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html( personalProfileHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
					  
					   table_effects();
                     

					 })
					
			 }();/*end of init*/


