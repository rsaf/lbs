


  // Initialise page
  var initPage = function() {

      var corporateProfileHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/publishing/activities.html", function(d){
      corporateProfileHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						//$("#right_container").html(  corporateProfileHtml);
                        $("#main_container").html(  corporateProfileHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
                           $('.selectpicker').selectpicker();
                          // updateWorkSpaceRightContainerOnClick(".applicationNextStep","/processes/company/payment");
					  
					   table_effects();

                     

					 })
					
			 }();/*end of init*/


