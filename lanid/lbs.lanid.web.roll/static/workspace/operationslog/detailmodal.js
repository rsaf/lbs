
var personalMasterHtml, personalfinHistoryHtml;   // Main template HTML
var userProfileJson;
tdata = {};  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }


  var initPage = function() {

	 var getRegistrationPageHtml= $.get("/workspace/operationslog/detailsPopUp.html", function(d){
								  
											 templateHtml = d;//save template
                                             
												});
                                                
         $(document).ajaxStop(function () {
					
                     $(".popUpContainer").html(templateHtml);
                        runFancyBoxFunc(".popUpContainer");
                     
					 })
                     
                     
                     
					/*						
								  $.when(getRegistrationPageHtml).then( function(){
														
														 var appedHtml = function(){
                                                              $(".popUpContainer").html(templateHtml);
                                                         }
                                                       
                                                         
                                                           
														     	//v_aligner();
										});
*/


 }();
