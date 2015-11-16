//script for reset Pw 2 step Procedure


		 
/*forgot password procedure indicator: add the blue indicator at the current level of the user operation*/
	
	
	
	
	 // alert("confirmation email");
					  
	

  // Initialise page
  var initPage = function() {
	  	
					 var userEmailClicked= true;
					var jsonData = {"userEmailClicked": userEmailClicked};
					  
					   var getEmailValidationJson   = $.post( "/home/forgotPwConfirmEmail", JSON.parse(JSON.stringify(jsonData)), function( paramReturndata ) {	
					
				  // alert("receiving json data: email is :"+ JSON.stringify(paramReturndata));
				   ConfEmailJson = JSON.parse(JSON.stringify(paramReturndata));
				   
				   
				   }, "json");
				   
				  
					 var getResetEmailHtml= $.get("/home/resetPw.html", function(d){
					  
								 resetEmailHtml = d;
							
								});
					  $.when(getResetEmailHtml, getEmailValidationJson ).then( function(){
											
										//	alert("rendering");
										
											// alert("json for confirmation email :"+JSON.stringify( ConfEmailJson));
												// alert("html for confirmation email :"+ resetEmailHtml);
										   
											  var renderedPage = Mustache.to_html( resetEmailHtml);
											//  alert(renderedPage);
											//  alert($("#regBoxBody").html());
											   $("#regBoxBody").html(renderedPage);
											   resetPasswordForm();
											   
											   ShiftOperationIndicatorBar(".forgotPwLevel3");
											   
											 //  alert($("#regBoxBody").html());
											   
									  
										 });
						 
		
 		}();


	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

 //seset password
			 

function resetPasswordForm(){
		
		
				$("#forgotPwNewPassoword").click(function(e) {
		  
							  //alert("password reset");
							  
							 var userNewPassword= $("#newPasswordInput #password").val();
							var jsonData = {"userNewPassword": userNewPassword};
							//alert("interred password : "+userNewPassword);
							  
							 var postEmailValidationJson   = $.post( "/home/forgotPwNewPassword", JSON.parse(JSON.stringify(jsonData)), function( paramReturndata ) {	
							
						  // alert("receiving json data: email is :"+ JSON.stringify(paramReturndata));
						   newPasswordJson = (JSON.parse(JSON.stringify(paramReturndata))).savedPassword;//data type :string
						   
						   
						   }, "json");
						   
						  
							 var getResetEmailHtml= $.get("/home/forgotPwDone.html", function(d){
							  
										 resetPwDoneHtml = d;
									
										});
							  $.when(getResetEmailHtml, postEmailValidationJson ).then( function(){
													
												//	alert("rendering");
												
													// alert("server returned new password : "+ newPasswordJson);
													// alert("html for seset password done : \n"+ resetPwDoneHtml);
												   
													  var renderedPage = Mustache.to_html( resetPwDoneHtml);
													//  alert(renderedPage);
													//  alert($("#regBoxBody").html());
													   $("#regBoxBody").html(renderedPage);
													  
													  
													   redictToHome();
													   ShiftOperationIndicatorBar(".forgotPwLevel4");
													   
													 //  alert($("#regBoxBody").html());
													   
											  
												 });
								 
								
									 
						 e.preventDefault();
			
			});
	  
  
  
	}
	
	
	
  
//end of seset password

  
 
  
 //  load home page when clicking on the link of the succesfull password reset page
				
		
	var redictToHome=function (){
		
		//redirect after few seconds
		  setTimeout(
		  
		  
		  function (){
					getHomeLogginPage();
			  }
		  , 4990);//just before 5 second ,to catch up the countDown function which runs immediately when the html is available on the DOM
			
		
		
		
		
		
		//redirect on click
		$(".homeLogginPageLink").click(function(e) {
				
							getHomeLogginPage();
						e.preventDefault();			 
  	  			});
			
		
		
		}
		




var	getHomeLogginPage=function(){
				
								
						var getHomeHomeHtml= $.get("/home/home.html", function(d){
      										  homeHtml = d;
											   
									$("#home_main_containter_selector").removeClass('notHomeMainContainer');	 
								$("#home_main_containter_selector").addClass('home_main_containter');//add a new class to the main_contaiter
														//alert("getting home login ");
								
      									  });
  
  				 $.when(getHomeHomeHtml).then(function(){
								 
								// alert("rendering home page");
					 				
					  			 $(".home_main_containter").html(homeHtml);
								 
								
					  		 	v_aligner();
								randomString();	
								HomeOnClickHandler();
								onHomeLogginSubmit();
								servicePointRegistrationHandler();
							 });
			
  	   
					 
		}
	



							
	// end of load home page when clicking on the link click
	 
	 
	/* enf of forgot password procedure indicator: add the blue indicator at the current level of the user operation*/
	












