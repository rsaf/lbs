/**
 * olm client module
 * 
 * written by Leo and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('operational logs is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};
  lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/operationslog'] = 
    lbs.routes['/workspace/operationslog/all'] =
    lbs.routes['/workspace/operationslog/business'] =
    lbs.routes['/workspace/operationslog/access'] =
        {mod: 'lbs.workspace.operationslog', location: '/workspace/operationslog/main.js'};
  
  lbs.routes['/workspace/operationslog:list'] = {mod:'lbs.workspace.operationslogs.list',location:'/workspace/operationslog/main.js'};

  lbs.modules['/workspace/operationslog'] = 
    lbs.modules['/workspace/operationslog/all'] = 
    lbs.modules['/workspace/operationslog/business'] = 
    lbs.modules['/workspace/operationslog/access'] = {
      create: function () {
        this.parent = lbs.workspace;
        this.endPoints = {};
        this.endPoints.all = this.basePath + '/all.json';
        this.endPoints.business = this.basePath + '/business.json';
        this.endPoints.access = this.basePath + '/access.json';
        this.routeParams = {
          '/workspace/operationslog/all': {
            listEndPoint: this.endPoints.all
            ,currentPage: '所有操作'
          }
          ,'/workspace/operationslog/business': {

            listEndPoint: this.endPoints.business
            ,currentPage: '业务操作'
          }
          ,'/workspace/operationslog/access': {

            listEndPoint: this.endPoints.access
            ,currentPage: '授权操作'
          }
        };

        lbs.workspace.operationslog = this;
        delete this.deps;
        delete this.create;
      }
      , basePath: '/workspace/operationslog'
      , deps: ['/workspace']
      , container: '#right_container'
      , routeParams: null
      //,render : function render(arg){
      //  var arg = arg || {};
      //  var d = arg.defer || jQuery.Deferred();
      //  var me = this;
      //  var route = jQuery.param.fragment();
      //  route = (!this.routeParams[route])?'/workspace/operationslog/all':route;//default to all
      //  this.parent.render(arg)
      //  .then(function(){
      //    //load child (list module) and view for this module
      //    return jQuery.when(
      //      lbs.modHelper.getMod('/workspace/operationslog:list')
      //      ,lbs.modHelper.getView(me.routeParams[route].view)
      //    );
      //  })
      //  .then(function(listMod,view){
      //    //no data to bind so we can continue
      //    lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
      //    //registration handlers now, we rendered template and set innerhtml
      //    lbs.actionHandler({
      //      container:me.container
      //      ,handlers:me.handlers
      //    });
      //    //render the list
      //    return listMod.render({
      //      container:me.routeParams[route].listContainer
      //      ,viewUrl:me.routeParams[route].listView
      //      ,listEndPoint:me.routeParams[route].listEndPoint
      //    });
      //  }).then(function(res){
      //    d.resolve();
      //  });
      //  return d.promise();
      //}
      ,render: function render(arg) {
        var data = {
          container: '.container_bottom'
          ,dumpData: function dumpData() {
            console.log('data passed to mustache-----', this);
          }
        };
        return lbs.basemodule['general:list'].parentRender.call(this, {
          listMod: '/workspace/operationslog:list'
          , mainView: '/workspace/operationslog/main.html'
          , data: data
        });
      }
  }

  lbs.modules['/workspace/operationslog:list'] = {
  view:''
  ,list:[]
  ,pageSize: 10
  ,meta:null
  ,index: 0
  ,container:'.container_bottom'
  //,render : function render(arg){
  //  //this is a child module, the parent HAS to specify a container for it to render.
  //  arg = arg || {};
  //  this.containerToSet = arg.container;
  //  //default settins for the template
  //  arg.showEdit = (typeof arg.showEdit==='undefined')?true:arg.showEdit;
  //  arg.colums = arg.colums || 'col-5-table';
  //  this.viewUrl = arg.viewUrl;
  //  //not a directy routable module (can't render this when you use the url in the browser)
  //  //  so no need to store and call parent.render
  //  var d = arg.defer || jQuery.Deferred();
  //  //get the template for this one and bind it
  //  //need to get the myservicePointslist module at the same time;
  //  var me = this;//then after resolve needs a reference to this
  //  jQuery.when(
  //      lbs.modHelper.getView(this.viewUrl)
  //      ,lbs.modHelper.getMessage(arg.listEndPoint,false,{})
  //  )
  //  .then(function(view,msg){
  //    me.list=msg.pl;
  //    lbs.modHelper.setContainer({
  //      mod:me
  //      ,html:Mustache.render(view,{
  //        logs:me.list
  //        ,limitLength : function() {
  //          return function(text, render) {
  //            return render(text).substr(0,10);
  //          }
  //        }
  //        ,conditions:arg.conditions
  //      })
  //      ,container:me.containerToSet});
  //    d.resolve();
  //  });
  //  return d.promise();
  //}

  ,create : function(){

      var me = this;

      this.handlers['operation:show:details'] = function(e){

        e.preventDefault();
        me.showOperationsDetails(e);
      }

    lbs.workspace.operationslog.list = this;
    delete this.deps;
    delete this.create;
  }


    ,render: function render(arg) {
      var me = this;
      arg.listView = arg.listView || '/workspace/operationslog/list.html'
      return lbs.basemodule['general:list'].render.call(this, arg);
    }
    ,rerender: function (arg){
      var me =  this;

      arg = arg||{};

      return lbs.basemodule['general:list'].rerender.call(this, arg)
          .then(function(){
            lbs.actionHandler({container:me.containerToSet,handlers:me.handlers});
          });
    }

    ,showOperationsDetails:function showOperationsDetails(e){
      var me = this;

      var id = e.target.getAttribute('data-id');

      var arr = this.list;

      var index = lbs.util.find({arr:arr,key:'_id',val:id});


      if(index>-1) {

        var targetLog =  arr[index];




        lbs.modHelper.getView('/workspace/operationslog/detailmodal.html').then(function (view) {

          lbs.modHelper.setContainer({
            container: '#platformAPIsModal'
            , html: Mustache.render(view,targetLog)
          });

          $('#platformAPIsModal').modal().off('hide.bs.modal.showLogDetails');


        });



      }

    }
    ,handlers:{}
  ,deps:['/workspace/operationslog']
};

