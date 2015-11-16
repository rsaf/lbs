/**
 * smm client module, this handles 
 * Service, ServicePonts
 */



//todo*****
//todo the create new and veiw details for services is storing the service point for a specific service(in the modal) in the me.list of the general list, which is supposed to hold the services list of the list view.
//todo*****

    console.log('smm is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};
  lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/services'] = {mod: 'lbs.workspace.services', location: '/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservices'] = {mod: 'lbs.workspace.services.myservices', location: '/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservicepoints'] = {mod: 'lbs.workspace.services.myservicepoints', location: '/workspace/services/main.js'};
  lbs.routes['/workspace/services/myserviceslist'] = {mod:'lbs.workspace.services.myserviceslist',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservicesnew'] = {mod:'lbs.workspace.services.myservicesnew',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservicepointsnew'] = {mod:'lbs.workspace.services.myservicepointsnew',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservicepointsviewedit'] = {mod:'lbs.workspace.services.myservicepointsviewedit',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservicesviewedit'] = {mod:'lbs.workspace.services.myservicesviewedit',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/myservicepointslist'] = {mod:'lbs.workspace.services.myservicepointslist',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/detail'] = {mod:'lbs.workspace.services.detail',location:'/workspace/services/main.js'};
  lbs.routes['/workspace/services/template'] = {mod:'lbs.workspace.services.templates',location:'/workspace/services/template.js'};
  lbs.routes['/workspace/services/busnessrecords'] =
  lbs.routes['/workspace/services/allbookings'] = {mod: 'lbs.workspace.services.common', location: '/workspace/services/main.js'};
  lbs.routes['/workspace/services:list'] = {mod: 'lbs.workspace.services:list', location: '/workspace/services/main.js'};



      
  lbs.modules['/workspace/services'] = {
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.serviceTypes = this.basePath+'/servicetypes.json';
      this.endPoints.myServices = this.basePath+'/services.json';
      this.endPoints.myService = this.basePath+'/service.json';
      this.endPoints.myServicePoints = this.basePath+'/myservicepoints.json';
      this.endPoints.myServiceChange = this.basePath+'/service.json';
      this.endPoints.myServicePoint = this.basePath+'/servicepoint.json';
      this.endPoints.serviceNames = this.basePath+'/servicenames.json';
      this.endPoints.serviceTypes = this.basePath+'/servicetypes.json';
      this.endPoints.servicePointTypes = this.basePath+'/servicepointtypes.json';
      this.endPoints.busnessrecords  = this.basePath+'/busnessrecords.json';
      this.endPoints.allbookings  = this.basePath+'/allbookings.json';



    this.routeParams= {//todo this part was added to keep the moduleconsitent with the other modules and make the pagination work normaly

        '/workspace/services/busnessrecords':{
                 listEndPoint:this.endPoints.busnessrecords
                ,listView:'/workspace/services/busnessrecordsList.html'
                ,container : '.container_bottom'
                ,currentPage:'业务记录'
                ,showcreate:false
        },

        '/workspace/services/myservicepoints': {
            listEndPoint: this.endPoints.myServicePoints
           ,listView:'/workspace/services/myservicepointslistmain.html'
            ,container : '.container_bottom'
            ,currentPage:'我的网点'
            ,showcreate:true
            ,getStatus:function(){
            if(this.status){
                return lbs.settings.messages.status[this.status].text;
            }
            return '';
              }
            },
        '/workspace/services/myservices': {
            listEndPoint: this.endPoints.myServices
           ,listView:'/workspace/services/myserviceslist.html'
           ,container : '.container_bottom'
           ,currentPage:'我的服务'
           ,showcreate:true
           ,getStatus:function(){
             if(this.status||this.status===0){
                return lbs.settings.messages.status[this.status].text;
              }
             return '';
           }
        },
        '/workspace/services/allbookings':{
            listEndPoint:this.endPoints.allbookings
            ,listView:'/workspace/services/allbookingsList.html'
            ,container : '.container_bottom'
            ,currentPage:'所有预约'
            ,showcreate:true
        }
    }


      
      lbs.workspace.services = this;


      delete this.deps;
      delete this.create;
      lbs.modHelper.getMod('/workspace/services:list'); //todo initialize this module here for to enable pagination
      //lbs.modHelper.getMod('/workspace/services/template');//@todo: with working grunt the templates of all of smm can be loaded here
    }
    ,basePath:'/workspace/services'
    ,deps:['/workspace']//@todo: add dep to template.js
    ,PriceList:function PriceList(arg){
      arg = arg || {};
      this.servicePoint = arg.servicePoint;
      this.servicePrices = arg.servicePrices;
      this.discountedPrice = arg.discountedPrice;
      this.appointmentRequeirement = arg.appointmentRequeirement;
      this.paymentMethod = arg.paymentMethod;
      this.remark = arg.remark;
      var index = lbs.util.find({arr:lbs.workspace.services.myservicepointslist.list,key:"_id",val:this.servicePoint});
      if(index!==-1){
        this.pc=lbs.workspace.services.myservicepointslist.list[index].postalCode;
      }
    }
    ,render : function render(arg){
      return this.parent.render(arg);
    }
  };

  lbs.modules['/workspace/services/myservicepoints'] = {
    create:function(){
      this.parent = lbs.workspace.services;
      lbs.workspace.services.myservicepoints = this;
      delete this.deps;
      delete this.create;
    }
    ,handlers:{
      handleNew:function(e){
        lbs.modHelper.getMod('/workspace/services/myservicepointsnew')
        .then(function(e){//@todo: add to list after saving
          lbs.workspace.services.myservicepointsnew.addedNew=lbs.workspace.services.myservicepointslist.addedNew();
          return lbs.workspace.services.myservicepointsnew.render({container:'#platformAPIsModal'});
        }).then(function(){
          $('#platformAPIsModal').modal();
        });
      }
    }
    ,container:'#right_container'
    ,render : function render(arg){


      var  url = $.param.fragment();

      var patern = /LZP/;

      var route  = url;


      if(patern.test(url)){
         route = url.slice(0, url.lastIndexOf('/'));
      };



      var data =  lbs.workspace.services.routeParams[route];

      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/services/myservicepointslist'
        ,mainView:'/workspace/services/main.html'
        ,data:data
      });
    }
    ,deps:['/workspace/services']
  };
  
  lbs.modules['/workspace/services/myservicepointsnew'] = {
    view:''
    ,saving:false
    ,postalMod:null
    ,boundValues:[]
    ,servicePoint : {
      servicePointCode: null
      ,servicePointName:null
      ,status:0
      ,servicePointAddress:null
      ,servicePointType:null
      ,operatingHours:null
      ,contactPerson:null
      ,contactPhone:null
      ,servicePointDescription:null
    }
    ,render : function render(arg){

          console.log('new 4-----');
        var d = arg.defer || jQuery.Deferred();
        var me = this;
        this.modalContainer = arg.container;
        lbs.modHelper.getMessage(lbs.workspace.services.endPoints.servicePointTypes,true,{})
        .then(function(msg){

                console.log('new 3-----');
          var data = {
            parentContainer : arg.container
            ,servicePointTypes : msg.pl
            ,servicePoint:me.servicePoint
            ,noNeed:true
            ,getStatus:function(){
              if(this.servicePoint.status||this.servicePoint.status===0){
                return lbs.settings.messages.status[this.servicePoint.status].text;
              }
            }
            ,typeSelected:lbs.modHelper.createIsSelected(me.servicePoint.servicePointType,'_id')
          };
          var pMod = me.postalMod || lbs.modHelper.getMod('/global:select:postal');
          return jQuery.when(
            pMod
            ,lbs.basemodule['general:list'].parentRender.call(me,{
              listMod:null
              ,mainView:'/workspace/services/myservicepointsnew.html'
              ,data:data
            })
          );
        }).then(function(pmod){
                console.log('new 2-----');

          me.postalMod = pmod;
          return pmod.render({
            boundTo:me.servicePoint
            ,key:'postalCode'
            ,container:'.servicepoint-select-postal'
            ,view:"/workspace/services/selectpostal.html"
          })
        }).then(function(){

                console.log('new 1-----');
          me.boundValues = lbs.binder.bind(me.modalContainer,me.servicePoint,'servicePoint');
          lbs.binder.updateUI(me.boundValues)
          lbs.basemodule.pageComplete();
          d.resolve();
        });
        return d.promise();
    }
    ,remove:function remove(arg){
      lbs.binder.unbind(this.boundValues);
      this.postalMod.remove();
    }
    ,saveServicePoint : function(e){
      e.preventDefault();
      var me = this;
      if(this.saving){
        return;//do not do this if user clicks button again
      }
      this.saving=true;
      //@todo: talk to designer, what to show for loading
      var me = this;
      //@todo:here we should see if it's valid before submitting
      lbs.modHelper.getMessage(
            lbs.workspace.services.endPoints.myServicePoint//end point
            ,false//do not cache
            ,{//recover options
              message:'You have to log in to save this service point.'//@todo: should be in a settings file
             ,modalToHide:me.modalContainer
            }
            ,'POST'
            ,{json:JSON.stringify({pl:{servicePoint:this.servicePoint}})})//data to post
      .then(function resolve(msg){
        //@todo: what if we fail (user cancels login or re connect)
        //re set to clean values and close the dialog
        me.addedNew(msg.pl);
        me.servicePoint = {
          servicePointCode: null
          ,servicePointName:null
          ,servicePointStatus:null
          ,servicePointAddress:null
          ,servicePointType:null
          ,operatingHours:null
          ,contactPerson:null
          ,contactPhone:null
          ,servicePointDescription:null
        };
        me.postalMod.resetValues();
        jQuery(me.modalContainer).modal('hide');
        jQuery(me.modalContainer).html('');//this will let jquery clean up event listeners
        me.saving=false;
        //@todo: remove handlers and listeners      
      },function reject(reason){
        me.saving = false;
        alert('Unable to save:'+reason);
      });
    }
    ,create : function(){
      var me = this;
      this.handlers.saveServicePoint = function(e){
        me.saveServicePoint(e);
      };
      lbs.workspace.services.myservicepointsnew = this;
      delete this.deps;
      delete this.create;
    }
    ,handlers : {
    }
    ,deps:['/workspace/services']
  };
  
  lbs.modules['/workspace/services/myservicepointsviewedit'] = {
    view:''
    ,saving:false
    ,boundValues:[]
    ,servicePoint : {}
    ,changeServicePoint : {}
    ,entityChange : function(entity,key){
      this.changeServicePoint[key]=entity[key];
    }
    ,render : function render(arg){
        this.changeServicePoint={};
        var d = arg.defer || jQuery.Deferred();
        var me = this;
        this.modalContainer = arg.container;
        lbs.modHelper.getMessage(
            lbs.workspace.services.endPoints.myServicePoint
            , false//do not cache
            , {//recover options
              message: 'You have to log in to continue.'//@todo: should be in a settings file
            }
            , 'GET'
            , {_id: arg.entityId}
        )
        .then(function(msg){
          me.servicePoint=msg.pl;
          me.servicePoint.servicePointType=me.servicePoint.servicePointType?me.servicePoint.servicePointType._id:undefined;
          return lbs.modHelper.getMessage(lbs.workspace.services.endPoints.servicePointTypes,true,{})
        })
        .then(function(msg){
          var data = {
            parentContainer : arg.container
            ,servicePointTypes : msg.pl
            ,servicePoint:me.servicePoint
            ,typeSelected:lbs.modHelper.createIsSelected(me.servicePoint.servicePointType,'_id')
            ,getStatus:function(){
              if(this.servicePoint.status){
                return lbs.settings.messages.status[this.servicePoint.status].text;
              }
            }
          };
          return jQuery.when(
            lbs.modHelper.getMod('/global:select:postal')
            ,lbs.basemodule['general:list'].parentRender.call(me,{
              listMod:null
              ,mainView:'/workspace/services/myservicepointsnew.html'
              ,data:data
            })
          );
        })
        .then(function(pmod){
          return pmod.render({
            boundTo:me.servicePoint
            ,key:'postalCode'
            ,container:'.servicepoint-select-postal'
            ,view:"/workspace/services/selectpostal.html"
            ,changeListener:function(o,key){
              me.entityChange(o,key);
            }
          })
        })
        .then(function(){
          me.updated=lbs.workspace.services.myservicepointslist.updated();
          me.boundValues=lbs.binder.bind(me.modalContainer,me.servicePoint,'servicePoint'
                  ,[function(entity,key){me.entityChange(entity,key);}]);
          lbs.binder.updateUI(me.boundValues);
          jQuery(me.modalContainer).find('input,textarea,select').prop('disabled',true);
          if(me.servicePoint.status!==30||lbs.user.userType==='admin'){
            jQuery('.servicepoint_editButton').show();
          }
          jQuery('.servicepoint_saveButton').hide();
          jQuery('.selectpicker').selectpicker('refresh');
          lbs.basemodule.pageComplete();
          jQuery(me.modalContainer).modal()
          d.resolve();
        });
        return d.promise();
    }
    ,saveServicePoint : function(e){
      e.preventDefault();
      var me = this;
      if(this.saving){
        return;//do not do this if user clicks button again
      }
      this.saving=true;
      //@todo: talk to designer, what to show for loading
      var me = this;
      //@todo:here we should see if it's valid before submitting
      this.changeServicePoint._id = this.servicePoint._id;
      lbs.modHelper.getMessage(
            lbs.workspace.services.endPoints.myServicePoint//end point
            ,false//do not cache
            ,{//recover options
              message:'You have to log in to save this service point.'//@todo: should be in a settings file
             ,modalToHide:me.modalContainer
            }
            ,'PUT'
            ,{json:JSON.stringify({pl:{servicePoint:this.changeServicePoint}})})//data to post
      .then(function resolve(msg){
        //@todo: dont add it but replace an existing one
        me.updated(msg.pl);
        jQuery(me.modalContainer).modal('hide');
        jQuery(me.modalContainer).html('');//this will let jquery clean up event listeners
        me.saving=false;
        //@todo: remove handlers and listeners      
      },function reject(reason){
        me.saving = false;
        alert('Unable to save:'+reason);
      });
    }
    ,enableEdit : function enableEdit(e){
      this.viewOnly=false;
      jQuery(this.modalContainer).find('input,textarea,select').prop('disabled',false);
      jQuery('.selectpicker').selectpicker('refresh');
      jQuery('.servicepoint_editButton').hide();
      jQuery('.servicepoint_saveButton').show();
    }
    ,create : function(){
      var me = this;
      this.handlers.saveServicePoint = function(e){
        me.saveServicePoint(e);
      };
      this.handlers['servicepoint:enableEdit']=function(e){me.enableEdit(e);};
      lbs.workspace.services.myservicepointsviewedit = this;
      delete this.deps;
      delete this.create;
    }
    ,remove : function remove(arg){
      lbs.binder.unbind(this.boundValues);
    }
    ,handlers : {
    }
    ,deps:['/workspace/services']
  };

  lbs.modules['/workspace/services/myservices'] = {
    container : '#right_container'
    ,handlers:{
      handleNew:function(e){
        // load myservicesnew init has to be called by me!! if no container is passed we have a problem
        lbs.modHelper.getMod('/workspace/services/myservicesnew')
        .then(function(mod){
          mod.addedNew=lbs.workspace.services.myserviceslist.addedNew();//set it to a closure (the result of addednew)
          mod.viewOnly=false;
          return mod.render({container:'#platformAPIsModal'});
        }).then(function(){
          $('#platformAPIsModal').modal();
          jQuery('.service-edit-new-select-name').trigger('change');
        });
      }
    }
    ,create : function(){
      var me = this;
      this.handlers['myservices:search']=function(e){
        me['myservices:search'](e);
      };
      this.parent = lbs.workspace.services;
      lbs.workspace.services.myservices = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){




      var  url = $.param.fragment();

      var patern = /LZS/;

      var route  = url;

      if(patern.test(url)){
        route = url.slice(0, url.lastIndexOf('/'));
      };



      var data =  lbs.workspace.services.routeParams[route];


      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/services/myserviceslist'
        ,mainView:'/workspace/services/main.html'
        ,data:data
      });
    }
    ,'myservices:search':function(e){
      e.preventDefault();
    }
    ,remove : function(){
      lbs.workspace.services.myservicesnew.remove();
    }
    ,deps : ['/workspace/services/myservicesnew']//'/workspace/services' is satisfied by myservicesnew
  };  
  
  lbs.modules['/workspace/services/myserviceslist'] = {
    view:''
    ,pageSize:10
    ,index:0
    ,list:[]
    ,create : function(){
      var me = this;
      this.handlers['service:detail']=function(e){me.openDetail(e);};
      this.handlers['service:delete']=function(e){
        lbs.basemodule["general:list"].deleteEntity({
          type:'服务'
          ,code:'serviceCode'
          ,entityName:'service'
          ,listMod:me
          ,updateEndpoint:lbs.workspace.services.endPoints.myService
          ,_id:e.target.getAttribute('data-id')
        });
      };
      lbs.workspace.services.myserviceslist = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      var me = this;
      arg.listView = arg.viewUrl || '/workspace/services/myserviceslist.html';
      arg.listEndPoint = lbs.workspace.services.endPoints.myServices;
      return lbs.basemodule['general:list'].render.call(this,arg);
    }
    ,rerender : function rerender(arg){
      var me = this;
      arg = arg || {};
      arg.getStatus=function(){
        if(this.status||this.status===0){
          return lbs.settings.messages.status[this.status].text;
        }
        return '';
      }
      return lbs.basemodule["general:list"].rerender.call(this,arg)
          .then(function(){
            lbs.actionHandler({
              container:me.containerToSet
              ,handlers:me.handlers
            });
          });
    }
    ,removeItem:function removeItem(id){
      var index = lbs.util.find({arr:this.list,val:id,key:'_id'});
      if(index!==-1){
        this.list.splice(index,1);
        this.rerender();
      }
    }
    ,addedNew:function(){
      var me = this;//return a closue so we know this whatever the invoking object is
      return function(service){
        me.list.unshift(service);
        lbs.modHelper.getView("/workspace/services/myserviceslist.html")
        .then(function(view){
          lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{
              items:lbs.basemodule.fillup(me.list.slice(me.index,me.index+me.pageSize),me.pageSize)
              ,getStatus:function(){
                if(this.status||this.status===0){
                  return lbs.settings.messages.status[this.status].text;
                }
                return '';
              }
            }),container:me.containerToSet
            });
          lbs.actionHandler({
            container:me.containerToSet
            ,handlers:me.handlers
          });
          
        });
      };
    }
    ,updated:function(){
      var me = this;//return a closue so we know this whatever the invoking object is
      return function(service){
        var index=-1,i=me.list.length;
        while(--i>-1){
          if(me.list[i]._id===service._id){
            me.list[i]=service;
            break;
          }
        }
        lbs.modHelper.getView("/workspace/services/myserviceslist.html")
        .then(function(view){
          lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{
              items:lbs.basemodule.fillup(me.list.slice(me.index,me.index+me.pageSize),me.pageSize)
              ,getStatus:function(){
                if(this.status||this.status===0){
                  return lbs.settings.messages.status[this.status].text;
                }
                return '';
              }
            }),container:me.containerToSet});
          lbs.actionHandler({
            container:me.containerToSet
            ,handlers:me.handlers
          });
          
        });
      };
    }
    ,deps:['/workspace/services']
    ,openDetail : function openDetail(e){
        lbs.modHelper.getMod('/workspace/services/myservicesviewedit')
        .then(function(mod){
          return mod.render({
            container:'#platformAPIsModal'
            ,entityId:e.target.getAttribute('data-id')
          });
        });
     }
    ,handlers:{}
  };
  
  lbs.modules['/workspace/services/myservicesnew'] = {
    view:''
    ,addToList:null
    ,saving:false
    ,boundValues:[]
    ,boundPriceLists:{}
    ,service : {
      PriceList:[]
      ,status:0
    }
    ,create : function(){
      var me = this;
      this.handlers.saveService = function(e){
        me.saveService(e);
      };
      this.handlers['service:new:add:PriceList'] = function(e){
        me.addPriceList(e);
      }
      this.handlers['myservices:select:allServicePoints'] = function(e){

          lbs.modHelper.getMod('/workspace/services/myservicesviewedit')
              .then(function(mod){
                  mod.selectAllServicePoints(e);
              });

          }

      lbs.workspace.services.myservicesnew = this;
      delete this.deps;
      delete this.create;
    }

    ,render : function render(arg){
      var d = jQuery.Deferred();
      var me = this;
      arg.parentContainer = arg.container;

      arg.container = '#myservicesnew\\\:servicepoints';
      this.addTolist=arg.addToList;
      arg.service = this.service;
      arg.standardReservationRequest=[{val:'0',text:'否'},{val:'1',text:'是'}];
      arg.standardPayment=lbs.settings.messages.standardPayment;
      arg['priceListHelper'] = function(entityList,key){
        var helper = {item:{}};
        helper.init = function(){
          var itemIndex = lbs.util.find({
            arr:entityList
            ,key:key
            ,val:this._id
          });
          helper.item={};helper.isSelected='';
          if(itemIndex!==-1){
            helper.isSelected = 'checked=""';
          }
        };
        return helper;
      }(this.service.PriceList,'servicePoint');
      arg.viewOnly=this.viewOnly;
      arg.withPadding=false;
      this.containerToSet = arg.container;
      this.modalContainer = arg.parentContainer;
      lbs.modHelper.getMessage(
          lbs.workspace.services.endPoints.serviceNames
          ,false
          ,{}
      ).then(function(msg){
            arg.serviceNames = msg.pl;
            return lbs.modHelper.getMessage(
                lbs.workspace.services.endPoints.serviceTypes
                ,true
                ,{});
          }).then(function(msg){
            arg.showTB=function(){
              if(me.serviceFromSL===''||me.serviceFromSL===undefined){
                return 'display:none';
              }
            };
            arg.getStatus=function(){
              console.log('in getstatus:',this)
              if(this.service.status||this.service.status===0){
                return lbs.settings.messages.status[this.service.status].text;
              }
            };

            arg.serviceTypes = msg.pl;
            arg.viewUrl = '/workspace/services/myservicepointslist.html';


            return lbs.basemodule['general:list'].parentRender.call(me,{
              listMod:"/workspace/services/myservicepointslist"
              ,mainView:'/workspace/services/myservicesnew.html'
              ,data:arg
            });
          }).then(function(){

            $('.spinnerPlaceHolder').removeClass('spinnerContainerAbsolute');//todo this is a quick fix to remove the spinner on create service and view detail. this should handled the same way it is being do for create service point or view serice point details,ie: without showing the spinner at all.

            jQuery(me.modalContainer).on('hidden.bs.modal.service.new',function(e){
              me.remove();
            });
            me.boundValues = lbs.binder.bind(arg.parentContainer,me.service,'service');
            lbs.binder.updateUI(me.boundValues);
            me.rebindPriceList();
            lbs.basemodule.pageComplete();
            d.resolve();
          });
      return d.promise();
    }
    ,addPriceList : function addPriceList(e){
      var itemIndex = lbs.util.find({
        arr:this.service.PriceList
        ,key:'servicePoint'
        ,val:e.target.value
      });

      if(e && e.target && e.target.checked){
        var PriceList;
        PriceList = new lbs.workspace.services.PriceList({
          servicePoint : e.target.value
          ,servicePrices : this.service.standardServicePrice
          ,discountedPrice : this.service.standardPricing
          ,appointmentRequeirement : this.service.standardReservationRequest
          ,paymentMethod : this.service.standardPayment
          ,remark : this.service.standardServiceNotes
        });
        PriceList.clientCommandAddNew=true;
        this.service.PriceList.push(PriceList);
        itemIndex=this.service.PriceList.length-1;
        this.boundPriceLists[e.target.value]=lbs.binder.bind('#'+e.target.value,PriceList,'priceDetail');
        lbs.binder.updateUI(this.boundPriceLists[e.target.value]);
      }
      if(e && e.target && !e.target.checked){
        if(itemIndex!==-1){
          this.service.PriceList.splice(itemIndex,1);
          this.unbindPriceListItem(e.target.value);
        }
      }
      return itemIndex;
    }
    ,rebindPriceList : function rebindPriceList(){
      var i = -1,pl=this.service.PriceList;len=pl.length,me=this;
      while(++i<len){
        this.boundPriceLists[pl[i].servicePoint] = lbs.binder.bind('#'+pl[i].servicePoint,pl[i],'priceDetail'
                ,[function(obj){me.payListItemUpdate(obj);}]);
        lbs.binder.updateUI(this.boundPriceLists[pl[i].servicePoint]);
      }
    }
    ,payListItemUpdate:function payListItemUpdate(obj,key){}
    ,unbindPriceListItem : function(key){
      lbs.binder.unbind(this.boundPriceLists[key]);
      delete this.boundPriceLists[key];
    }
    ,saveService : function(e){
      e.preventDefault();
      var validator = lbs.validator.create('service');
      var me = this;
      if(this.saving){
        return;//do not do this if user clicks button again
      }
      this.saving=true;
      var me = this;
      if(this.service.serviceFromSL!=='--fromtb--'&&this.service.serviceFromSL!==undefined){
        this.service.serviceName=this.service.serviceFromSL;
      }else{
        this.service.serviceName=this.service.serviceFromTB;
      }
      this.service.standardReservationRequest=this.service.standardReservationRequest==='0'?false:true;
      var valMsg = validator.validate({val:this.service});
      if(valMsg!==true){
        alert(valMsg);
        this.saving=false;
        return;
      }
      lbs.modHelper.getMessage(
            lbs.workspace.services.endPoints.myServiceChange//end point
            ,false//do not cache
            ,{//recover options
              message:'You have to log in to save this service.'//@todo: should be in a settings file
             ,modalToHide:me.modalContainer
            }
            ,'POST'
            ,{json:JSON.stringify({pl:{service:this.service}})}
      ).then(function resolve(msg){
        //re set to clean values and close the dialog
        me.addedNew(msg.pl);
        me.service = {PriceList:[],status:0};
        jQuery(me.modalContainer).modal('hide');  //todo hiding modal here
        jQuery(me.modalContainer).html('');//this will let jquery clean up event listeners
        me.saving=false;
      },function reject(e){
        alert('Cannot save,'+e);
        me.saving=false;
      });
    }

    ,remove : function(arg){
      lbs.binder.unbind(this.boundValues);
      this.boundValues=[];
      var key;
      for(key in this.boundPriceLists){
        if(Object.prototype.hasOwnProperty.call(this.boundPriceLists)){
          this.unbindPriceListItem(key);
        }
      }
      //in create set handlers closeWindow to a closure that calls remove
      jQuery(this.modalContainer).off('hidden.bs.modal.service.new');
    }

    ,handlers : {
      nameSelectChange:function(e){
        var showhide=(e.target.value==='--fromtb--')?'show':'hide';
        $('#service\\\:new\\\:name\\\:row')[showhide]();
      }
    }
    ,deps:['/workspace/services']
  };


  lbs.modules['/workspace/services/myservicesviewedit'] = {
    view:''
    ,addToList:null
    ,newMod:null
    ,saving:false
    ,boundValues:[]
    ,boundEdit:[]
    ,boundPriceLists:{}
    ,service : {PriceList:[]}
    ,editService:{PriceList:[]}
    ,create : function(){
      var me = this;
      this.handlers.saveService = function(e){me.saveService(e);};
      this.handlers['service:enableEdit']=function(e){me.enableEdit(e);};
      this.handlers['service:new:add:PriceList'] = function(e){
        me.addPriceList(e);
      }

      this.handlers['myservices:select:allServicePoints'] = function(e){
          me.selectAllServicePoints(e);
      }

      lbs.workspace.services.myservicesviewedit = this;
      lbs.modHelper.getMod("/workspace/services/myservicesnew")
          .then(function(mod){
            me.newMod=mod;
          });
      delete this.deps;
      delete this.create;
    }

    ,render : function render(arg){
      this.editService={PriceList:[]};
      var d = jQuery.Deferred();
      var me = this;
      lbs.modHelper.getMessage(
          lbs.workspace.services.endPoints.myService
          , false//do not cache
          , {//recover options
            message: 'You have to log in to continue.'//@todo: should be in a settings file
          }
          , 'GET'
          , {_id: arg.entityId}
      ).then(function(msg){
            me.service=msg.pl;
            me.service.serviceFromTB=msg.pl.serviceName.text;
            me.service.serviceFromSL=msg.pl.serviceName._id;
            me.service.serviceType=(me.service.serviceType)?me.service.serviceType._id:undefined;
            me.service.standardReservationRequest = (me.service.standardReservationRequest)?'1':'0';
            var i = -1,len = me.service.PriceList.length;
            while(++i<len){
              me.service.PriceList[i].appointmentRequeirement=(me.service.PriceList[i].appointmentRequeirement)?'1':'0';
            }
            me.viewOnly=true;
            me.updated=lbs.workspace.services.myserviceslist.updated();
            return me.newMod.render.call(me,arg);
          }).then(function(){
            me.boundEdit = lbs.binder.bind(arg.parentContainer,me.editService,'service'
                ,[function(entity,key){me.nameChangeListener(entity,key)}]);
            lbs.binder.cancelUpdateObject(me.boundEdit);
            jQuery(me.modalContainer).modal();
            jQuery(me.modalContainer).find('input,textarea,select').prop('disabled',true);
            if(me.service.status!==30||lbs.user.userType==='admin'){
              jQuery('.service_editButton').show();
            }
            jQuery('.service_saveButton').hide();
            jQuery('.selectpicker').selectpicker('refresh');
            d.resolve();
          });
      return d.promise();
    }
    ,nameChangeListener:function nameChangeListener(entity,key){
      if(entity[key]==='--fromtb--'){
        this.editService.serviceName=entity.serviceFromTB;
      }else if(key==='serviceFromTB'){
        this.editService.serviceName=entity.serviceFromTB;
      }else if(key==='serviceFromSL'){
        this.editService.serviceName=entity.serviceFromSL;
      }
    }
    ,addPriceList : function addPriceList(e){
      var itemIndex = lbs.util.find({
        arr:this.service.PriceList
        ,key:'servicePoint'
        ,val:e.target.value
      });
      var me = this;
      var PriceList;
      if(e && e.target && e.target.checked){
        if(itemIndex!==-1&&this.service.PriceList[itemIndex]._id){
          PriceList=this.service.PriceList[itemIndex];
          PriceList.clientCommandUpdate=true;
          delete PriceList.clientCommandRemove;
        }else{
          PriceList = new lbs.workspace.services.PriceList({
            servicePoint : e.target.value
            ,servicePrices : this.service.standardServicePrice
            ,discountedPrice : this.service.standardPricing
            ,appointmentRequeirement : this.service.standardReservationRequest
            ,paymentMethod : this.service.standardPayment
            ,remark : this.service.standardServiceNotes
          });
          PriceList.clientCommandAddNew=true;
          this.service.PriceList.push(PriceList);
          itemIndex=this.service.PriceList.length-1;
        }
        this.boundPriceLists[e.target.value]=lbs.binder.bind('#'+e.target.value,PriceList,'priceDetail'
          ,[function(obj){me.payListItemUpdate(obj);}]);
        lbs.binder.updateUI(this.boundPriceLists[e.target.value]);
        jQuery('#'+e.target.value).find('.selectpicker').selectpicker('refresh');//select goes
      }
      if(e && e.target && !e.target.checked){
        if(itemIndex!==-1){
          if(this.service.PriceList[itemIndex]._id){
            this.service.PriceList[itemIndex].clientCommandRemove=true;
            delete this.service.PriceList[itemIndex].clientCommandUpdate;
          }else{
            this.service.PriceList.splice(itemIndex,1);
          }
          this.unbindPriceListItem(e.target.value);
        }
      }
    }
    ,rebindPriceList : function rebindPriceList(){
      this.newMod.rebindPriceList.call(this);
    }
    ,unbindPriceListItem : function(key){
      this.newMod.unbindPriceListItem.call(this,key);
    }
    ,enableEdit : function enableEdit(e){
      this.viewOnly=false;
      jQuery(this.modalContainer).find('input,textarea,select').prop('disabled',false);
      jQuery('.selectpicker').selectpicker('refresh');
      jQuery('.service_editButton').hide();
      jQuery('.service_saveButton').show();
      //@todo: re render the list with pricelist first and service points after that
    }
    ,remove : function(arg){
      lbs.binder.unbind(this.boundEdit);
      this.newMod.remove.call(this);
    }
    ,selectAllServicePoints:function selecAllServicePoints(e){

          var me = this;

              if($('.selectAllCheckbox')[0].checked===false){

                  $('.selectAllCheckbox')[0].checked = false;

                  $('.createNewServiceTableContainer').find('input[type="checkbox"]').each(function(){

                      if($(this).hasClass('priceListCheckbox')){

                          $(this).trigger('click');
                          this.checked = false;

                      }

                  });



              }
              else{

                  $('.selectAllCheckbox')[0].checked = true;

                  $('.createNewServiceTableContainer').find('input[type="checkbox"]').each(function(){

                      if($(this).hasClass('priceListCheckbox')){

                          if(!$(this).prop('checked')){

                              $(this).trigger('click');
                              this.checked= true;
                          }
                      }

                  });


              }










      }
    ,payListItemUpdate:function payListItemUpdate(obj,key){
      obj.clientCommandUpdate=obj.clientCommandAddNew?false:true;
    }
    ,saveService : function(e){
      e.preventDefault();
      var validator = lbs.validator.create('service');
      var me = this;
      if(this.saving){
        return;//do not do this if user clicks button again
      }
      this.saving=true;
      //@todo: talk to designer, what to show for loading
      var me = this;
      delete this.editService.serviceFromSL;
      delete this.editService.serviceFromTb;
      this.editService.standardReservationRequest=this.editService.standardReservationRequest==='0'?false:true;
      this.editService._id = this.service._id;
      this.editService.PriceList=this.service.PriceList;
      var valMsg = validator.validate({val:this.service});
      if(valMsg!==true){
        alert(valMsg);
        this.saving=false;
        return;
      }
      //this.saving=false;return;
      lbs.modHelper.getMessage(
            lbs.workspace.services.endPoints.myServiceChange//end point
            ,false//do not cache
            ,{//recover options
              message:'You have to log in to save this service.'//@todo: should be in a settings file
             ,modalToHide:me.modalContainer
            }
            ,'PUT'
            ,{json:JSON.stringify({pl:{service:this.editService}})}
      ).then(function resolve(msg){
        //re set to clean values and close the dialog
        me.updated(msg.pl);
        me.service = {PriceList:[]};
        jQuery(me.modalContainer).modal('hide');
        jQuery(me.modalContainer).html('');//this will let jquery clean up event listeners
        me.saving=false;
      },function reject(e){
        alert('Cannot save,'+e);
        me.saving=false;
      });
    }

    ,handlers : {
      nameSelectChange:function(e){
        var showhide=(e.target.value==='--fromtb--')?'show':'hide';
        $('#service\\\:new\\\:name\\\:row')[showhide]();
      }
    }
    ,deps:['/workspace/services']
  };

  lbs.modules['/workspace/services/myservicepointslist'] = {
    view:''
    ,pageSize:10
    ,index:0
    ,list:[]
    ,create : function(){
          var me = this;


          this.handlers['servicepoint:detail']=function(e){me.openDetail(e);};
          this.handlers['servicepoint:delete']=function(e){
              lbs.basemodule["general:list"].deleteEntity({
                  type:'网点'
                  ,code:'servicePointCode'
                  ,entityName:'servicePoint'
                  ,listMod:me
                  ,name:'servicePointName'
                  ,updateEndpoint:lbs.workspace.services.endPoints.myServicePoint
                  ,_id:e.target.getAttribute('data-id')
              });
          };



          lbs.workspace.services.myservicepointslist = this;
          delete this.deps;
          delete this.create;
      }

    ,render : function render(arg){


      var me = this;
      arg.listView = arg.viewUrl || "/workspace/services/myservicepointslistmain.html";
      arg.listEndPoint = lbs.workspace.services.endPoints.myServicePoints;
      return lbs.basemodule['general:list'].render.call(this,arg);
    }
     ,addedNew:function(){
          var me = this;//return a closue so we know this whatever the invoking object is
          return function(servicePoint){
              me.list.unshift(servicePoint);
              lbs.modHelper.getView(me.viewUrl)
                  .then(function(view){
                      lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{
                          items:lbs.basemodule.fillup(me.list.slice(me.index,me.index+me.pageSize),me.pageSize)
                          ,getStatus:function(){
                              if(this.status){
                                  return lbs.settings.messages.status[this.status].text;
                              }
                              return '';
                          }
                      }),container:me.containerToSet});
                      lbs.actionHandler({
                          container:me.containerToSet
                          ,handlers:me.handlers
                      });
                  });
          };
      }
     ,updated:function(){
          var me = this;//return a closue so we know this whatever the invoking object is
          return function(servicePoint){
              var index=-1,i=me.list.length;
              while(--i>-1){
                  if(me.list[i]._id===servicePoint._id){
                      me.list[i]=servicePoint;
                      break;
                  }
              }
              lbs.modHelper.getView("/workspace/services/myservicepointslistmain.html")
                  .then(function(view){
                      lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{
                          items:lbs.basemodule.fillup(me.list.slice(me.index,me.index+me.pageSize),me.pageSize)
                          ,getStatus:function(){
                              if(this.status){
                                  return lbs.settings.messages.status[this.status].text;
                              }
                              return '';
                          }
                      }),container:me.containerToSet});
                      lbs.actionHandler({
                          container:me.containerToSet
                          ,handlers:me.handlers
                      });
                  });
          };
      }
     ,removeItem:function removeItem(id){
      var index = lbs.util.find({arr:this.list,val:id,key:'_id'});
      if(index!==-1){
        this.list.splice(index,1);
        this.rerender();
      }
    }

     ,openDetail : function openDetail(e){
          lbs.modHelper.getMod('/workspace/services/myservicepointsviewedit')
              .then(function(mod){

                  return mod.render({
                      container:'#platformAPIsModal'
                      ,entityId:e.target.getAttribute('data-id')
                  });

              });
      }
     ,rerender : function rerender(arg){
      var me = this;
      arg = arg || {};
      arg.getStatus=function(){
        if(this.status){
          return lbs.settings.messages.status[this.status].text;
        }
        return '';
      }
      return lbs.basemodule["general:list"].rerender.call(this,arg)
      .then(function(){
        lbs.actionHandler({
          container:me.containerToSet
          ,handlers:me.handlers
        });
      });
    }

    ,handlers:{}
    ,deps:['/workspace/services']
  };

  lbs.modules['/workspace/services/detail'] = {
    container:'nothing'
    ,render : function render(arg){
      //@todo: use url like /workspace/services/myservices/LZP...... or /workspace/services/myservices/LZS......
      var url = jQuery.param.fragment().split("/");
      var code = url.pop();


      var patern = /LZS/;




      var mod = 'myservicepoints';

      if(patern.test(code)){
         mod = 'myservices';
      }

      var modContainer = '#platformAPIsModal';
      var id = code;
      return lbs.modHelper.getMod('/workspace/services/'+mod)
      .then(function(mod){

        return mod.render();
      })
      .then(function(){

        return lbs.modHelper.getMod('/workspace/services/'+mod+'viewedit');
      })
      .then(function(mod){

        return mod.render({
          container:modContainer
          ,entityId:id
        });
      });
    }
    ,create : function(){
      lbs.workspace.services.detail = this;
      delete this.deps;
      delete this.create;
    }
    ,deps:['/workspace/services']
  };

  lbs.modules['/workspace/services/busnessrecords'] = 
  lbs.modules['/workspace/services/allbookings'] =  {
  create:function(){
    this.parent = lbs.workspace.services;
    this.endPoints={};
    this.endPoints.busnessrecords = this.basePath+'/busnessrecords.json';
    this.endPoints.allbookings = this.basePath+'/allbookings.json';
    this.routeParams={
      '/workspace/services/allbookings':{
        listEndPoint:this.endPoints.allbookings
        ,listView:'/workspace/services/allbookingsList.html'
        ,currentPage:'所有预约'
      }
      ,'/workspace/services/busnessrecords':{
        listEndPoint:this.endPoints.busnessrecords
        ,listView:'/workspace/services/busnessrecordsList.html'
        ,currentPage:'业务记录'
      }
    };
    var me = this;
    this.handlers['services:createNew']=function(e){
        me.createNew(e);
    }

    lbs.workspace.services.common = this;


    delete this.deps;
    delete this.create;
  }
  ,basePath:'/workspace/services'
  ,deps:['/workspace/services']
  ,container:'#right_container'
  ,routeParams:null
  ,render : function render(arg){
    var data = {
      container : '.container_bottom'
    };
    return lbs.basemodule['general:list'].parentRender.call(this,{
      listMod:'/workspace/services:list'
      ,mainView:'/workspace/services/main.html'
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
        ,container:'#platformAPIsModal'
        ,view:''
        ,templateData:{}
      });
    });
  }
};
  lbs.modules['/workspace/services:list'] = {
  view:''
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,container:'.container_bottom'
  ,index:0


  ,create : function(){

          var me = this;
      lbs.workspace.services.list = this;

      delete this.deps;
      delete this.create;
  }


  ,render : function render(arg){


          var me = this;
          arg = arg||{};
          var url = $.param.fragment();

          var module = url.slice(url.lastIndexOf('/')+1);
          var currentListMod = lbs.workspace.services[module+'list'];
          var currentMod = lbs.workspace.services[module];
          var data =  lbs.workspace.services.routeParams[url];
          lbs.util.merge(data, arg);

          arg.listView = arg.listView || view;

    return lbs.basemodule['general:list'].render.call(this,arg)
        .then(function(){

            lbs.actionHandler({
                container:me.container
                ,handlers:currentListMod?currentListMod.handlers:{}
            });

            lbs.actionHandler({
                container:'.container_top'
                ,handlers:currentMod?currentMod.handlers:{}
            });

        });
  }
  ,rerender : function rerender(arg){
    return lbs.basemodule['general:list'].rerender.call(this,arg);
  }
  ,handlers:{}
  ,deps:['/workspace/services']
};
