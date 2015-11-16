/**
 * interfaces client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('interfaces is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/interfaces'] = 
    lbs.routes['/workspace/interfaces/systemInterfaces'] =
    lbs.routes['/workspace/interfaces/thirdPartyInterfaces'] =
    lbs.routes['/workspace/interfaces/interfaceUsers'] =
        {mod: 'lbs.workspace.interfaces', location: '/workspace/interfaces/main.js'};
  
  lbs.routes['/workspace/interfaces:list'] = {mod:'lbs.workspace.interfaces.list',location:'/workspace/interfaces/main.js'};

  lbs.modules['/workspace/interfaces'] = 
    lbs.modules['/workspace/interfaces/systemInterfaces'] =
    lbs.modules['/workspace/interfaces/thirdPartyInterfaces'] =
    lbs.modules['/workspace/interfaces/interfaceUsers'] = {
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.systeminterfaces = this.basePath+'/systeminterfaces.json';
      this.endPoints.thirdpartyinterfaces = this.basePath+'/thirdpartyinterfaces.json';
      this.endPoints.interfaceUsers = this.basePath+'/interfaceUsers.json';
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/interfaces/systemInterfaces':{
          listEndPoint:this.endPoints.systeminterfaces
          ,listView:'/workspace/interfaces/systemInterfaces.html'
          ,currentPage:'蓝证提供'
        }
        ,'/workspace/interfaces/thirdPartyInterfaces':{
          listEndPoint:this.endPoints.thirdpartyinterfaces
          ,listView:'/workspace/interfaces/thirdPartyInterfaces.html'
          ,currentPage:'外商提供'
        }
        ,'/workspace/interfaces/interfaceUsers':{
          listEndPoint:this.endPoints.interfaceUsers
          ,listView:'/workspace/interfaces/interfaceUsers.html'
          ,currentPage:'接口用户'
          ,usePageinator:false
        }
      };
      var me = this;
      lbs.workspace.interfaces = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/interfaces'
    ,deps:['/workspace']
    ,container:'#right_container'
    ,routeParams:null
    ,render : function render(arg){
      var data = {
        statusClass : lbs.modHelper.isVal({
          key : function(){
            //this.no = (this.obj.field3)?'greenStatus':'redStatus';
              this.no = true?'greenStatus':'redStatus';
              //alert(this.obj.toString());
              //alert(this.field1);
            this.obj=false;
            return 'colorkey';
          }
          ,val : 2,
          yes:'yes'
        })
        ,container : '.container_bottom'
      }
      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/interfaces:list'
        ,mainView:'/workspace/interfaces/main.html'
        ,data:data
      });
    }
    ,handlers:{}
  };


  lbs.modules['/workspace/interfaces:list'] = {
  view:''
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,index:0
  ,render : function render(arg){
    arg.viewUrl = arg.viewUrl || '/workspace/interfaces/list.html'
    return lbs.basemodule['general:list'].render.call(this,arg);
  }
  , rerender: function (arg) {
    var me =  this;
    return lbs.basemodule['general:list'].rerender.call(this, arg)
    .then(function(){
      lbs.actionHandler({container:me.containerToSet,handlers:me.handlers});
    });
  }
  ,handlers:{}
  ,create : function(){
    var me = this;
    this.handlers['interface:delete']=function(e){
      lbs.basemodule["general:list"].deleteEntity({
        type:'通知'
//        ,code:'serviceCode'
        ,entityName:''//@todo: no endpoint for interface to delete
        ,listMod:me
        ,updateEndpoint:lbs.workspace.notifications.endPoints.notification
        ,_id:e.target.getAttribute('data-id')
      });
    };
    lbs.workspace.interfaces.list = this;
    delete this.deps;
    delete this.create;
  }
  ,deps:[]
};