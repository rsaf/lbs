// JavaScript Document
var express = require("express")

var helpers = require('./helpers.js'),
  //  async = require('async'),
    fs = require('fs');

exports.version = "0.1.0";






exports.CheckUser= function(req, res, callback){
			
			
		
			
			
			
			userName = req.body.username ;      //req.body.name +"  "+req.body.id
			userPassword = req.body.password;
				systemCaptcha = req.body.antiBotValue;
				userCaptcha = req.body.user_captcha;
				
				
				
				console.log(userCaptcha+ " and "+systemCaptcha );
				
				
				
				if(userCaptcha==systemCaptcha ){
				
											
										var matched = false;
										var outputFilename = 'io_json/inputjson/usersData.json';
										
										/*read the users json file*/
										
										var userFile = fs.readFileSync(outputFilename, 'utf8',  function(err,data) {
									if(err) {
										  console.log(err);
										} else {
										
									   
										  /*console.log("JSON saved to " + outputFilename);*/
										  console.log("JSON read to " + data);
									   
										}
									 }); 
												/*convert to json object*/
											var json_read_data=JSON.parse(userFile);
												
												
										
											
									   for (var key in json_read_data)/*(function(person) */
													{
													/*console.log("the element name is "+json_read_data[key].name);*/
											 if ((json_read_data[key].name==userName)&&(json_read_data[key].password==userPassword))
												{
										
												console.log("user info checked!");
												
												//res.send("user found! " + "the user type is :"+userArray[person].type); 
												var userType = json_read_data[key].type;
												var userID = json_read_data[key].id;
												matched = true;
												
												
												
												// loop through corporate or personal user array to fetch the corresponding id
											
												getUserId(userID ,userType,res);
											}
												
										}
											
									if(!matched)
										{
											var returnJson = {"status": false};
											res.writeHead(200,{"Content-Type":"application/json"})	;
											res.end(JSON.stringify(returnJson));
											console.log("Hello admin :"+JSON.stringify(returnJson));
											console.log("user not found!");
									
										}
														
								
						
				}
			else{
		
		
				//res.redirect("/");
				//res.end();
				
					var returnJson = {"status": false};
									res.writeHead(200,{"Content-Type":"application/json"})	;
									res.end(JSON.stringify(returnJson));
									console.log("Hello admin :"+JSON.stringify(returnJson));
									console.log("user not found!");
					
					console.log("oops :"+JSON.stringify(returnJson));
														

			
			}
}
	

exports.CheckAdminUser= function(req, res, callback){
			
			
		
			
			
			
			userName = req.body.username ;      //req.body.name +"  "+req.body.id
			userPassword = req.body.password;
				validationCode = req.body.validationCode;
				
				
				
				
				if(validationCode==="0000" ){
					
									
									
									
											
										var matched = false;
										var outputFilename = 'io_json/inputjson/usersData.json';
										
										/*read the users json file*/
										
										var userFile = fs.readFileSync(outputFilename, 'utf8',  function(err,data) {
									if(err) {
										  console.log(err);
										} else {
										
									   
										  /*console.log("JSON saved to " + outputFilename);*/
										  console.log("JSON read to " + data);
									   
										}
									 }); 
												/*convert to json object*/
											var json_read_data=JSON.parse(userFile);
												
												
										
											
									   for (var key in json_read_data)/*(function(person) */
													{
													/*console.log("the element name is "+json_read_data[key].name);*/
											 if ((json_read_data[key].name==userName)&&(json_read_data[key].password==userPassword))
												{
										
												console.log("user info checked!");
												matched = true;
												
												var returnJson = {"status": "registered", 
												       "type": "admin"};
													res.writeHead(200,{"Content-Type":"application/json"})	;
													res.end(JSON.stringify(returnJson));
													console.log("Hello admin :"+JSON.stringify(returnJson));
								
												
												
											  
												}
												
											}
											
									if(!matched)
										{
											
											
											var returnJson = {"status": "invalid username or password!"};
											res.writeHead(200,{"Content-Type":"application/json"})	;
											res.end(JSON.stringify(returnJson));
											console.log("Hello admin :"+JSON.stringify(returnJson));
											console.log("user not found!");
									
										}
														
								
						
				}
			else{
					var returnJson = {"status": "wrong validation code!"};
												res.writeHead(200,{"Content-Type":"application/json"})	;
												res.end(JSON.stringify(returnJson));
												console.log("Hello admin :"+JSON.stringify(returnJson));
												console.log("user not found!");
					
					console.log("oops :"+JSON.stringify(returnJson));
														
				
				
			}
}
	
	
	
	
	function getUserId(id_number,user_type,res){
	
		console.log(user_type + " , form getuserId function");
		
							if(user_type == "personal")
								{ 	
									//res.redirect("/personal/home");
									var returnJson = {"status": true, 
												       "type": "personal"};
													res.writeHead(200,{"Content-Type":"application/json"})	;
													res.end(JSON.stringify(returnJson));
													console.log("matching user :"+JSON.stringify(returnJson));
								}
								
								else if(user_type == "corporate")
								{
									//	res.redirect("/corporate/home");
									var returnJson = {"status": true, 
												       "type": "corporate"};
													res.writeHead(200,{"Content-Type":"application/json"})	;
													res.end(JSON.stringify(returnJson));
													console.log("matching user :"+JSON.stringify(returnJson));
								
						
								}
								else if(user_type == "servicepoint")
								{
									//	res.redirect("/corporate/home");
									var returnJson = {"status":true, 
												       "type": "servicepoint"};
													res.writeHead(200,{"Content-Type":"application/json"})	;
													res.end(JSON.stringify(returnJson));
													console.log("matching user :"+JSON.stringify(returnJson));
								
						
								}
 }		
		

 
 
 
 

 
 
 
 
 /*notes*/
 
 /*node doesn't send the response data if the response header code is not 200
 	if the res response header is 404 you can see it on the browser's console
 
 
 */
 
