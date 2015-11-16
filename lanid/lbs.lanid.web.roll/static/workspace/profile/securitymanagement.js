


  // Initialise page
  var initPage = function() {

      var  securityManagementHtml;   // Main template HTML

 // Load the HTML template
  $.get("/workspace/profile/securitymanagement.html", function(d){
      securityManagementHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html(securityManagementHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
					   table_effects();

					 })
					
			 }();/*end of init*/


