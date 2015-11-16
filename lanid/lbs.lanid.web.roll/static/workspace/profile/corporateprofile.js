


  // Initialise page
  var initPage = function() {

      var corporateProfileHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/profile/corporateprofile.html", function(d){
      corporateProfileHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html(  corporateProfileHtml);
                       // $("#main_container").html(  corporateProfileHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
                          
                            updateWorkSpaceRightContainerOnClick(".profileMainPageRightInfo", "/workspace/profile/corporateProfileForm");
					  
					   table_effects();

                     

					 })
					
			 }();/*end of init*/


