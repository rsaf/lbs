
  var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
  var userProfileJson;
  tdata = {  };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {

  

 // Load the HTML template
  $.get("/workspace/finance/history.html", function(d){
        personalfinHistoryHtml= d;
        });
   
  $(document).ajaxStop(function () {
						
						$("#right_container").html( personalfinHistoryHtml);
                          $("#wrapperSelector").addClass('fixed_size_wrapper');
					  
						
					   table_effects();
					 })
					
			 }();/*end of init*/


