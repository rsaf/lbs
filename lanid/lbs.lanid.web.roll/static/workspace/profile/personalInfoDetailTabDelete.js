
  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {

  

 // Load the HTML template
  $.get("/workspace/profile/personalInfoDetailTabDelete.html", function(d){
        personalfinHistoryHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html( personalfinHistoryHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
					   updateWorkSpaceRightContainerOnClick(".personalFileDetailInfoTab","../../workspace/profile/personalFiles.js");
                       updateWorkSpaceRightContainerOnClick(".previewInfo","../../workspace/profile/personalInfoPreview.js");
            


					 })
					
			 }();/*end of init*/


