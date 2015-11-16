
  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {

  

 // Load the HTML template
  $.get("/processes/company/payment.html", function(d){
        personalfinHistoryHtml= d;
        	 $("#home_main_containter_selector").removeClass('home_main_containter');//add a new class to the main_contaiter
			$("#home_main_containter_selector").addClass('notHomeMainContainer');
										
        });
   
  $(document).ajaxStop(function () {
						
						   $(".allPagesMainContainer").html(personalfinHistoryHtml);
                           
                           $('.selectpicker').selectpicker();
                            updateWorkSpaceRightContainerOnClick(".paymentSuccessBtn","/processes/company/done");
                  
					 })
					
			 }();/*end of init*/


