//
// var usrTyper=null;
//  
//  var adminMasterHtml,adminHomeHtml;  // Main template HTML
//  tdata = {};  // JSON data object that feeds the template
//
//  // Bind a callback that executes when document.location.hash changes.
//  
//  // Initialise page
//  var initHomePage = function() {
//
//  // Load the HTML template
// var getHomeMasterHtml=  $.get("/home/backendMaster.html", function(d){
//    adminMasterHtml = d;
//        });
//  
// var getHomeHomeHtml= $.get("/home/backendHome.html", function(d){
//     adminHomeHtml = d;
//     
//                 
//        });
//  
//  // Retrieve the server data and then initialise the page
//  //$.getJSON("/albums.json", function (d) {
//  //         $.extend(tdata, d.data);
//  //        });
//  
//  // When AJAX calls are complete parse the template
//  // replacing mustache tags with vars
//  
//  $.when(getHomeMasterHtml,getHomeHomeHtml).then(function(){
//					  // var renderedPage = Mustache.to_html( tmpl, tdata );
//                     // alert('adminMasterHtml '+adminMasterHtml);
//                       //  alert('adminHomeHtml '+adminHomeHtml);
//                         
//        
//                       $("body").html(adminMasterHtml );
//                      $("#home_main_containter_selector").html(adminHomeHtml);
//					    //v_aligner();
//						randomString();
//                        onBackendHomeLogginSubmit();
//
//					         
//                                          
//                   
//							
//                       });
//  	  }();
//// end of load the page Hmml template and eventual Json data   and initialize page
//
//	//end of onBackendHomeLoginSubmit function
//  
//  function onBackendHomeLogginSubmit(){	
//		 
//	 							//alert("login submit handler");
//		
//			$("#backendHomeLoginSubmit").click(function(e) {
//
//                     gUserType = "admin";
//                     //gUserType = "corporate";
//                     //gUserType = "personal";
//                     //$.bbq.pushState('#/workspace/welcome');
//                     //$.getScript("/workspace/welcome/master.js");
//
//
//                $.bbq.pushState('#/workspace/welcome');
//                $.getScript("/workspace/welcome/master.js")
//
//                /*
//                 $.post("/home/login", {
//                 "username": $("#username").val(),
//                 "password": $("#password").val()
//
//                 }, function (paramReturndata) {
//
//                 if (paramReturndata.status) {
//                 //alert(paramReturndata.status);
//                 gUserType = paramReturndata.type;
//                 $.bbq.pushState('#/workspace/welcome');
//                 $.getScript("/workspace/welcome/master.js")
//                 }
//                 else {
//                 alert("Invalid user name or password !!");
//                 }
//
//                 }, "json");
//                */
//
//
//
//				 e.preventDefault();
//			 
//			  });//end of click event
//
//    	}
//
//	//end of onBackendHomeLoginSubmit function



//lbs.settings.views.defaultTemplate='/home/backendHome.html';


lbs.settings.views.interTemplate='/home/backendHome.html';
lbs.settings.views.masterTemplate='/home/backendMaster.html';