

var express = require('express');
var ws = express();
var logger = require('morgan');
var fs = require('fs');
var bodyParser = require("body-parser");
var Parser = require('parse5').Parser;
var Q = require('q');
var mongoose = require('mongoose');
var FormMetaSchema = null;
var FormMetaModel = null;
var ResponseSchema = null;
var ResponseModel = null;
var CounterSchema = null;
var Counter = null;
FormMetaSchema = require("./models/FormMeta.js")(mongoose);
FormMetaModel = mongoose.model('formmetas', FormMetaSchema);
CounterSchema = require("./models/Counter")(mongoose);
Counter = mongoose.model('counters', CounterSchema);
var transactionHelper = require('./transactionHelper.js').init({pl:{mongoose:mongoose}});//@todo: going to be a seporate dependency
//RespondentSchema = require("./models/Response.js")(mongoose);
//RespondentModel = mongoose.model('respondents', RespondentSchema);
mongoose.connect('mongodb://localhost/bmm');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  Q()
  .then(function(){ 
    var d = Q.defer();
    Counter.find({},function(err,data){
      if(err){
        d.reject(err);
      }
      if(data.length===0){
        Counter.create([
                    {_id:'formCode','seq':10000}
                    ,{_id:'businessActivityCode','seq':10000}
                  ],function(err){
                if(err){
                  d.reject(err);
                }
                d.resolve();
              });
        return;
    }
      d.resolve();
    });
    return d.promise;
  });
});


var urlencodedParser = bodyParser.urlencoded({extended: false})  // set parsing url encoded

// Web Server Settings
ws.set('port', process.env.PORT || 80);
ws.use(logger('dev'));





ws.get('/', function (req, res, next) {
  console.log('getting home');
  // var startPage = '../static/as.html';
  var startPage = '../static/index.html';
  //var startPage = '../static/os.html';
  fs.readFile(
          startPage,
          function (err, contents) {
            if (err) {
              send_failure(res, err);
              return;
            }
            contents = contents.toString('utf8');
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(contents);
          }
  );
});

ws.get('/activities.old', function (req, res) {
  var startPage = '../static/binddemo.html';
  fs.readFile(
          startPage,
          function (err, contents) {
            console.log(contents);
            if (err) {
              send_failure(res, err);
              return;
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(contents);
          }
  );
});
/* basic template for reading the html of saved form in the file system */
ws.post('/formpost', urlencodedParser, function (req, res) {
  var myobject = req.body;
  for (var attributename in myobject) {
    console.log(attributename + ": " + myobject[attributename]);
  }
  FormMetaModel.findOne({"uuid": "new.html"}, function (err, myDocument) {
    console.log(myDocument);
  });
})
/*end of basic templating */
//post is an insert, put is an update

ws.post('/workspace/activities.old/form.json', urlencodedParser, function (request, response) {
  _persistForm(request, response);
});
//post is an insert, put is an update
ws.put('/workspace/activities.old/form.json', urlencodedParser, function (request, response) {
  _persistForm(request, response);
});

ws.get('/workspace/activities.old/activity.json', urlencodedParser, function (request, response) {
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({pl:{abd:{ac:'LZA001'}}}));  
});
ws.put('/workspace/activities.old/activity.json', urlencodedParser, function (request, response) {
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({pl:{abd:{ac:'LZA001'}}}));  
});
ws.post('/workspace/activities.old/activity.json', urlencodedParser, function (request, response) {
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({pl:{abd:{ac:'LZA001'}}}));  
});


function _persistForm(paramRequest, paramResponse, paramNext){
    paramRequest.user={
      lanzheng:{
        loginName:'the user nick'
      }
      ,currentOrganization:'000000000000000000000008'
    }//is set by esb in production
    var m = {};
    //formHtml
    Q().then(function(){
      m.pl=JSON.parse(paramRequest.body.json);
      m.pl.loginName=paramRequest.user.lanzheng.loginName;
      m.pl.currentOrganization=paramRequest.user.currentOrganization;
      m.op='bmm_persistForm';
      //return esbMessage(m);//for esb
      return bmm_persistForm(m);//for ws.js
    }).then(function(msg){
      //oHelpers.sendResponse(paramResponse,200,msg);//in ESB
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify(msg));
    }).fail(function(er){
      //oHelpers.sendResponse(paramResponse,501,er);//in ESB
      paramResponse.writeHead(200, {"Content-Type": "application/json"});
      paramResponse.end(JSON.stringify({error: JSON.stringify(err)}));  
    });
}  

function setLastUpdated(arg){
  arg.entity.md = arg.entity.md || {};
  arg.entity.md.uID=arg.loginName;
  arg.entity.md.oID=arg.currentOrganization;//@todo:should be organisation
  arg.entity.md.lu=new Date();
}
function setCreated(arg){
  arg.entity.ct = arg.entity.ct || {};
  arg.entity.ct.uID=arg.loginName;
  arg.entity.ct.oID=arg.currentOrganization;//@todo:should be organisation
  arg.entity.ct.lu=new Date();
}
function getMember(o,keys){
  var i = -1, len = keys.length;
  while (++i < len) {
    o = o[keys[i]];
    if (o === undefined) {
      break;
    }
  }
  return o;
}
function _setFields(dbEntity,uiEntity,keys){
  var i=keys.length,val,objToSet,keyArray;
  while(--i>-1){
    keyArray=keys[i].split(".");
    val =  getMember(uiEntity,keyArray);
    if(val){
      objToSet=getMember(dbEntity,keyArray.slice(0,-1));
      objToSet[keyArray.slice(-1)]=val;
    }
  }
}

function _parseHtml(html) {
  var parse5 = require('parse5');
  var elem = [];
  var parser = new Parser();
  var getAttr = function getAttr(attr, name) {
    var i = attr.length;
    while (--i > -1) {
      if (attr[i].name === name) {
        return attr[i].value;
      }
    }
  }
  parser.parseFragment(html);

  parser = new parse5.SimpleApiParser({
    text: function (text) {
    },
    startTag: function (tagName, attrs, selfClosing) {
      var fd;
      var verify = getAttr(attrs, 'data-verification');
      var value = getAttr(attrs, 'value');
      var defaultval = getAttr(attrs, 'data-default');
      if (tagName && attrs && attrs.length && getAttr(attrs, 'data-bind')) {
        var fd = {
          "nm": getAttr(attrs, 'name') || getAttr(attrs, 'data-name')
          , "vl": value ? value : undefined
          , "nv": (verify && verify === 'true') ? true : false
          , "dvl": (defaultval || defaultval === '') ? defaultval : undefined
        };
        elem.push(fd);
      }
    }
  });
  parser.parse(html);
  return elem;

  if (update == true) {
    //mongoupdate(elem,filename,response,frmid);
  } else {
    //mongosave(elem,filename,response);
  }
  /* end of html parsing */
}
function _persistFormMeta(form,loginName,currentOrganization){
  var dbForm;
  return FormMetaModel.findOne({_id:form._id}).exec()
  .then(function(data){
    var code = false;
    if(!data){
      dbForm = new FormMetaModel();
      setCreated({entity:form,loginName:loginName,currentOrganization:currentOrganization})
    }else{
      dbForm=data;
    }
    setLastUpdated({entity:form,loginName:loginName,currentOrganization:currentOrganization})
    if(!dbForm.fc){
      code = transactionHelper.getNextSequence('formCode');
    }
    return Q.all(code);
  }).then(function(code){
    var d = Q.defer();
    if(code){
      form.fc='LZF'+code.seq;
    }
    var keys = Object.keys(FormMetaModel.schema.paths);
    _setFields(dbForm,form,keys);
    dbForm.save(function(error,data){
      if(error){
        d.reject(error);return;
      }
      d.resolve({pl:data});
    });
    return d.promise;
  });

}
function bmm_persistForm(m) {
    var r = {"pl": null, "er": null};
    return Q().then(function(){
//    return storageBucketManager('uploadform', (m.pl.form.fd.uuid)?m.pl.form.fd.uuid:null,'html', m.pl.html, null)//in ESB to save form
//Following is only used in ws.js
      var d = Q.defer();
      var uuid=(new Date().getTime()).toString();
      var fileName = "../static/forms/"+ uuid+ '.html';
      fs.writeFile(fileName, m.pl.html, function (err) {
        if (err){
          d.reject(err);return;
        }
        d.resolve({pl:{uuid:uuid}})
      });
      return d.promise;
//end of ws.js code
    })
    .then(function (r) {
      var form = m.pl.form;
      form.fd.uuid = r.pl.uuid;
      form.fd.uri = '/forms/' + r.pl.uuid + '.html';
      form.fd.fields = _parseHtml(m.pl.html);
      return _persistFormMeta(form,m.pl.loginName,m.pl.currentOrganization);
    }).fail(function (r) {
        return Q.reject(r);
    });
}



ws.use(express.static('../static'));
ws.post('*.json', dummyData);
ws.get('*.json', dummyData);

ws.get('*', four_oh_four);

ws.listen(ws.get('port'), function () {
  console.log(" Web Server Simulator Using Node.js Running on Port " + ws.get('port'));
});


//Helper functions
function four_oh_four(req, res) {
  res.writeHead(404, {"Content-Type": "application/json"});
  res.end(JSON.stringify(invalid_resource()) + "\n");
}

function send_failure(res, err) {
  var code = (err.code) ? err.code : err.name;
  res.writeHead(code, {"Content-Type": "application/json"});
  res.end(JSON.stringify({error: code, message: err.message}) + "\n");
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

function dummyData(paramRequest, paramResponse){
  var startPage = './fakeEndpoints' + paramRequest.url;
  fs.readFile(
          startPage,
          function (err, contents) {
            if (err) {
              send_failure(paramResponse, err);
              return;
            }
            contents = contents.toString('utf8');
            paramResponse.writeHead(200, {"Content-Type": "application/json"});
            paramResponse.end(contents);
          }
  );
}
