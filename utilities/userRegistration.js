// JavaScript Document
var express = require("express")

var helpers = require('./helpers.js'),
  //  async = require('async'),
    fs = require('fs');

exports.version = "0.1.0";






   exports.registerUser= function (req,res,callback){
			
			//req.body.name +"  "+req.body.id
			userEmail = req.body.email;   
			
			loginName = req.body.loginName;     
			userPassword = req.body.password;
			userType = req.body.userType;
				
				
				
							
								
				var outputFilename = 'io_json/inputjson/usersData.json';
				
				
				var str_read_data= fs.readFileSync(outputFilename, 'utf8',  function(err,data) {
					if(err) {
					  console.log(err);
					} else {
					
				   
					  /*console.log("JSON saved to " + outputFilename);*/
					  console.log("JSON read to " + data);
				   
					}
				}); 
				
				
				   console.log("JSON read to " + str_read_data);
				var json_read_data=JSON.parse(str_read_data);
				// json_read_data.newuser = req.body;
                 
				 json_read_data.newuser.name = req.body.loginName;
                 
				 json_read_data.newuser.password = req.body.password;
                 
				 json_read_data.newuser.type = req.body.userType;
				 
					fs.writeFile(outputFilename, JSON.stringify(json_read_data, null, 4), function(err) {
					if(err) {
					  console.log(err);
					} else {
					
					  console.log("JSON saved to " + JSON.stringify(json_read_data));
					}
				});
				
										var returnJson = {"status":true,"type" : userType };
											
													res.writeHead(200,{"Content-Type":"application/json"})	;
													
													console.log("matching user :"+JSON.stringify(returnJson));
													res.end(JSON.stringify(returnJson));
		
			
		//res.redirect("/personal/home");
		
   }
				
				
				
				
		
		
		
		
	


   exports.getUserResetEmail= function (req, res){
			
		  
			user= req.body.userLoginName;//this can be either email or user name
				
				
				
				
				
				console.log("passsword resetting user "+user);
				
				var outputFilename = 'io_json/inputjson/usersData.json';
										
										/*read the users json file*/
										
										var userFile = fs.readFileSync(outputFilename, 'utf8',  function(err,data) {
									if(err) {
										  console.log(err);
										} else {
										
									   
										  /*console.log("JSON saved to " + outputFilename);*/
										  console.log("JSON read " + data);
									   
										}
									 }); 
											
				
				
							
			
				var json_read_data=JSON.parse(userFile);
					
									   for (var key in json_read_data)
									   	{
											 if ((json_read_data[key].name==user)||(json_read_data[key].email==user))
												{		
												var returnJson = {"status": "exist", 
												                   "email": json_read_data[key].email};
													res.writeHead(200,{"Content-Type":"application/json"})	;
													res.end(JSON.stringify(returnJson));
													console.log("matching user :"+JSON.stringify(returnJson));
														
												}
												
											}
											
									
   }
							
		
		
		
		







   exports.uerConfirmEmail= function (req, res){
			
		  
			confEmailClicked= req.body.userEmailClicked;//this can be either email or user name
			if(confEmailClicked){
				
							var returnJson = {"clicked": "true"};
													
							res.writeHead(200,{"Content-Type":"application/json"})	;
							res.end(JSON.stringify(returnJson));
				
				}
				
				
												
									
   }
					

			
		

   exports.saveNewPassword	= function (req, res){
			
		  
			var newPassword= req.body.userNewPassword;//this can be either email or user name
			//console.log("password from req.body "+newPassword);
			
			
				
				
				var outputFilename = 'io_json/inputjson/usersData.json';
										
										/*read the users json file*/
										
										var userFile = fs.readFileSync(outputFilename, 'utf8',  function(err,data) {
									if(err) {
										  console.log(err);
										} else {
										
									   
										  /*console.log("JSON saved to " + outputFilename);*/
										  console.log("JSON read " + data);
									   
										}
									 }); 
											
				
				
							
			
						var json_read_data=JSON.parse(userFile);
						json_read_data.newuser.password=newPassword;
						
						
						
		
							var savedPassword=json_read_data.newuser.password;
							//console.log("saved password "+savedPassword);
							
							
							
							
							
				/*write back to users json file*/
				fs.writeFile(outputFilename, JSON.stringify(json_read_data, null, 4), function(err) {
					if(err) {
					  console.log(err);
					} else {
					  console.log("JSON saved to " + outputFilename);
					}
				});
							
							
							
							
							
							
							
						
							var returnJson = {"savedPassword": savedPassword};
							var returnedValue= returnJson.savedPassword;
							console.log("returned value "+returnedValue);
							
							
													res.writeHead(200,{"Content-Type":"application/json"})	;
													res.end(JSON.stringify(returnJson));
													console.log("new user password :"+savedPassword);
														
											
									
   }
				
		
		
		
		
		
		
		
		
		
		
		
		
		
				
				
		
		
		


/*


   exports.userResetPassword= function (req,res,callback){
			
			//req.body.name +"  "+req.body.id
		  
			userNewPassword = req.body.password;
			userName = global.LANID.name;
			console.log("resetting password user name is: " + userName);
				
				
				
				
				
				
				
				var outputFilename = 'io_json/inputjson/usersData.json';
										
										//read the users json file
										
										var userFile = fs.readFileSync(outputFilename, 'utf8',  function(err,data) {
									if(err) {
										  console.log(err);
										} else {
										
									   
										  console.log("JSON read to " + data);
									   
										}
									 }); 
											
				
				
							
			
				var json_read_data=JSON.parse(str_read_data);
					
									   for (var key in json_read_data)
									   
									   
 							console.log("looping through user list to reset password ");
													{
													//console.log("the element name is "+json_read_data[key].name);
											 if (json_read_data[key].name==userName)
												{		
														
 														console.log("found match: updating password ");
														json_read_data[key].password ==userNewPassword;
														return;
												  
												}
												
											}

		
   }
							
*/				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
	