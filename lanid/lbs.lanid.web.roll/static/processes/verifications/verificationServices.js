
  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {

  

 // Load the HTML template
  $.get("/processes/verifications/verificationServices.html", function(d){
        personalfinHistoryHtml= d;
        	 $("#home_main_containter_selector").removeClass('home_main_containter');//add a new class to the main_contaiter
			$("#home_main_containter_selector").addClass('notHomeMainContainer');
										
        });
   
  $(document).ajaxStop(function () {
						
						   $(".notHomeMainContainer").html(personalfinHistoryHtml);
                           
                           $('.selectpicker').selectpicker();
                             slideEffectsHandler();
                            paddingEffecfts();
                            table_effects();
                          updateWorkSpaceRightContainerOnClick(".singleIDVerification","../processes/verifications/singleIDForm");
                          updateWorkSpaceRightContainerOnClick(".groupIDVerification","../processes/verifications/groupIDForm");
                         updateWorkSpaceRightContainerOnClick(".iDCheck","../processes/verifications/checkIDForm");
						                  
                  
					 })
					
			 }();/*end of init*/


