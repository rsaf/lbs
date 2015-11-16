
  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {

  

 // Load the HTML template
  $.get("/home/responses/IDphoto/photoPrinting.html", function(d){
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
                        updateWorkSpaceRightContainerOnClick(".IDPhotoApplicationNextStep","../home/responses/IDphoto/payment.js");
						                  
                  
					 })
					
			 }();/*end of init*/


