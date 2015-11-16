/**
 * activities client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('activities is loaded...');
  //registration routers/modules of smm if not already registered
lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
lbs.routes['/workspace/services'] = {mod: 'lbs.workspace.services', location: '/workspace/services/main.js'};
lbs.routes['/workspace/services/myserviceslist'] = {mod:'lbs.workspace.services.myserviceslist',location:'/workspace/services/main.js'};
lbs.routes['/workspace/services/myservicesnew'] = {mod:'lbs.workspace.services.myservicesnew',location:'/workspace/services/main.js'};
lbs.routes['/workspace/services/myservicesviewedit'] = {mod:'lbs.workspace.services.myservicesviewedit',location:'/workspace/services/main.js'};

  lbs.routes['/workspace/activities'] =
    lbs.routes['/workspace/activities/activitieslist'] =
    lbs.routes['/workspace/activities/nameslist'] =
    lbs.routes['/workspace/activities/activitiesforms'] =
    lbs.routes['/workspace/activities/publicforms'] =
    lbs.routes['/workspace/activities/serviceslist'] =
        {mod: 'lbs.workspace.activities', location: '/workspace/activities/main.js'};
  
lbs.routes['/workspace/activities:list'] = {mod:'lbs.workspace.activities.list',location:'/workspace/activities/main.js'};
lbs.routes['/workspace/activities/form:Details'] = {mod:'lbs.workspace.activities.form:Details',location:'/workspace/activities/main.js'};

lbs.modules['/workspace/activities'] =
    lbs.modules['/workspace/activities/activitieslist'] = 
    lbs.modules['/workspace/activities/nameslist'] =
    lbs.modules['/workspace/activities/activitiesforms'] =
    lbs.modules['/workspace/activities/publicforms'] =
    lbs.modules['/workspace/activities/serviceslist'] = {
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.activitieslist = this.basePath+'/activities.json';
      this.endPoints.activity = this.basePath+'/activity.json';
      this.endPoints.nameslist = this.basePath+'/nameslist.json';
      this.endPoints.activitiesforms = this.basePath+'/responses/forms.json';
      this.endPoints.publicforms = this.basePath+'/publicforms.json';
      this.endPoints.serviceslist = '/workspace/services/services.json';
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/activities/activitieslist':{
          listEndPoint:this.endPoints.activitieslist
          ,listView:'/workspace/activities/activitieslist.html'
          ,currentPage:'事务列表'
          ,showCreate:true
        }
        ,'/workspace/activities/nameslist':{
          listEndPoint:this.endPoints.nameslist
          ,listView:'/workspace/activities/nameslist.html'
          ,currentPage:'事务名单'
        }
        ,'/workspace/activities/activitiesforms':{
          listEndPoint:this.endPoints.activitiesforms
          ,listView:'/workspace/activities/activitiesforms.html'
          ,currentPage:'事务表单'
        }
        ,'/workspace/activities/publicforms':{
          listEndPoint:this.endPoints.publicforms
          ,listView:'/workspace/activities/publicforms.html'
          ,currentPage:'公共表单'
        }
        ,'/workspace/activities/serviceslist':{
          listEndPoint:this.endPoints.serviceslist
          ,listView:'/workspace/activities/serviceslist.html'
          ,currentPage:'服务列表'
          ,query:{which:'all'}
          ,showCreate:false
        }
      };
      var me = this;
      this.handlers['activities:createNew']=function(e){
        me.createNew(e);
      }
      lbs.workspace.activities = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/activities'
    ,deps:['/workspace','/global:modal']
    ,container:'#right_container'
    ,routeParams:null
    ,render : function render(arg){


      
      var data = {
        container : '.container_bottom'
        ,date:lbs.util.renderDate
        ,params:{
           page:0,
           pageSize:10
        }
      };
      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/activities:list'
        ,mainView:'/workspace/activities/main.html'
        ,data:data

      });
    }
    ,handlers:{}
    ,createNew : function createNew(e){
      var me = this;
      lbs.modHelper.getMod('/global:modal')
      .then(function(modalMod){
        modalMod.render({
          createdBy:me
          ,container:''
          ,view:''
          ,templateData:{}
        });
      });
    }
  };
  lbs.modules['/workspace/activities:list'] = {
  view:''
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,index:0
  ,itemCode:null
  ,container:'.container_bottom'
  ,render : function render(arg){

    return lbs.basemodule['general:list'].render.call(this,arg);
  }
  ,rerender : function rerender(arg){
    var me = this;
    arg = arg || {};
    arg.shortStart=lbs.util.shorter('abd.asd',0,10);
    arg.shortEnd=lbs.util.shorter('abd.acd',0,10);
    arg.statusText=function(){
      var index;
      if(this.abd&&this.abd.aps){
        index = lbs.util.find({
          arr:lbs.settings.messages[lbs.settings.lang].publishingStatus
          ,key:'val'
          ,val:this.abd.aps.toString()
        });
        console.log('index is:',index)
        if(index!==-1){
          return lbs.settings.messages[lbs.settings.lang].publishingStatus[index].text;
        }
      }
    };

    var route = $.param.fragment()
    var delim = '/';
    var routeUrl = route.split(delim).slice(0,3);
    var module = routeUrl.join(delim);

    arg.listView = lbs.modules[module].routeParams[route].listView || '/workspace/activities/activitieslist.html';

    return lbs.basemodule['general:list'].rerender.call(this, arg).then(function(){
      lbs.actionHandler({container:me.containerToSet,handlers:me.handlers});

    });
  }
  ,removeItem:function removeItem(id){
    var index = lbs.util.find({arr:this.list,val:id,key:'_id'});
    if(index!==-1){
      this.list.splice(index,1);
      this.rerender();
    }
  }
  ,create : function(){
    var me = this;

    this.handlers['activity:form:details:show'] = function(e){
          me.showFormDetails(e);
    }
    this.handlers['activities:report:download']=function(e){

      console.log('downloadging------');
      var code= e.target.getAttribute('data-id')
      me.downloadActivityReport({e:e,code:code});
    }
    this.handlers['activities:process']=function(e){
        console.log("processing-------");
        var code = e.target.getAttribute('data-id');
        me.processAllResponses({e:e,code:code});
    }
    this.handlers['activities:delete']=function(e){


      lbs.basemodule["general:list"].deleteEntity({
        type:'事务'
        ,code:'abd.ac'
        ,entityName:'activity'
        ,listMod:me
        ,updateEndpoint:lbs.workspace.activities.endPoints.activity//@todo:needs different endpoints
        ,_id:e.target.getAttribute('data-id')
      });
    };

    this.handlers['service:detail']=function(e){

        lbs.modHelper.getMod('/workspace/services').then(function(){
            //'/workspace/services' mod created
            lbs.modHelper.getMod('/workspace/services/myserviceslist').then(function(serviceListMod){
                ///workspace/services/myserviceslist' mod created
                serviceListMod.openDetail(e,{hideEditBtn:true});
            });

        });
    }


          this.handlers['activity:response:sort:done'] = function(e){
        me.getResponseBySortValue(e);
    }

    lbs.workspace.activities.list = this;
    delete this.deps;
    delete this.create;
  }


  ,showFormDetails:function showFormDetails(e){
        var me = this;
        console.log('-----form details-----');

        var code = e.target.getAttribute('data-code');
        console.log('form code  --- ',code);
        lbs.modHelper.getMod('/workspace/activities/form:Details')
            .then(function(mod){
              console.log('form details modules---',mod);
              mod.render({code:code});

            })
      }

  ,getResponseBySortValue:function getResponseBySortValue(e){
      var me = this;



    var name = $('#activityResponseSortingForm').serializeObject().sorting;

      console.log('name-----',name);

      lbs.modHelper.getView('/workspace/documents/spinningStransitionPage.html').then(function (view) {

        lbs.modHelper.setContainer({
          container: '#platformAPIsModal'
          , html: Mustache.render(view)
        });


      });

      lbs.modHelper.getMessage('/workspace/activities/activityResponseDownload/'+name+'/'+me.itemCode+'.json', false, {}, 'GET')
        .then(function(response) {
          if (response && response.pl && response.pl.pl && response.pl.pl.zipfile) {
            console.info("Downloading file from : ", response);
            window.location = response.pl.pl.zipfile;
          } else {
            console.error("No ZIP file available for download - there are likely no responses available.",response && response.pl && response.pl.er?"Err:"+response.pl.er.em:"");
          }

              $('#platformAPIsModal').modal('hide');
              lbs.modHelper.setContainer({
                  container: '#platformAPIsModal'
                  , html: ''
              });
        });




    }
  ,processAllResponses:function processAllResponses(e){
      me = this;
      me.itemCode = e.code;
          lbs.modHelper.getView('/workspace/documents/processprogressbar.html')
              .then(function (view) {
                  //Progress bar stuff
                  var processing = true;
                  var lastProcessAsk = Date.now()
                  var antiThrashConstant = 1000//ms
                  var progress = function(){
                      $.when(lbs.modHelper.getMessage('/workspace/activities/getProcessProgress/'+me.itemCode+'.json',false,{},'GET'))
                          .then(function(response){
                              var toDisplay = response.pl.ttl > 0 ? response.pl.cnt+"/"+response.pl.ttl : "";
                              var now = Date.now();
                              $('em.progressCountDown').text(toDisplay)
                              if(response.pl.cnt <= response.pl.ttl && processing && now - lastProcessAsk > antiThrashConstant) {
                                  progress()
                                  lastProcessAsk = now;
                              }
                              else if((response.pl.cnt < response.pl.ttl || response.pl.ttl == 0) && processing)
                                setTimeout(progress,antiThrashConstant - (now - lastProcessAsk))
                          })
                  }
                  progress();

                  lbs.modHelper.setContainer({
                      container: '#platformAPIsModal'
                      , html: Mustache.render(view)
                  });

                  $('#platformAPIsModal').modal()//.off('hide.bs.modal.submitDocument');

                  //Start to process responses
                  $.when(lbs.modHelper.getMessage('/workspace/activities/processAllResponses/'+me.itemCode+'.json',false,{},'POST'))
                      .then(function(response,view){
                          processing = false
                            $('#platformAPIsModal').modal('hide')
                            lbs.modHelper.setContainer({container:'#platformAPIsModal',html:''});
                      }  ,  function(err){
                          console.log("Error processing",err);
                          processing = false;
                      })
              });
  }
  ,downloadActivityReport: function downloadActivityReport(e){
    var me = this;

    console.log('dowloading-----',e.code);

      me.itemCode = e.code;


    console.log('/workspace/activities/activityResponseDownload/'+me.itemCode+'.json')
           // lbs.modHelper.getView('/workspace/documents/spinningStransitionPage.html')


      $.when(lbs.modHelper.getMessage('/workspace/activities/activityResponseDownload/'+me.itemCode+'.json', false, {}, 'GET'),
          lbs.modHelper.getView('/workspace/activities/downloadResponse.html')
                ).then(function (response,view) {

             var data = response.pl||null;

            console.log('data0------',data);

                    lbs.modHelper.setContainer({
                        container: '#platformAPIsModal'
                        , html: Mustache.render(view,{data:data})
                    });

                    $('#platformAPIsModal').modal().off('hide.bs.modal.submitDocument');

                    lbs.actionHandler({container:'#platformAPIsModal', handlers:me.handlers});

                });

  }
  ,handlers:{}
  ,deps:[]
};


lbs.modules['/workspace/activities/form:Details'] = {

    container: '#platformAPIsModal'
  , parent: null
  , mainView:'/workspace/activities/formDetails.html'
  ,render : function render(arg){

    var me = this;

    var code = arg.code;

    return jQuery.when(
        lbs.modHelper.getView(me.mainView)
    ).then(function (view) {


          var index = lbs.util.find({'arr':lbs.workspace.activities.list.list,'key':'_id','val':code});

          console.log('index---',index);


          lbs.modHelper.setContainer({
            container: me.container
            ,html: Mustache.render(view)

          });


          if(index!=-1){
            var formView = lbs.workspace.activities.list.list[index].fd.uri;

           return lbs.modHelper.getView(formView)
          }


        }).then(function(form){

          var formContainer='.activityFormDetailsContainer';

          lbs.modHelper.setContainer({
            container: formContainer
            , html: Mustache.render(form)
          });

          if(form){

                  jQuery(me.container).modal('show');

                    lbs.actionHandler({
                      container: me.container
                      ,handlers: me.handlers
                    });
              }

        })

  }
  ,create : function(){
    var me = this;

    lbs.workspace.activities['form:Details'] = this;
    delete this.deps;
    delete this.create;
  }

  ,handlers:{}
  ,deps:[]
};