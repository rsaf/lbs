/**
 * responses client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('responses is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/responses'] = 
    lbs.routes['/workspace/responses/all'] =
    lbs.routes['/workspace/responses/conventional'] =
    lbs.routes['/workspace/responses/favorite'] =
    lbs.routes['/workspace/responses/agent'] =
    lbs.routes['/workspace/responses/delegated'] =
    lbs.routes['/workspace/responses/agentsettings'] =
        {mod: 'lbs.workspace.responses', location: '/workspace/responses/main.js'};
  
  lbs.routes['/workspace/responses:list'] = {mod:'lbs.workspace.responses.list',location:'/workspace/responses/main.js'};
 lbs.routes['/workspace/responses/details'] = {mod:'workspace.responses.details',location:'/workspace/responses/main.js'};


  lbs.modules['/workspace/responses'] = 
    lbs.modules['/workspace/responses/all'] =
    lbs.modules['/workspace/responses/conventional'] =
    lbs.modules['/workspace/responses/favorite'] =
    lbs.modules['/workspace/responses/agent'] =
    lbs.modules['/workspace/responses/delegated'] =
    lbs.modules['/workspace/responses/agentsettings'] = {
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.all = '/workspace/activities/responses.json';
      this.endPoints.conventional = this.basePath+'/conventional.json';
      this.endPoints.favorite = this.basePath+'/favorite.json';
      this.endPoints.agent = this.basePath+'/agent.json';
      this.endPoints.delegated = this.basePath+'/delegated.json';
      this.endPoints.agentsettings = this.basePath+'/agentsettings.json';
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/responses/all':{

          listEndPoint:this.endPoints.all
          ,currentPage:'所有响应'
        }
        ,'/workspace/responses/conventional':{
          listEndPoint:this.endPoints.conventional
          ,currentPage:'常规事务'
        }
        ,'/workspace/responses/favorite':{
          listEndPoint:this.endPoints.favorite
          ,currentPage:'收藏事务'
        }
        ,'/workspace/responses/agent':{
          listEndPoint:this.endPoints.agent
          ,currentPage:'代理事务'
        }
        ,'/workspace/responses/delegated':{
          listEndPoint:this.endPoints.delegated
          ,currentPage:'委托事务'
        }
        ,'/workspace/responses/agentsettings':{
          listEndPoint:this.endPoints.agentsettings
          ,listView: '/workspace/responses/agentsettings.html'
          ,currentPage:'代理设置'
        }
      };
      var me = this;
      lbs.workspace.responses = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/responses'
    ,deps:['/workspace']
    ,container:'#right_container'
    ,routeParams:null
    ,render : function render(arg){
      var data = {
        container : '.container_bottom'
      };
      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/responses:list'
        ,mainView:'/workspace/responses/main.html'
        ,data:data
      });
    }
    ,handlers:{}
  };

  lbs.modules['/workspace/responses:list'] = {
  view:''
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,index:0
  ,render : function render(arg){
    return lbs.basemodule['general:list'].render.call(this,arg);
  }
  ,rerender: function (arg) {
    var me =  this;
    arg =  arg||{};
    arg.listView = arg.listView || '/workspace/responses/list.html';
    arg.shortCreate=lbs.util.shorter('ct.cd',0,10);
    arg.shortClose=lbs.util.shorter('dp.ac.abd.acd',0,10);
    arg.getCode=function(){
      var index;
      if(this.rs){
        index = lbs.util.find({
          arr:lbs.settings.messages[lbs.settings.lang].responseStatus
          ,key:'val'
          ,val:this.rs.toString()
        });
        if(index!==-1){
          return lbs.settings.messages[lbs.settings.lang].responseStatus[index].text;
        }
      }
      return '';
    };
    arg.isPayed=function(){
      if(this.rs){
        if(this.rs<21){
          return false;
        }
      }
     return true;
    };

    return lbs.basemodule['general:list'].rerender.call(this, arg)
           .then(function(){
                 lbs.actionHandler({container:me.containerToSet,handlers:me.handlers});
    });
  }
  ,handlers:{}
  ,create : function(){
    var me = this;
    this.handlers['response:delete']=function(e){
      var me = this;
      lbs.basemodule["general:list"].deleteEntity({
        type:'响应'
//        ,code:'serviceCode'
        ,entityName:'response'//@todo: not sure if we can even delete this
        ,listMod:lbs.workspace.responses.list
        ,updateEndpoint:'/workspace/activities/archive/response/response.json'
        ,_id:e.target.getAttribute('data-id')
      });

    };

    this.handlers['response:list:details:view']=function(e){
        me.showResponseDetails(e);
    };

      lbs.workspace.responses.list = this;

    delete this.deps;
    delete this.create;
  }

  ,showResponseDetails: function showResponseDetails(e){
      var me = this;
      var code = e.target.getAttribute('data-code');
      console.log('response code  --- ',code);
        lbs.modHelper.getMod('/workspace/responses/details')
            .then(function(mod){
              console.log('response details modules---',mod);
              mod.render({code:code});

            })

    }

 ,removeItem:function removeItem(id){

        var me = this;

      console.log('this.list---', this.list);
      console.log('me.list---', me.list);

      var index = lbs.util.find({arr:this.list,val:id,key:'_id'});

      console.log('index------',index);

      if(index!==-1){
        this.list.splice(index,1);
        this.rerender({});
      }
    }
  ,deps:[]
};


lbs.modules['/workspace/responses/details'] = {
  container: '#platformAPIsModal'
  , handlers: {}
  , boundValues: []
  , parent: null
  , mainView:'/workspace/responses/responseDetails.html'
  , dbResponse:null
  , dbActivity:null
  , totalRecords: null
  , pageSize: 8
  , serviceLists:[]
  , bookedServices:[]
  , userResponse:{}
  , templateHelpers: {}
  ,putChanges: function putChanges(obj, key, root, path) {
    var o = {},
      i = -1,
      len = path.length - 1,
      current = o;
    var tmp;
    if(key==='pp'){
      tmp = {fd:{pt:{}}};
      tmp._id=this.dbResponse._id;
      if(obj.pp && obj.pp.pl){
        tmp.fd.pt[path[1]]={pp:{uri:'/photos/'+obj.pp.pl.uuid+'.'+obj.pp.pl.pfm.toLowerCase()}};
        return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
        json: JSON.stringify({
            pl: {
              response: tmp
            }
          })
        });
      }
      tmp.fd.pt[path[1]]={pp:{uri:obj.pp.photourl}};
      return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
      json: JSON.stringify({
          pl: {
            response: tmp
          }
        })
      });
    }
    if (root === this.userResponse) {
      o = {
        pl: {
          response: {
            fd: {
              fields: {}
            },
            _id: this.dbResponse._id
          }
        }
      };
      o.pl.response.fd.fields[key] = obj[key];
      return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
        json: JSON.stringify(o)
      });
    }
    while (++i < len) {
      o[path[i]] = {};
      current = o[path[i]];
    }
    current[path[i]] = obj[key];
    o._id = this.dbResponse._id;
    return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
      json: JSON.stringify({
        pl: {
          response: o
        }
      })
    });
  }
  , create: function () {
    var me = this;
    this.handlers['response:list:details:edit'] = function(e){
      me.editResponseDetails(e);
    }
    this.handlers['response:list:details:edit:done'] = function(e){
      me.editResponseDetailsDone(e);
    };
    lbs.workspace.responses.details = this;
    delete this.deps;
    delete this.create;
  }
  ,editResponseDetails: function editResponseDetails(e){
    var me = this;

    jQuery('.lanDynamicForm').find('input,select,textarea,button').prop('disabled','');
    jQuery('.editFormInfo').addClass('hide');
    jQuery('.editFormInfoDone').removeClass('hide');
   }
  ,editResponseDetailsDone: function editResponseDetailsDone(e){
    var me = this;
    jQuery('.lanDynamicForm').find('input,select,textarea,button').prop('disabled','true');
    jQuery('.editFormInfo').removeClass('hide');
    jQuery('.editFormInfoDone').addClass('hide');
  }
  ,setUserFieldsFromActivity: function setUserFieldsFromActivity() {
    var me = this;
    var fields = (me.dbActivity.fm && me.dbActivity.fm.fd && me.dbActivity.fm.fd.fields) || [];
    var i = fields.length;
    var htmlInputs, container = jQuery('.lanDynamicForm');
    while (--i > -1) {
      htmlInputs = container.find("[data-bind='entity.fields." + fields[i].nm + "']");
      if (htmlInputs.length) {
        if ((htmlInputs.prop('type') && (htmlInputs.prop('type').toLowerCase() === 'checkbox')) || htmlInputs.prop('multiple')) {
          me.userResponse.fields[fields[i].nm] = me.userResponse.fields[fields[i].nm] || [];
          if (fields[i].dv !== undefined) {
            me.userResponse.fields[fields[i].nm].push(fields[i].dv);
          }
        } else if (fields[i].dv !== undefined) {
          me.userResponse.fields[fields[i].nm] = fields[i].dv;
        }
      }
    }

  }
  ,render: function render(arg) {
    var code = arg.code
        , me = this;//resolve handler needs a reference to this
    return jQuery.when(
        lbs.modHelper.getMessage('/home/response.json', false, {}, 'GET', {code: code})//@todo: url should be from basemod.endPoints
    )
    .then(function (msg) {
      me.dbResponse = msg.pl;
      me.dbActivity = me.dbResponse.dp.ac;
          console.log('activities from response---',me.dbActivity);
      return jQuery.when(
          lbs.modHelper.getView(me.mainView),
          lbs.modHelper.getView(me.dbActivity.fm.fd.uri)
      );
    })
    .then(function (view,form) {
      var data = {},
          formContainer='.lanDynamicForm';
      data = me.dbResponse;//@todo: set values from me.dbResponse and me.dbActivity you need
      lbs.modHelper.setContainer({
        container: me.container
        , html: Mustache.render(
            view
            ,{data:data,activity:me.dbActivity,date:lbs.util.renderDate,status:me.renderStatus,renderServiceStatus:lbs.util.renderServiceStatus}
        )
      });
          var formFields = me.dbResponse&&me.dbResponse.fd&&me.dbResponse.fd.fields?me.dbResponse.fd.fields:null;
      lbs.modHelper.setContainer({
        container: formContainer
        , html: Mustache.render(form,{formFields:formFields,validationFileUrl:lbs.util.validationFileUrl,validationFileName:lbs.util.validationFileName})
      });
      jQuery(me.container).modal('show');
      if (!(me.dbResponse.fd && me.dbResponse.fd.fields)) { //see if response has user data
        me.userResponse = {fields:{}}; //no data, use default values in form meta of activity
        me.setUserFieldsFromActivity();
        me.putChanges( //save default values
          {
            "fields": me.userResponse.fields
          }, "fields", {
            fd: {
              "fields": me.userResponse.fields
            }
          }, ['fd', 'fields']
        );
      } else {
        me.userResponse = me.dbResponse.fd; //set form values to what user specified
      }
      if(me.dbResponse.fd && me.dbResponse.fd.pt){
        me.userResponse.pt = me.dbResponse.fd.pt;
      }
      me.boundValues = lbs.binder.bind('.lanDynamicForm', me.userResponse, 'entity', [
        function (obj, key, root, path) {
          me.putChanges(obj, key, root, path);
        }
      ]);
      lbs.binder.updateUI(me.boundValues);
      lbs.actionHandler({
         container: me.container
        ,handlers: me.handlers
      });
      lbs.basemodule.pageComplete();
    }).then(function(){
      jQuery('.lanDynamicForm').find('input,select,textarea,button').prop('disabled','true');
    });
  }

  ,renderStatus: function(){

    return function(text, render) {

        var index;
        index = lbs.util.find({
          arr:lbs.settings.messages[lbs.settings.lang].responseStatus
          ,key:'val'
          ,val:render(text)
        });

      console.log('index from mustache-----',index);

      if(index!=-1)
      {
        return lbs.settings.messages[lbs.settings.lang].responseStatus[index].text;
      }

    }

}
  , remove: function remove(arg) {
  }
  , deps: ['/workspace/responses:list']
};