


  // Initialise page
  var initPage = function() {

      var corporateProfileHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/profile/corporateFullProfile.html", function(d){
      corporateProfileHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						//$("#right_container").html(  corporateProfileHtml);
                        $("#main_container").html(  corporateProfileHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
                
					  
					   table_effects();

                     

					 })
					
			 }();/*end of init*/


