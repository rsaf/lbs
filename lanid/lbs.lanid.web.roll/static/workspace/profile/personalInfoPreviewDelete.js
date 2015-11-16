
  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {



 // Load the HTML template
  $.get("/workspace/profile/personalInfoPreview.html", function(d){
        personalinfoHtml= d;
           });
   
  $(document).ajaxStop(function () {
						
						$(".notHomeMainContainer").html( personalinfoHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
					 
					 })
					
			 }();/*end of init*/


