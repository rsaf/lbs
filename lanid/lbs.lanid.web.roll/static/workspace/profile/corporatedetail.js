
  // Initialise page
  var initPage = function() {

      var corporateDetailHtml;   // Main template HTML

      // Load the HTML template
  $.get("/workspace/profile/corporatedetail.html", function(d){
      corporateDetailHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html(corporateDetailHtml);
                        $("#wrapperSelector").addClass('fixed_size_wrapper');

					 })
					
  }();/*end of init*/


