

var express = require('express');
var ws = express();
var fs = require('fs');


// Web Server Settings
ws.set('port', process.env.PORT || 80);

ws.get('/', function (req, res, next) {
console.log('getting home');
    //var startPage = '../static/as.default.html';
    var startPage = '../static/index.html';
   //var startPage = '../static/os.default.html';
    fs.readFile(
        startPage,
        function (err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }
       contents = contents.toString('utf8');
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    );
}
);

ws.use(express.static('../static'));
ws.post('*.json',dummyData );
ws.get('*.json',dummyData );

ws.get('*', four_oh_four);

ws.listen(ws.get('port'), function(){
  console.log(" Web Server Simulator Using Node.js Running on Port "  + ws.get('port'));
});


//Helper functions
function four_oh_four(req, res) {
    res.writeHead(404, { "Content-Type" : "application/json" });
    res.end(JSON.stringify(invalid_resource()) + "\n");
}

function send_failure(res, err) {
    var code = (err.code) ? err.code : err.name;
    res.writeHead(code, { "Content-Type" : "application/json" });
    res.end(JSON.stringify({ error: code, message: err.message }) + "\n");
}


function invalid_resource() {
    return make_error("invalid_resource",
                              "the requested resource does not exist.");
}

function make_error(err, msg) {
    var e = new Error(msg);
    e.code = err;
    return e;
}

function dummyData(paramRequest, paramResponse)
{
    var startPage = './fakeEndpoints'+paramRequest.url;

    console.log(startPage);

    fs.readFile(
        startPage,
        function (err, contents) {
            if (err) {
                send_failure(res, err);
                return;
            }
       contents = contents.toString('utf8');
            paramResponse.writeHead(200, { "Content-Type": "application/json" });
            paramResponse.end(contents);
        }
    );
}