


  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {

  

 // Load the HTML template
  $.get("/home/detailPages/businessTaskDetailPage.html", function(d){
        personalfinHistoryHtml= d;
        	 $("#home_main_containter_selector").removeClass('home_main_containter');//add a new class to the main_contaiter
			$("#home_main_containter_selector").addClass('HomeMainContainerWhiteBg');
      // change code
					 $("#home_main_containter_selector").addClass('notHomeMainContainer');					
        });
   
  $(document).ajaxStop(function () {
						
						$(".HomeMainContainerWhiteBg").html( personalfinHistoryHtml);
						  $("#wrapperSelector").addClass('fixed_size_wrapper');
                            slideEffectsHandler();
                            paddingEffecfts();
                             markAsLiked();
                            showCommentTextArea();

                    
						
					 
					 })
					
			 }();/*end of init*/



