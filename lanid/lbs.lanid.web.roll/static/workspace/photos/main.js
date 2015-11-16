/**
 * photos client module
 * 
 * written by Harm Meijer: harmmeiier@gmail.com
 */
    console.log('photos is loaded...');
  lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/photos'] = {mod: 'lbs.workspace.photos', location: '/workspace/photos/main.js'};
  lbs.routes['/workspace/photos/idphotos'] = 
  lbs.routes['/workspace/photos/processing'] = 
  lbs.routes['/workspace/photos/otherPhotos'] =
      {mod:'lbs.workspace.photos.photos',location:'/workspace/photos/main.js'};
  lbs.routes['/workspace/photos:list'] = 
          {mod:'lbs.workspace.photos:list',location:'/workspace/photos/main.js'};
lbs.routes['/workspace/photos:delete'] =
{mod:'lbs.workspace.photos:delete',location:'/workspace/photos/main.js'};



console.log(lbs.modules['/workspace/photos'] = {
     create: function () {
        this.parent = lbs.workspace;
        this.endPoints = {};
        this.endPoints.idPhotos = '/workspace/photos/idphotos.json';
        this.endPoints.processing = '/workspace/photos/processing.json';
        this.endPoints.otherPhotos = '/workspace/photos/otherphotos.json';
        lbs.workspace.photos = this;
        var me = this;
        this.handlers['photos:listView'] = function (e) {
            me['photos:listView'](e);
        };
        this.handlers['photos:galleryView'] = function (e) {
            me['photos:galleryView'](e);
        };

        this.handlers['photo:send:email'] = function (e) {
            me.emailPhotos(e);
            console.log('---------------------send email');
        };


        this.handlers['photo:new:upload'] = function (e) {
            me.uploadNewPhoto(e);
        };


        this.handlers['photo:information:upload'] = function (e) {
            me.submitPhoto(e);
        };

        this.handlers['photos:photo:delete'] = function (e){
            console.log('delete multiple-------');
            me.confirmDeletePhoto(e);
        };


        delete this.deps;
        delete this.create;
    }
    ,'photos:listView': function (e) {
        //cannot savely put content in the container because style is set on this container
        //  style should have been set on a child of container_bottom so it can be replaced
        //  without messing with the classes in script as we have to do now
        var $listContainer = jQuery(this.listMod.forContainer);
        this.listMod.currentView = 'listView';
        this.listMod.pageSize = 10;
        $listContainer.addClass('unprocessedPhotosContainer');
        $listContainer.removeClass('idPhotoGalery');
        this.listMod.rerender();
    }
    ,'photos:galleryView': function (e) {
        var $listContainer = jQuery(this.listMod.forContainer);
        this.listMod.currentView = 'galleryView';
        this.listMod.pageSize = 8;
        $listContainer.addClass('idPhotoGalery');
        $listContainer.removeClass('unprocessedPhotosContainer');
        this.listMod.rerender();
    }
    , data: {imgData: null, infoData: {}}
    , basePath: '/workspace/photos'
    , deps: ['/workspace', '/workspace/photos:list']
    , listMod: null
    , photosToDelete:[]
    , render: function render(arg) {
        arg = arg || {};
        var me = this;
        return jQuery.when(
            lbs.modHelper.getView('/workspace/photos/photos.html')
            , lbs.modHelper.getMod('/workspace/photos:list')
            , this.parent.render({fromChild: true})
        ).then(function (view, listMod) {
            if(listMod.create){listMod.create()};
            me.listMod = listMod;
            lbs.modHelper.setContainer({
                mod: me,
                html: Mustache.render(view, {settings: arg.settings}),
                container: arg.container
            });
            lbs.actionHandler({container: arg.container, handlers: me.handlers});
            return listMod.render({
                container: '.container_bottom'//@todo:just pass arg here and set arg.container
                , endPoint: arg.settings.endPoint
                , view: arg.view
                , handlers: arg.listHandlers
                , settings: arg.settings
                ,photosToDelete:me.photosToDelete
            });
        });
    }

    , emailPhotos: function emailPhotos() {


        var me = this;

        lbs.modHelper.getView('/workspace/photos/destinationEmail.html')
            .then(function (view) {
                //   console.log(me.personalProfile);
                lbs.modHelper.setContainer({
                    container: '#platformAPIsModal'
                    , html: Mustache.render(view)
                });
                lbs.actionHandler({
                    container: '#platformAPIsModal'
                    , handlers: me.handlers
                });

                $('#platformAPIsModal').modal().off('hide.bs.modal.setEmail');
                $('#platformAPIsModal').modal().on('hide.bs.modal.setEmail', function () {
                    lbs.modHelper.setContainer({
                        container: '#platformAPIsModal'
                        , html: ''
                    });
                });
                var i = -1, len = boundVals.length;
                while (++i < len) {
                    boundVals[i].updateUI();
                    me.updatedContact = boundVals[i];
                }

            })

    }

    , submitPhoto: function submitPhoto(e) {

        var me = this;

        var infoData =  $('#photoInforForm').serializeArray();

        lbs.modHelper.getView('/workspace/photos/spinningStransitionPage.html')
            .then(function (view) {

                lbs.modHelper.setContainer({
                    container: '#platformAPIsModal'
                    , html: Mustache.render(view)
                });

                $('#platformAPIsModal').modal().off('hide.bs.modal.submitPhoto');

            });


        $('#uploadForm').ajaxSubmit({

            data: {'imgInfo': infoData}
            ,contentType:'multipart/form-data'
            ,dataType: 'json'
            ,success: function (data) {
                console.log('--------submit successful----------');
                lbs.workspace.photos.listMod.list.push(data.pl);
                //lbs.workspace.photos.listMod.rerender();
                lbs.basemodule['photo:list'].movePage.call(lbs.workspace.photos.listMod,{e:{direction:'right'}});

                $('#platformAPIsModal').modal('hide');
                lbs.modHelper.setContainer({
                    container: '#platformAPIsModal'
                    , html: ''
                });


                $('#uploadForm').resetForm();
            }
            ,error: function(err){
                console.log('error:---- ',err);
                $('#uploadForm').resetForm();
            }
            ,cache: false   //dont cache request
            ,processData: false // Don't process the files
            ,contentType: false // Set content type to false as jQuery will tell the server its a query string request
        });
    }

    , uploadNewPhoto: function uploadNewPhoto(e) {


        lbs.basemodule.pageComplete();


        var me = this;

        var reader = new FileReader(),
            img = new Image(),
            fileSize = 0,
            fileSizePxWidth = 0,
            fileSizePxHeight = 0;

            console.log('inside photo handlers-------------------');


        var input = $(e.target),
            files = e.target.files[0],
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

      //  console.log('   input data -----:', files);

        function imageAvailable (){
            var d = jQuery.Deferred();
            reader.onload = function (e) {
                img.src = e.target.result;

                fileSize = Math.round(files.size / 1024);


                img.onload = function () {
                    fileSizePxWidth = Math.floor( this.width* 0.264583);//25,4 / 96
                    fileSizePxHeight = Math.floor( this.height*0.264583 );
                    d.resolve('done');
                };
            };
            return d.promise();
        }
        reader.readAsDataURL(files);



        // Create a formdata object and add the files
        me.data.imgData = new FormData();
        $.each(files, function (key, value) {
            me.data.imgData.append(key, value);
        });

        var me = this;
        //boundVals=[];
        jQuery.when(
            lbs.modHelper.getView('/workspace/photos/uploadedPhotoInfo.html')
            ,imageAvailable()).then(function(view){

                console.log(' ------rendering file upload modal---------');
                lbs.modHelper.setContainer({
                    container: '#platformAPIsModal'
                    , html: Mustache.render(view)
                });
                lbs.actionHandler({
                    container: '#platformAPIsModal'
                    , handlers: me.handlers
                });


                $('.uploadedPhotoName').val(label);

                $('#platformAPIsModal').modal( ).off('hide.bs.modal.uploadPhoto');




                lbs.basemodule.pageComplete();

                $('#uploadedPhotoResolutionInfo').text(fileSizePxWidth + 'mmX' + fileSizePxHeight + 'mm');
                $('#uploadedPhotoSizeInfo').text(fileSize + 'Kb');

                $('.uploadedPhotoSizeInfo').val(fileSize + 'Kb');
                $('.uploadedPhotoResolutionInfo').val(fileSizePxWidth + '*'+ fileSizePxHeight);



                $('#platformAPIsModal').modal().on('hide.bs.modal.uploadPhoto', function () {
                    lbs.modHelper.setContainer({
                        container: '#platformAPIsModal'
                        , html: ''
                    });
                });

            })

    }

    ,confirmDeletePhoto:function confirmDeletePhoto(e){

        var me = this;
        console.log('----------------confirm delete photo-------\n');
        lbs.modHelper.getMod('/workspace/photos:delete')
            .then(function(newMod){
                newMod.render({container:'#platformAPIsModal',codes: me.photosToDelete});
            });
    }

    , handlers: {
        'photo:search': function (e) {

            e.preventDefault();
        }

        , setSelectedMode: function (e) {
            lbs.basemodule['photo:list'].setSelectedMode.call(this, {e: e});
        }
    }
});

lbs.modules['/workspace/photos/idphotos'] =
  lbs.modules['/workspace/photos/processing'] =
  lbs.modules['/workspace/photos/otherPhotos'] =
  {
    deps : ['/workspace/photos']
    ,container:'#right_container'
    ,routes:{}
    ,create : function create(){
      var me = this;
      this.parent=lbs.workspace.photos;
      this.routes['/workspace/photos/idphotos']={
        endPoint:lbs.workspace.photos.endPoints.idPhotos
        ,showDownload:false
        ,showDropDown:true
        ,showNewAlbum:false
        ,showList:true
        ,idPhotos:true
        ,showGallery:true
        ,showSelect:true
        ,root:'证照管理'
        ,currentPage:'证照照片'
      };
      this.routes['/workspace/photos/processing']={
        endPoint:lbs.workspace.photos.endPoints.processing
        ,showDownload:false
        ,showDropDown:false
        ,showNewAlbum:false
        ,showList:true
        ,processing:true
        ,showGallery:true
        ,root:'证照管理'
        ,currentPage:'待检照片'
      };
      this.routes['/workspace/photos/otherPhotos']={
        endPoint:lbs.workspace.photos.endPoints.otherPhotos
        ,showDownload:false
        ,showDropDown:true
        ,showNewAlbum:false
        ,showList:true
        ,otherPhotos:true
        ,showGallery:true
         ,showSelect:true
        ,root:'证照管理'
        ,currentPage:'其他照片'
      };



      lbs.workspace.photos.photos = this;
      var me = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){

      return this.parent.render({
        fromChild:true
        ,container:this.container
        ,settings:this.routes[jQuery.param.fragment()]
      })
    }

    ,handlers:{
      'photos:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
    }
  };

lbs.modules['/workspace/photos:list'] = {
     deps: ['/workspace']
    ,views:{
      galleryView:'/workspace/photos/galleryView.html'
      ,listView:'/workspace/photos/listView.html'
    }
    ,currentView:null
    ,list:[]
    ,otherHandlers:false
    ,index:0
    ,totalRecords:null
    ,pageSize:8
    ,photosToDeleteBinders:[]
    ,photosToDelete:null
    ,create : function create(){
      var me = this;
      this.handlers['photos:list:movePage']=function(e){
        me.movePage(e);
      }

        this.handlers['show:photo:bigger'] = function(e){
            me.showBiggerPhoto(e);
        }

        this.handlers['photo:list:details'] = function(e){
            me.showListViewPhotoDetails(e);
        }

        this.handlers['photos:select:all'] = function (e){
            console.log('selected all photos');
            me.markAllPhotosSelected(e);
        };

        this.handlers['photos:photo:delete:one'] = function (e){
            console.log('delete-------');
            me.confirmDeleteSinglePhoto(e);
        };


      lbs.workspace['photos:list'] = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      var me = this;
      me.photosToDelete=arg.photosToDelete;
      return lbs.basemodule['photo:list'].render.call(this,arg);
    }
    ,rerender:function rerender(){
        var setTotalSelected = function(obj,key){

            var numbeOfItems = obj[key].length;

            if(numbeOfItems>0&&jQuery('.numberOfSelectedItems').length> 0){
                jQuery('.numberOfSelectedItems').removeClass('hide').find('strong').text(numbeOfItems);
            }

        };
      var me = this;
      return lbs.basemodule['photo:list'].rerender.call(this)
      .then(function(){
          lbs.binder.unbind(me.photosToDeleteBinders);
          me.photosToDeleteBinders = lbs.binder.bind('.container_bottom',{ids:me.photosToDelete},'delPhoto'
          ,[setTotalSelected]);
              console.log('photosToDeleteBinders:--- ',me.photosToDeleteBinders);
              console.log('photosToDelete:--- ',me.photosToDelete);
          lbs.binder.updateUI(me.photosToDeleteBinders);
          setTotalSelected(me,'photosToDelete');
      });
    }
    ,showBiggerPhoto: function showBiggerPhoto(e){
        var me = this;
      //  $('#platformAPIsPopover').popoverX({placement: 'top', show:true, useOffsetForPos:false});
      //  $('#platformAPIsPopover').popoverX('show');


//        $('#platformAPIsPopover').on(' shown.bs.modal', function (e) {
//            console.log('----shown---')
//        });
//
//
//        $('#platformAPIsPopover').on('hidden.bs.modal', function (e) {
//           console.log('----hidden---')
//        });
//        lbs.modHelper.getView('/workspace/photos/listViewShowDetails.html')
//            .then(function(){
//
//            })

    }

    ,markAllPhotosSelected:function markAllPhotosSelected(e){
        var me = this;
        console.log('marking as checked');

        if(me.photosToDelete.length<8) {
            $('.photoSelection').prop('checked','true').change();
        }
        else{
            $('.photoSelection').prop('checked',false).change();
        }

    }
    ,showListViewPhotoDetails: function showListViewPhotoDetails(e){

        var getPhotoDetails = lbs.modHelper.getMessage(' /workspace/photos/details/23.json'
            ,null
            ,{modalToHide:'#platformAPIsModal'}, 'GET'
        );



        var getActivities = lbs.modHelper.getMessage(' /workspace/services/photo/2223.json'
            ,null
            ,{modalToHide:'#platformAPIsModal'}, 'GET'
        );

        var getView = lbs.modHelper.getView('/workspace/photos/listViewShowDetails.html');

        $.when(getPhotoDetails,getActivities,getView)
            .then(function(details,activities,view){

            lbs.modHelper.setContainer({
                container:'#platformAPIsModal'
                ,html:Mustache.render(view,{details:details, activities:activities.pl})
            });

            $('#platformAPIsModal').modal().off('hide.bs.modal');
            $('#platformAPIsModal').modal().on('hide.bs.modal', function(){
                lbs.modHelper.setContainer({
                    container:'#platformAPIsModal'
                    ,html:''
                });
            });

        });
    }

    ,movePage:function movePage(e){
      lbs.basemodule['photo:list'].movePage.call(this,{e:e});
    }
    ,updateArrows:function updateArrows(){
      lbs.basemodule['photo:list'].updateArrows.call(this);
    }
    ,confirmDeleteSinglePhoto:function confirmDeleteSinglePhoto(e){

        var codes = [];
        codes.push(e.target.getAttribute('data-code'));

        lbs.modHelper.getMod('/workspace/photos:delete')
            .then(function(newMod){
                newMod.render({container:'#platformAPIsModal',codes:codes });
            });

    }
    ,handlers:{
    }
    ,remove : function remove(){
    }
  };

lbs.modules['/workspace/photos:delete'] = {
    view:'/workspace/photos/confirmDeletePhoto.html'
    ,handlers:{}
    ,confirmedDeleteCodes :null
    ,photoStandard:{}

    ,render : function render(arg){
        var me = this;

        console.log('delete render');

        this.modalContainer=arg.container;
        console.log('render called with',arg)
        me.confirmedDeleteCodes = arg.codes;

        lbs.modHelper.getView(me.view).then(function(view){
            lbs.modHelper.setContainer({
                mod:me
                ,container:arg.container
                ,html:Mustache.render(view)
            });

            lbs.actionHandler({container: arg.container, handlers: me.handlers});


            jQuery(arg.container).modal().off('hidden.bs.modal.delete.photo');
            jQuery(arg.container).modal().on('hidden.bs.modal.delete.photo', function(){
                lbs.modHelper.setContainer({
                    container:arg.container
                    ,html:''
                });
            });
        });
    }

    ,create : function(){
        var me = this;
        this.handlers['photos:photos:delelete:confirmed']=function(e){
            me.deleteConfirmed();
        }

        lbs.workspace.photos.delete = this;
        delete this.deps;
        delete this.create;
    }

    ,deleteConfirmed : function deleteConfirmed(e){

        var me = this;

        console.log('delete confirmed-----');

        lbs.modHelper.getMessage ('/workspace/photos/' +me.confirmedDeleteCodes+ '.json'
            , null
            , {modalToHide:'#platformAPIsModal'}, 'DELETE', {codes:me.confirmedDeleteCodes})
            .then(function (data){

                console.log('post succesfull');

                console.log('data', data);

                var i =  me.confirmedDeleteCodes.length;

                console.log('going to delete:',me.confirmedDeleteCodes)

                while(--i>-1){
                    var index =   lbs.util.find({
                        arr:lbs.workspace.photos.listMod.list
                        ,key:'_id'
                        ,val: me.confirmedDeleteCodes[i]
                    });
                    console.log('        index ',  index);

                    if (index > -1) {

                        lbs.workspace.photos.listMod.list.splice(index,1);
                        me.confirmedDeleteCodes.splice(i,1);
                    }

                    console.log('----remaining photos:', lbs.workspace.photos.listMod.list.length);

                }

                $('#platformAPIsModal').modal('hide');

                lbs.modHelper.setContainer({
                    container:'#plaformAPIsModal'
                    ,html:''
                });
                console.log('-----------------after while loop');
                lbs.workspace.photos.listMod.rerender();
            })

    }
    ,deps:[]
};

