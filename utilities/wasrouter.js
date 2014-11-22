
var helpers = require('./helpers.js'),
     oOLM = require('olm'),
      fs = require('fs');

exports.version = "0.1.0";

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
