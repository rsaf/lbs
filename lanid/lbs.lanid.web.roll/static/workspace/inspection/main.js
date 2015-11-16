/**
 * inspection client module
 * This is a copy of photos but may behave and look different than photos; thus a copy
 * Got to simplify this:
 * inspection handles setting up the basic handlers for page switching using settings from inspection.sub.routes[jQuery.param.fragment()]
 * inspection.sub should contain only the settings, its render will be called by the router but since it handles multiple routes
 * it will pass the rendering along to it's parent (inspection)
 * inspection:list is a dependency of inspection and should only be responsible for loading data and then rendering
 * or re rendering on page change or view change
 * the change functions are defined in inspection:list, the global:paginator (to be created) can pageChange of inspection:list for listview
 * when inspection:list is done rendering it'll inform inspection so it can do things
 * like hiding buttons and such (should have been done in css but isn't)
 * written by Harm Meijer: harmmeiier@gmail.com
 */
  console.log('inspection is loaded...');
  lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/inspection'] = {mod: 'lbs.workspace.inspection', location: '/workspace/inspection/main.js'};
  lbs.routes['/workspace/inspection/unInspected'] = 
  lbs.routes['/workspace/inspection/qualified'] = 
  lbs.routes['/workspace/inspection/unQualified'] = 
          {mod:'lbs.workspace.inspection.sub',location:'/workspace/inspection/main.js'};
  lbs.routes['/workspace/inspection:list'] = 
          {mod:'lbs.workspace.inspection:list',location:'/workspace/inspection/main.js'};
  lbs.routes['/workspace/inspection:folder'] = 
          {mod:'lbs.workspace.inspection:folder',location:'/workspace/inspection/main.js'};


  lbs.modules['/workspace/inspection'] = {
     create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.unInspectedFolders='/workspace/inspection/folders/unInspectedFolders.json'
      this.endPoints.qualifiedFolders='/workspace/inspection/folders/qualifiedFolders.json'
      this.endPoints.unQualifiedFolders='/workspace/inspection/folders/unQualifiedFolders.json'
      this.endPoints.unInspected='/workspace/photoservices/inspections/idphotos/lzcode.json';
      this.endPoints.unQualified='/workspace/photoservices/inspection/unqualified.json';
      this.endPoints.qualified='/workspace/photoservices/inspection/qualified.json';
      lbs.workspace.inspection = this;
      var me = this;
      this.handlers['inspection:listView']=function(e){
        me['inspection:listView'](e);
      };
      this.handlers['inspection:galleryView']=function(e){
        me['inspection:galleryView'](e);
      };
      this.handlers['inspection:singleView']=function(e){
        me['inspection:singleView'](e);
      };

      delete this.deps;
      delete this.create;
    }
    ,'inspection:listView':function(e){
      //cannot savely put content in the container because style is set on this container
      //  style should have been set on a child of container_bottom so it can be replaced
      //  without messing with the classes in script as we have to do now
      var $listContainer = jQuery(this.listMod.forContainer);
      this.listMod.currentView='listView';
      $listContainer.removeClass('idPhotoGalery');
      this.listMod.pageSize = 20;
      this.rerenderList('listView');
    }
    ,'inspection:galleryView':function(e){
      var $listContainer = jQuery(this.listMod.forContainer);
      this.listMod.currentView='galleryView';
      $listContainer.addClass('idPhotoGalery');
      this.listMod.pageSize = 20;

          //this.view === 'galleryView'
      lbs.workspace.inspection.sub.render({view:'galleryView'});


     // this.rerenderList('galleryView');
    }
    ,'inspection:singleView':function(e){
      var $listContainer = jQuery(this.listMod.forContainer);
      $listContainer.addClass('idPhotoGalery');
      this.listMod.currentView='singleView';

      //this.listMod.pageSize = 20;
      this.rerenderList('singleview');
    }
    ,basePath:'/workspace/inspection'
    ,deps:['/workspace','/workspace/inspection:list']
    ,listMod:null
    ,render : function render(arg){
      arg = arg || {};
      var sub = lbs.workspace.inspection.sub;
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      jQuery.when(
        lbs.modHelper.getView('/workspace/inspection/inspection.html')
        ,lbs.modHelper.getMod('/workspace/inspection:list')
        ,this.parent.render({fromChild:true})
      ).then(function(view,listMod){
        me.listMod=listMod;
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{
            settings:arg.settings
            ,helpers:{
              showSingle : sub.showItem('Single')
              ,showAction : sub.showItem('Action')
              ,showList : sub.showItem('List')
              ,showGallery : sub.showItem('Gallery')
            }
          }),container:arg.container});
        lbs.actionHandler({container:arg.container,handlers:me.handlers});
        return listMod.render({
          container:'.container_bottom'//@todo:just pass arg here and set arg.container
          ,endPoint:arg.settings.endPoint
          ,view:arg.view
          ,handlers:arg.listHandlers
          ,helpers:{
            showGallery : sub.showItem('Gallery')
            ,showAction : sub.showItem('Action')
            ,showDetail : sub.showItem('Detail')
            ,photoHoverBoxDirection:function(i){
                    var arr = ['arrow-left-top', 'arrow-left-top', 'arrow-right', 'arrow-right'];
                    return function(){
                        ++i;i=i%4;
                        return arr[i];
                    }
                }(-1)
            ,someId : function(i){//can be removed, fake endpoint does not have unique id for item
              return function(){
                return Math.floor(++i/2);//need same id twice for each item
              };
            }(-1)
          }
        });
      }).then(function(){
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{
      'inspection:search':function(e){
        e.preventDefault();
      }
      ,setSelectedMode : function(e){
        lbs.basemodule['photo:list'].setSelectedMode.call(this,{e:e});
      }
    }
    ,rerenderList : function rerenderList(currentView){
      this.listMod.rerender(currentView).then(function(){
        //@todo: this should be defined in css but can script it for now
        if(currentView==='galleryView'&&jQuery.param.fragment().indexOf('/workspace/inspection/unInspected')===0){
          jQuery('.blueButton.IDPhotoInspectionConfirm').show();          
        }else{
          jQuery('.blueButton.IDPhotoInspectionConfirm').hide();
        }
      });
    }
  };


  lbs.modules['/workspace/inspection/unInspected'] =
  lbs.modules['/workspace/inspection/qualified'] =
  lbs.modules['/workspace/inspection/unQualified'] =
  {
    deps : ['/workspace/inspection']
    ,container:'#right_container'
    ,routes:{}
    ,currentRoute:null
    ,activities:null
    ,view:null//to be set in render
    ,create : function create(){

      this.parent=lbs.workspace.inspection;
      this.routes['unInspected']={
        endPoint:null
        ,folderEndPoint:lbs.workspace.inspection.endPoints.unInspectedFolders
        ,photoEndPoint:lbs.workspace.inspection.endPoints.unInspected
        ,showSingle:true,showGallery:true,showAction:true,showPhotoInfo:true,showDetail:true
        ,root:'检测中心'
        ,currentPage:'待检照片'
      };
      this.routes['qualified']={
        endPoint:null
        ,folderEndPoint:lbs.workspace.inspection.endPoints.qualifiedFolders
        ,photoEndPoint:lbs.workspace.inspection.endPoints.qualified
        ,showList:false,showGallery:true,showDetail:true
        ,root:'检测中心'
        ,currentPage:'合格照片'
      };
      this.routes['unQualified']={
        endPoint:null
        ,folderEndPoint:lbs.workspace.inspection.endPoints.unQualifiedFolders
        ,photoEndPoint:lbs.workspace.inspection.endPoints.unQualified
        ,showList:false,showGallery:true,showDetail:true
        ,root:'检测中心'
        ,currentPage:'不合格照'
      };
      lbs.workspace.inspection.sub = this;
      var me = this;
      delete this.deps;
      delete this.create;
    }
    ,getShowItem : function(item){
      //@todo: viewing details no longer deppends on url since the id of the 
      //  folder is in the url. find another way to handle this
      return this.routes[this.currentRoute]['show'+item];
    }
    ,showItem : function(itemName){
      var me = this;
      return lbs.modHelper.isVal({
        obj: {val:true}
        ,key:'val'
        ,val : function(){
          if(me.view === 'foldersView'){
            return false;
          }
          return me.getShowItem(itemName);
        }
        ,yes : true
      });
    }
    ,render : function render(arg){
      arg = arg || {};



      var code = $.param.fragment().split('/').pop();
      var photoType = $.param.fragment().split('/')[3].toLowerCase();

      console.log('rendering uninspected code-----',code);


      this.view = arg.view||'foldersView';
      var d = jQuery.Deferred();
      var me = this;
      //@todo: since the id of the folder is in the url we can no longer use this
      //  fix this with a parameter in the url passed by ...
      var splitUrl = jQuery.param.fragment().split('/');
      if(this.routes[splitUrl[splitUrl.length-1]]){
        this.currentRoute=splitUrl[splitUrl.length-1];
      }else{
        this.currentRoute=splitUrl[splitUrl.length-3];
      }
      console.log('and current route is:',this.currentRoute,this.routes
              ,this.routes[this.currentRoute]);
      var settings = this.routes[this.currentRoute]?this.routes[this.currentRoute]
        :this.routes['/workspace/inspection/unInspected'];
      if(this.view === 'foldersView'){
        settings.endPoint = settings.folderEndPoint;
      }
      else if((this.view === 'galleryView')||(arg.view === 'galleryView')){


          if(photoType === 'unqualified'){
              settings.endPoint ='/workspace/photoservices/inspection/unqualified/'+code+'.json';
          }
          else if(photoType === 'qualified'){
              settings.endPoint = '/workspace/photoservices/inspection/qualified/'+code+'.json';
          }
          else{
              settings.endPoint = '/workspace/photoservices/inspections/idphotos/'+code+'.json';
          }

      }
      else{// subfoldervifew

          settings.endPoint ='/workspace/photoservices/inspection/folders/'+code+'.json';
      }
      this.parent.render({
        fromChild:true
        ,container:this.container
        ,view:me.view
        ,settings:settings
        ,listHandlers:this.handlers
      }).then(function(){
        d.resolve();
      })
      return d.promise();
    }
    ,handlers:{
      'inspection:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
    }
  };

//@todo the following module  is being handledby the base module and it is being use to render the photo after the folder view, instead of rendering the folders, as you may think.
  lbs.modules['/workspace/inspection:folder'] = {
    deps : ['/workspace']
    ,container:'notUsed'
    ,create : function create(){
      var me = this;
      lbs.workspace['inspection:folder'] = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){

          var me = this;

      return lbs.modHelper.getMod('/workspace/inspection/unInspected')
                      .then(function(mod){

                          if(typeof mod.create==='function'){
                              mod.create();
                          }
                          return mod.render({view:'galleryView'})
                      });

    }
    ,handlers:{}
  };


lbs.modules['/workspace/inspection:subfolder'] = {
    deps : ['/workspace']
    ,container:'notUsed'
    ,create : function create(){
        var me = this;
        lbs.workspace['inspection:folder'] = this;
        delete this.deps;
        delete this.create;
    }
    ,render : function render(arg){

        var me = this;

        return lbs.modHelper.getMod('/workspace/inspection/unInspected')
            .then(function(mod){

                if(typeof mod.create==='function'){
                    mod.create();
                }
                return mod.render({view:'subFoldersView'})
            });
    }
    ,handlers:{}
};

  lbs.modules['/workspace/inspection:list'] = {
    deps : ['/workspace']
    ,views:{
      galleryView:'/workspace/inspection/galleryView.html'
      ,listView:'/workspace/inspection/listView.html'
      ,singleView:'/workspace/inspection/singlePhotoView.html'
      ,foldersView:'/workspace/inspection/foldersView.html'
      ,subFoldersView:'/workspace/inspection/foldersView.html'
    }
    ,settings:{}
    ,currentView:null
    ,list:[]
    ,view:null
    ,templateHelpers:null
    ,otherHandlers:false
    ,index:0
    ,currentPhotoActionEvent:null
    ,pageSize:20
    ,currentProceesingPhoto:null
    ,currentProcessingPhotoIndex:-1
    ,totalRecords:null
    ,create : function create(){
      var me = this;
      this.handlers['inspection:list:movePage']=function(e){

          if($(e.target).hasClass('disabled') ){
              return;
          }

        me.movePage(e);
      }

      this.handlers['inspection:unqualified:reason:provided']=function(e){
            var feedback =   $('#feedbackForm').serializeObject()
            me.photoInspectionFeedback({e:e,feedback:feedback, type:'unqualified'});
        }

      this.handlers['inspection:provide:feedback']=function(e){

        var type  = e.target.getAttribute('data-type');
        var id = e.target.getAttribute('data-id');

          me.currentPhotoActionEvent = e;

        if(type==='qualified'){
            me.photoInspectionFeedback({e:e,feedback:null, type:'qualified',id:id});

        }
        else if(type='unqualified'){
            me.photoUnqualifiedProvideReason({e:e,id:id});
        }
    }

      this.searchHandlers['pagination:search']=function(e){
              me.movePage(e);
          }






    lbs.workspace['inspection:list'] = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      arg = arg || {};
        var me = this;
          console.log('inspection----list render----',arg);
      //arg.pageSize = arg.pageSize || 2;
          arg.pageSize = arg.pageSize || this.pageSize;

          lbs.actionHandler({container:'.form_right_search',handlers:this.searchHandlers,doOverride:true})
      //console.log(' arg.activities----', arg.activities);
      lbs.basemodule['photo:list'].render.call(this,arg);
    }
    ,rerender:function rerender(arg){
      var urlSplit = jQuery.param.fragment().split('/');
      this.settings=this.settings||{};
      this.settings.filter=urlSplit[urlSplit.length-1];
      return lbs.basemodule['photo:list'].rerender.call(this,arg);
    }

    ,photoUnqualifiedProvideReason:function photoUnqualifiedProvideReason(arg){

        var me =this;


        var arr = lbs.workspace['inspection:list'].list;
        var index = lbs.util.find({arr:arr, key:'_id',val:arg.id});


        if(index>-1){
            me.currentProceesingPhoto = arr[index];
            me.currentProcessingPhotoIndex = index;
        }


    lbs.modHelper.getView('/workspace/inspection/unQualifiedReason.html').then(function(view){
      lbs.modHelper.setContainer({
        container:'#platformAPIsModal'
        ,html:Mustache.render(view)
      });

      lbs.actionHandler({
        container:'#platformAPIsModal'
        ,handlers:me.handlers
      });

      jQuery('#platformAPIsModal').modal().off('hide.bs.modal.photo.unqualified.reason');
      jQuery('#platformAPIsModal').modal().on('hide.bs.modal.photo.unqualified.reason', function(){
        lbs.modHelper.setContainer({
          container:'#platformAPIsModal'
          ,html:''
         });
       });
     });
   }

    ,photoInspectionFeedback: function photoInspectionFeedback(arg){

    var me = this;
    var data = null;
    var index = -1;



          var arr = lbs.workspace['inspection:list'].list;

          if(arg.type === 'unqualified'){

            data = arg.feedback;
            index = me.currentProcessingPhotoIndex;

              //todo me.currentProceesingPhoto has already been set for unqualified photo type : see photoUnqualifiedProvideReason function
          }
          else {
              index = lbs.util.find({arr:arr, key:'_id',val:arg.id});
              if(index>-1){
                  me.currentProceesingPhoto = arr[index];
              }
          }


          var ac = $.param.fragment().split('/').pop();
          var currentElem = $(me.currentPhotoActionEvent.target).closest('.photoframeContainer');


        console.log('  -------feedback : ', arg.feedback);
        console.log('photo---',me.currentProceesingPhoto);
        console.log('reason---',data);

        lbs.modHelper.getMessage('/workspace/inspection/inspection/'+ arg.type +'/'+ac+'.json', null,{modalToHide:'#platformAPIsModal'},'POST', {data:data,photo:me.currentProceesingPhoto})
            .then(function(returnJson){

                console.log('inspection decision saved-----');
                lbs.workspace['inspection:list'].list.splice(index,1);
                    jQuery('#platformAPIsModal').modal('hide');
                  lbs.modHelper.setContainer({
                    container:'#platformAPIsModal'
                    ,html:''
                  });
                lbs.workspace['inspection:list'].rerender();

            }  ,  function fail(err){
                lbs.util.showFailureMessage({message:"Server issue while doing inspection feedback"});
            });
    }
    ,movePage:function movePage(e){
      lbs.basemodule['photo:list'].movePage.call(this,{e:e});
    }
    ,updateArrows:function updateArrows(){
      lbs.basemodule['photo:list'].updateArrows.call(this);
    }
    ,handlers:{}
    ,searchHandlers:{}
    ,remove : function remove(){
    }
  };

