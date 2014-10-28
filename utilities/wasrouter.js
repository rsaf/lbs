
var helpers = require('./helpers.js'),
     oOLM = require('olm'),
      fs = require('fs');

exports.version = "0.1.0";

exports.generate = function (req, res,runfancy) {

    // use to the generate the css and js path 
    var pathLevel1 = req.params.pathLevel1
	 var pathLevel2 = req.params.pathLevel2;
	 var pathLevel3 = req.params.pathLevel3;
	 
	 
	 console.log("pathLevels: "+ pathLevel1+ " "+ pathLevel2+" "+pathLevel3+"\n");

    fs.readFile(
        'index.html',
        function (err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }

            contents = contents.toString('utf8');
			
		
		 if(pathLevel1&&pathLevel2&&pathLevel3){
		var varJSPATH =  "/"+ pathLevel1 +"/"+ pathLevel2+"/" +pathLevel3+ ".js";
		}
			
		else if(pathLevel1&&pathLevel2){
		var varJSPATH =  "/"+ pathLevel1 +"/"+ pathLevel2 + ".js";
		}
			
		
			
			console.log("bootstrapper Path: "+ varJSPATH);
            
              
			  
			  
			 /* var varJSPATH =  "/personal/personal.js";*/
			  
            contents = contents.replace('{{JS_PATH}}', varJSPATH);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    );
};

//generateHome
exports.generateHome = function (req, res) {

    fs.readFile(
        'index.html',
        function (err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }
			 contents = contents.toString('utf8');
			   
            contents = contents.replace('{{JS_PATH}}', "/home/home.js");
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    );
};

//generate backEndHome
exports.generateBackendHome = function (req, res) {

    fs.readFile(
        'index.html',
        function (err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }
			 contents = contents.toString('utf8');
			   
            contents = contents.replace('{{JS_PATH}}', "/admin/home.js");
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    );
};

//get operationslog
exports.getOperationsLogAll = function(req, res) {
    var paramUserAccountID = req.user.id;
    //console.log(paramUserAccountID);
    oOLM.readOperationsLogs(paramUserAccountID, null, 1, 10, function(paramError, paramLogsJson) {
        //function(paramUserAccountID,paramOpType, paramPageNumber, paramPageSize, paramCallback)
        if (paramLogsJson)
        {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(paramLogsJson));
            //console.log(paramLogsJson);
        }
        else if (paramError)
        {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end("No results");
            //console.log("No results");
        }
    });
};

//get operationslog
exports.getOperationsLogBusiness = function(req, res) {
    var paramUserAccountID = req.user.id;
    //console.log(paramUserAccountID);
    oOLM.readOperationsLogs(paramUserAccountID, '业务操作', 1, 10, function(paramError, paramLogsJson) {
        //function(paramUserAccountID,paramOpType, paramPageNumber, paramPageSize, paramCallback)
        if (paramLogsJson)
        {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(paramLogsJson));
            //console.log(paramLogsJson);
        }
        else if (paramError)
        {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end("No results");
            //console.log("No results");
        }
    });
};

//get operationslog
exports.getOperationsLogAccess = function(req, res) {
    var paramUserAccountID = req.user.id;
    //console.log(paramUserAccountID);
    oOLM.readOperationsLogs(paramUserAccountID, '授权操作', 1, 10, function(paramError, paramLogsJson) {
        //function(paramUserAccountID,paramOpType, paramPageNumber, paramPageSize, paramCallback)
        if (paramLogsJson)
        {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(paramLogsJson));
            //console.log(paramLogsJson);
        }
        else if (paramError)
        {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end("No results");
            //console.log("No results");
        }
    });
};
