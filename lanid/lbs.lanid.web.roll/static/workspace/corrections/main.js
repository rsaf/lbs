/**
 * corrections client module
 *   This is a copy of inspection but may behave and look different than photos; thus a copy
 * written by Harm Meijer: harmmeiier@gmail.com
 */
    console.log('corrections is loaded...');
  lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/corrections'] = {mod: 'lbs.workspace.corrections', location: '/workspace/corrections/main.js'};
  lbs.routes['/workspace/corrections/unProcessed'] = 
  lbs.routes['/workspace/corrections/processSuccessful'] = 
  lbs.routes['/workspace/corrections/processFailed'] =
  lbs.routes['/workspace/corrections/inProcess'] =
      {mod:'lbs.workspace.corrections.sub',location:'/workspace/corrections/main.js'};
  lbs.routes['/workspace/corrections:list'] = 
          {mod:'lbs.workspace.corrections:list',location:'/workspace/corrections/main.js'};

lbs.routes['/workspace/corrections:folder'] =
{mod:'lbs.workspace.corrections:folder',location:'/workspace/corrections/main.js'};

lbs.modules['/workspace/corrections'] = {
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.unProcessedFolders='/workspace/corrections/folders/unProcessedFolders.json'
      this.endPoints.processSuccessfulFolders='/workspace/corrections/folders/processSuccessfulFolders.json'
      this.endPoints.processFailedFolders='/workspace/corrections/folders/processFailedFolders.json'
      this.endPoints.inProcessFolders='/workspace/corrections/folders/inProcessFolders.json'
      //this.endPoints.idPhotos='/workspace/photos/idphotos.json';
      //workspace/photoservices/corrections/todo/'+status+'/'+ac+'.json"
      this.endPoints.unProcessed= null;
      this.endPoints.processSuccessful= null;
      this.endPoints.processFailed= null;
      this.endPoints.inProcess= null;
      lbs.workspace.corrections = this;
      var me = this;
      this.handlers['corrections:listView']=function(e){
        me['corrections:listView'](e);
      };
      this.handlers['corrections:galleryView']=function(e){
        me['corrections:galleryView'](e);
      };
      this.handlers['corrections:singleView']=function(e){
        me['corrections:singleView'](e);
      };

      delete this.deps;
      delete this.create;
    }
    ,'corrections:listView':function(e){
      var $listContainer = jQuery(this.listMod.forContainer);
      $listContainer.removeClass('idPhotoGalery');
      this.listMod.currentView='listView';
      this.listMod.pageSize = 20;
      this.listMod.rerender();
    }
    ,'corrections:galleryView':function(e){
      var $listContainer = jQuery(this.listMod.forContainer);
      $listContainer.addClass('idPhotoGalery');
      this.listMod.currentView='galleryView';
      this.listMod.pageSize = 20;
      this.listMod.rerender();
    }
    ,'corrections:singleView':function(e){
      var $listContainer = jQuery(this.listMod.forContainer);
      $listContainer.addClass('idPhotoGalery');
      this.listMod.currentView='singleView';
      this.listMod.pageSize = 1;
      this.listMod.rerender();
    }
    ,basePath:'/workspace/corrections'
    ,deps:['/workspace','/workspace/corrections:list']
    ,listMod:null
    ,render : function render(arg){
      arg = arg || {};
      var sub = lbs.workspace.corrections.sub;
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      jQuery.when(
        lbs.modHelper.getView('/workspace/corrections/corrections.html')
        ,lbs.modHelper.getMod('/workspace/corrections:list')
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
             ,showDownload: sub.showItem('Download') //roll script for download button script 4
             ,showUpload: sub.showItem('Upload') //roll script for upload button script
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
            ,showDownload: sub.showItem('Download') //roll script for download button script 5
            ,showUpload: sub.showItem('Upload') //roll script for upload button script
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
      'corrections:search':function(e){
        e.preventDefault();
      }
      ,setSelectedMode : function(e){
        lbs.basemodule['photo:list'].setSelectedMode.call(this,{e:e});
      }
    }
  };


lbs.modules['/workspace/corrections/unProcessed'] =
lbs.modules['/workspace/corrections/processSuccessful'] =
lbs.modules['/workspace/corrections/processFailed'] =
lbs.modules['/workspace/corrections/inProcess'] =
  {
    deps : ['/workspace/corrections']
    ,container:'#right_container'
    ,routes:{}
    ,currentRoute:null
    ,view:null//to be set in render
    ,create : function create(){
      this.parent=lbs.workspace.corrections;
      this.routes['/workspace/corrections/unProcessed']={
        endPoint:null
        ,folderEndPoint:lbs.workspace.corrections.endPoints.unProcessedFolders
        ,photoEndPoint:lbs.workspace.corrections.endPoints.unProcessed

        //,showDetail:true,showList:true,showGallery:true //start roll download script --script3
        ,showDetail:true,showList:false,showGallery:true,showDownload:true
        ,root:'制作中心'
        ,currentPage:'待制作照片'
      };
     this.routes['/workspace/corrections/inProcess']={
      endPoint:null
      ,folderEndPoint:lbs.workspace.corrections.endPoints.inProcessFolders
      ,photoEndPoint:lbs.workspace.corrections.endPoints.inProcess

      //,showDetail:true,showList:true,showGallery:true //start roll download script --script3
      ,showDetail:true,showList:false,showGallery:true,showUpload:true
      ,root:'制作中心'
      ,currentPage:'待制作照片'
    };
      this.routes['/workspace/corrections/processSuccessful']={
        endPoint:null
        ,folderEndPoint:lbs.workspace.corrections.endPoints.processSuccessfulFolders
        ,photoEndPoint:lbs.workspace.corrections.endPoints.processSuccessful
        ,showDetail:true,showList:false,showGallery:true
        ,root:'制作中心'
        ,currentPage:'制作成功'
      };
      this.routes['/workspace/corrections/processFailed']={
        endPoint:null
        ,folderEndPoint:lbs.workspace.corrections.endPoints.processFailedFolders
        ,photoEndPoint:lbs.workspace.corrections.endPoints.processFailed
        ,showDetail:true,showList:false,showGallery:true
        ,root:'制作中心'
        ,currentPage:'制作失败'
      };
      lbs.workspace.corrections.sub = this;
      var me = this;
      //this.handlers['corrections:openfolder']=function(e){
      //  me.openFolder(e);
      //};

    //starting roll script for download button --script2
    this.handlers['corrections:photos:download']=function(e){
      //alert('starting download...');
      me.startPhotoDownload(e);
    };

    this.handlers['corrections:photos:upload']=function(e){

          me.startPhotoUpload(e);
     };
    //ending  roll script for download button --script2

      delete this.deps;
      delete this.create;
    }
    ,getShowItem : function(item){
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


    ,startPhotoDownload: function startPhotoDownload(e){



      var ac = $.param.fragment().split('/').pop();
      var status =  $.param.fragment().split('/')[3].toLowerCase();

      console.log('--------------start download---------',ac);

      var doawnloadBotHtml =  '   <div id="photoCorrectionDowndBot"> <object id="CUploadCtrl" classid="clsid:36e8cd0b-224d-4af1-9e86-20b120b718ac" codebase="/ocx/lbs.api.pmm.ocx.dll#version=1,0,0,13"> <param name="TodoEndpoint" value="/workspace/photoservices/corrections/'+status+'/'+ac+'.json" /> <param name="AckEndpoint" value="/workspace/photoservices/ack/'+ac+'/photoname.json" /> <param name="FailEndpoint" value="/workspace/photoservices/fail/'+ac+'/photoname.json" /> <param name="DoneEndpoint" value="/workspace/photoservices/done/'+ac+'/photoname.json" /> </object> </div> '

      $('#photoCorrectionDowndBot')[0].outerHTML = doawnloadBotHtml;


  }


  ,startPhotoUpload: function startPhotoUpload(e){


  var ac = $.param.fragment().split('/').pop();
  var status =  $.param.fragment().split('/')[3].toLowerCase();

  console.log('--------------start upload---------',ac);

  var uploadBotHtml =  '   <div id="photoCorrectionUplBot"> <object id="CUploadCtrl" classid="clsid:36e8cd0b-224d-4af1-9e86-20b120b718ac" codebase="/ocx/lbs.api.pmm.ocx.dll#version=1,0,0,13"> <param name="TodoEndpoint" value="/workspace/photoservices/corrections/unProcessed/'+ac+'.json" /> <param name="AckEndpoint" value="/workspace/photoservices/ack/'+ac+'/photoname.json" /> <param name="FailEndpoint" value="/workspace/photoservices/fail/'+ac+'/photoname.json" /> <param name="DoneEndpoint" value="/workspace/photoservices/done/'+ac+'/photoname.json" /> </object> </div> '

  $('#photoCorrectionUplBot')[0].outerHTML = uploadBotHtml;


}

    //end  roll script for download button --script1
  ,render : function render(arg){

      arg = arg || {};


      var url = jQuery.param.fragment();

      if(this.routes[url]){
        this.currentRoute= url;
      }else{

        var tempUrl = url.split('/');
        tempUrl.pop();tempUrl.pop();
        this.currentRoute=tempUrl.join('/');
      }
      var code = $.param.fragment().split('/').pop();
      var photoType = $.param.fragment().split('/')[3].toLowerCase();

    console.log('rendering------this.currentRoute:',this.currentRoute);

      this.view = arg.view||'foldersView';
      var d = jQuery.Deferred();
      var me = this;


    var settings = this.routes[this.currentRoute]?this.routes[this.currentRoute]
        :this.routes['/workspace/corrections/unProcessed']


      if(this.view === 'foldersView'){
        this.routes[jQuery.param.fragment()].endPoint
          = this.routes[jQuery.param.fragment()].folderEndPoint;
      }else{

        settings.endPoint =  '/workspace/photoservices/corrections/'+photoType+'/'+code+'.json';

      }
      this.parent.render({
        fromChild:true
        ,container:this.container
        ,view:me.view
        ,settings:settings
        ,listHandlers:this.handlers
      }).then(function(){
        lbs.actionHandler({container:'.container_top',handlers:me.handlers});
        d.resolve();
      })
      return d.promise();
    }
    ,handlers:{
      'corrections:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }

    ,remove : function remove(){
    }
  };



lbs.modules['/workspace/corrections:folder'] = {
  deps : ['/workspace']
  ,container:'notUsed'
  ,create : function create(){
    var me = this;
    lbs.workspace['corrections:folder'] = this;
    delete this.deps;
    delete this.create;
  }
  ,render : function render(arg){

    var me = this;
    console.log('rendering folders view----');

    return lbs.modHelper.getMod('/workspace/corrections/unProcessed')
        .then(function(mod){
          if(typeof mod.create==='function'){
            mod.create();
          }
          return mod.render({view:'galleryView'})
        });

  }
  ,handlers:{}
};

lbs.modules['/workspace/corrections:list'] = {
    deps : ['/workspace']
    ,views:{
      galleryView:'/workspace/corrections/galleryView.html'
      ,listView:'/workspace/corrections/listView.html'
      ,singleView:'/workspace/corrections/singlePhotoView.html'
      ,foldersView:'/workspace/corrections/foldersView.html'
    }
    ,currentView:null
    ,list:[]
    ,templateHelpers:null
    ,otherHandlers:false
    ,index:0
    ,pageSize:20
    ,totalRecords:null
    ,create : function create(){
      var me = this;
      this.handlers['corrections:list:movePage']=function(e){
        me.movePage(e);
      }
      lbs.workspace['corrections:list'] = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){

    console.log('corrections----list render----',arg);

    arg = arg || {};
    arg.pageSize = arg.pageSize || 20;

        this.searchHandlers = {};
        this.searchHandlers['pagination:search']=function(e){
            me.movePage(e);
        }
        lbs.actionHandler({container:'.form_right_search',handlers:this.searchHandlers,doOverride:true})
      lbs.basemodule['photo:list'].render.call(this,arg);
    }
    ,rerender:function rerender(arg){

    var me = this;

    var urlSplit = jQuery.param.fragment().split('/');
    me.settings=this.settings||{};
    me.settings.filter=urlSplit.pop();
    lbs.basemodule['photo:list'].rerender.call(this,arg);
    }
    ,movePage:function movePage(e){
      lbs.basemodule['photo:list'].movePage.call(this,{e:e});
    }
    ,updateArrows:function updateArrows(){
      lbs.basemodule['photo:list'].updateArrows.call(this);
    }
    ,handlers:{}
    ,remove : function remove(){
    }
  };

