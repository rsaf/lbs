/**
 * publishing client module, this handles 
 * Service, ServicePonts
 * written by Harm Meijer: harmmeiier@gmail.com
 */
    console.log('publishing is loaded...');
  //registration routers/modules of publishing if not already registered
  lbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};
  lbs.routes['/workspace:nomenu'] = {mod: 'lbs.workspace:nomenu', location: '/workspace/main.js'};
  lbs.routes['/workspace/publishing'] = {mod: 'lbs.workspace:nomenu.publishing', location: '/workspace/publishing/main.js'};
  lbs.routes['/workspace/publishing/activities'] = {mod: 'lbs.workspace:nomenu.publishing.activities', location: '/workspace/publishing/main.js'};
  lbs.routes['/workspace/publishing/activities:form:new'] = {mod: 'lbs.workspace:nomenu.publishing.activities:form:new', location: '/workspace/publishing/main.js'};
  lbs.routes['/workspace/publishing/activities:list:new'] = {mod: 'lbs.workspace:nomenu.publishing.activities:list:new', location: '/workspace/publishing/main.js'};
  lbs.routes['/workspace/publishing/activities:select:service'] = {mod: 'lbs.workspace:nomenu.publishing.activities:select:service', location: '/workspace/publishing/main.js'};


      
  lbs.modules['/workspace/publishing'] = {
    endPoints:{}
    ,create:function(){
      this.parent = lbs['workspace:nomenu'];
      lbs['workspace:nomenu'].publishing = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/publishing'
    ,deps:['/workspace:nomenu']
    ,render : function render(arg){
      return this.parent.render(arg);
    }
  };

  lbs.modules['/workspace/publishing/activities'] = {
   // container : '#right_container'
    container : '#main_container'
    ,postalMod:false
    ,endPoints:{}
    ,handlers:{}
    ,boundValues:[]
    ,businessActivity:null
    ,handleNew:function(e){
      e.preventDefault();
      lbs.modHelper.getMod('/workspace/publishing/activities:form:new')
      .then(function(newMod){
        newMod.render({container:'#formDesigner'});
      });
    }
    ,savedFormMeta:function savedFormMeta(formMeta){
      var me = this;
      var ba = {fm:formMeta._id,_id:this.businessActivity._id};
      lbs.util.merge(formMeta,this.businessActivity.fm);
      return jQuery.when(
              lbs.modHelper.getMessage(this.endPoints.activity,false,{},'PUT'
                ,{json:JSON.stringify({pl:{"activity":ba}})})
              ,this.renderFormList()
              //@todo: hit the activity endpoint with the form _id
      );
    }
    ,renderFormList:function renderFormList(){
      var me = this;
      if(this.businessActivity.fm.fc){
        jQuery('.serviceListCreateForm').hide();
      }
      return lbs.modHelper.getView('/workspace/publishing/formlist.html')
      .then(function(view){
        jQuery('.activities-form-list').html(
          Mustache.render(view,me.businessActivity)
        );
        lbs.actionHandler({container:".activities-form-list",handlers:me.handlers});
      });
    }
    ,renderQueryList:function renderQueryList(){
      var me = this;
      var arr = me.businessActivity.sqc||[{}];
      return lbs.modHelper.getView('/workspace/publishing/querylist.html')
      .then(function(view){
        jQuery('.publishing_activities_query_list').html(
          Mustache.render(view,{items:arr})
        );
        lbs.actionHandler({container:'.publishing_activities_query_list',handlers:me.handlers});
      });
    }
    ,deleteQuery:function deleteQuery(e){
      var me = this;
      var id = e.target.getAttribute('data-id'),
              index=lbs.util.find({arr:this.businessActivity.sqc,key:'_id',val:id});
      if(index!==-1){
        this.businessActivity.sqc.splice(index,1);
      }
      return lbs.modHelper.getMessage(this.endPoints.activity,false,{},'PUT'
        ,{json:JSON.stringify({pl:{activity:{_id:this.businessActivity._id,sqc:this.businessActivity.sqc}}})})
      .then(function(msg){
        me.businessActivity=msg.pl;
        me.renderQueryList();
      });
      
    }
    ,newList:function newList(e){
      lbs.modHelper.getMod('/workspace/publishing/activities:list:new')
      .then(function(listMod){
         return listMod.render({container:'#platformAPIsModal'});
      });
    }
    ,downloadTemplate: function downloadTemplate(e) {
      console.log("template got");
      var formIDtoSearch = lbs["workspace:nomenu"].publishing.activities.businessActivity.fm.fc;
      lbs.modHelper.getMessage('/workspace/activities/listtemplate.json', false, {}, 'GET', {
          fid: formIDtoSearch
        })
        .then(function(response) {
          if (response) {
            console.info("Downloading file from : ", response);
            window.location = response;
          } else {
            console.error("response is not a valid url");
          }
        });
    }
    ,selectService:function selectService(e){
      var me = this;
      return lbs.modHelper.getMod('/workspace/publishing/activities:select:service')
      .then(function(mod){
        if(typeof mod.create==='function'){
          mod.create();
        }
        return mod.render({container:'#activities\\\:select\\\:service',selected:me.services})
      });
    }
    ,'activities:search':function(e){
      e.preventDefault();
    }
    ,putChanges : function putChanges(obj,key,root,path,element,company){

      var o={},i=-1,len=path.length-1,
      current=o;
      while(++i<len){
        o[path[i]]={};
        current=o[path[i]];
      }
      current[path[i]]=obj[key];
      o._id=root._id;


      return  lbs.modHelper.getMessage(this.endPoints.activity,false,{},'PUT',{json:JSON.stringify({pl:{activity:o},company:company||''})})
          .then(function(response){


                if(response&&response.pl){


                  lbs.util.validateForm(element, 'success');


              }
              else{

                  lbs.util.validateForm(element, 'fail');

              }


          });
    }
    ,createActivity:function(){
      var me = this,lMod;
      return jQuery.when(
        lbs.modHelper.getMod('/global:modal')
        ,me.parent.render()
      )
      .then(function(loadMod){
        lMod=loadMod;
        loadMod.render({container:'#platformAPIsModal',persist:true});
        return lbs.modHelper.getMessage(me.endPoints.activity,false,{},'POST',{
          json:JSON.stringify(
                  { pl:{activity:{}}}
            )
          }
        );
      })
      .then(function(activity){
        lMod.hide();
       // window.location.replace(window.location.origin+window.location.pathname+'#/workspace/publishing/activities/'+activity.pl.abd.ac);
              $.bbq.pushState('#/workspace/publishing/activities/'+activity.pl.abd.ac);

      });

    }
    ,render : function render(arg){
      var code = jQuery.param.fragment().split('/').pop();
      if(code.toLowerCase()==='activities'){
        return this.createActivity();
      }
      //re use publishing render code
      //get the template for this one and bind it
      var arg = arg || {};
      var d = arg.defer || jQuery.Deferred()
      ,lMod;
      var me = this;//resolve handler needs a reference to this
      return jQuery.when(
        lbs.modHelper.getMod('/global:modal')
      )
      .then(function(loadMod){
        lMod=loadMod;
        return me.parent.render(arg);
      })
      .then(function(){
        return lMod.render({container:'#platformAPIsModal',persist:true});
      }).then(function(){
        var postalMod = lbs.modHelper.getMod('/global:select:postal'),
          activityPromise = lbs.modHelper.getMessage(me.endPoints.activity,false,{},'GET',{code:code}),
         filePromise = lbs.modHelper.getMessage('/workspace/activities/'+code+'/getUserMetaZipUploaded.json',false,{},'GET',{});
        return jQuery.when(
            postalMod
            ,activityPromise
            ,filePromise
            ,lbs.modHelper.getView("/workspace/publishing/activities.html")
        );
      }).then(function(postalMod,activity,file,view){
              console.log(">>zipuploadinfo>>",file);
              if(file && file.pl && file.pl.fp) {
                  me.upload = {
                      name: file.pl.fp.fn,
                      size: file.pl.fp.fs,
                      time: file.pl.ct.cd
                  }
              }
              else
              {
                  me.upload = {};
              }
        me.businessActivity = activity.pl;
        me.businessActivity.fm = me.businessActivity.fm || {fd:{}};
        me.businessActivity.arc = me.businessActivity.arc || {};
        me.businessActivity.ars = me.businessActivity.ars || {};
        me.postalMod=postalMod;
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{
            //paymentMethod:lbs.settings.messages.standardPayment
             paymentMethod:lbs.settings.messages.standardPaymentActivities
            ,userLimits:lbs.settings.messages.userlimits
            ,activityTypes:lbs.settings.messages[lbs.settings.lang].activityTypes
            ,publishingStatus:lbs.settings.messages[lbs.settings.lang].publishingStatus
            ,paymentMethod:lbs.settings.messages[lbs.settings.lang].standardPayment
            ,publishingType:lbs.settings.messages[lbs.settings.lang].publishingType
            ,splitting:lbs.settings.messages[lbs.settings.lang].splitting
            ,splittingPhase:lbs.settings.messages[lbs.settings.lang].splittingPhase
            ,gender:lbs.settings.messages[lbs.settings.lang].gender
            ,userType:lbs.settings.messages[lbs.settings.lang].userType
            ,zipuploadedname:me.upload.name
            ,zipuploadedsize:Math.round(me.upload.size/1024)+"kb"
            ,zipuploadedtime:me.upload.time
        }),container:me.container});
        //registration handlers now, we rendered template and set innerhtml
        lbs.actionHandler({
          container:me.container
          ,handlers:me.handlers
        });
        jQuery('.selectpicker').selectpicker();
        return jQuery.when(
                postalMod.render({
                  container:'#publishing\\\:filter\\\:postal'
                  ,view:"/workspace/publishing/selectpostal.html"
                  ,boundTo:me.businessActivity.arc
                  ,key:'pc'
                  ,changeListener : function changeListener(obj,key,root,path){
                    me.putChanges(obj,key,me.businessActivity,['arc',path[0]]);
                  }
                })
                ,me.renderFormList()
                ,me.renderQueryList()
        );
      }).then(function(){
        lMod.hide();
        var ignore=true;
        var formatters = {};
        formatters['abd.asd']=formatters['abd.acd']=formatters['arc.ra']=function format(val){
          return (val&&typeof val.substr==='function')?val.substr(0,10):"";
        }


        me.boundValues = lbs.binder.bind(me.container,me.businessActivity,'ba',[
          function(obj,key,root,path,element){
            if(ignore===true){
              return;
            }
            me.putChanges(obj,key,root,path,element);
          }
          ]
          ,formatters
        );


        lbs.binder.updateUI(me.boundValues);
        ignore=false;
        lbs.basemodule.pageComplete();
        d.resolve();
      });
      return d.promise();
    }
    ,submitActivityToRequest:function submitActivityToRequest(){

      var me = this;

      me.businessActivity.abd.aps=10;
      me.businessActivity.abd.pcn= lbs.profile.basic.corporationPublicName.value;

      var company = lbs.profile?lbs.profile.basic.corporationPublicName.value:'';

      jQuery.when(    me.putChanges(me.businessActivity.abd,'pcn',me.businessActivity,['abd','pcn'],null,company),
          me.putChanges(me.businessActivity.abd,'aps',me.businessActivity,['abd','aps'],null,company)

      ).then(function(){

            lbs.util.showCountDownMessage({message:{action:'事务提交成功',goto:'提示关闭'},count:1});


      });



    }
    ,remove : function remove(arg){
      this.postalMod.remove(arg);
    }
    ,create : function(){
      var me = this;
      this.handlers['publishing:activities:request:publish']=function(e){

        me.submitActivityToRequest();

      }
      this.handlers['activities:form:new']=function(e){
        me['handleNew'](e);
      };
      this.handlers['publishing:activities:edit:form']=function(e){
        me['handleNew'](e);
      };
      this.handlers['activities:list:new']=function(e){
        me.newList(e);
      }
      this.handlers['activities:select:service']=function(e){
        me.selectService(e);
      }
      this.handlers['publishing:activity:remove:query']=function(e){
        me.deleteQuery(e);
      }
      this.handlers['list:new:template:get'] = function(e) {
        me.downloadTemplate(e)
      }
      this.endPoints.serviceNames = '/workspace/services/servicenames.json';
      this.endPoints.serviceTypes = '/workspace/services/servicetypes.json';
      this.endPoints.activity = '/workspace/activities/activity.json';


      this.parent = lbs['workspace:nomenu'].publishing;
      lbs['workspace:nomenu'].publishing.activities = this;
      delete this.deps;
      delete this.create;

    }
    ,deps : ['/workspace/publishing']
  };  
    
  lbs.modules['/workspace/publishing/activities:form:new'] = {
    externalsLoaded:false
    ,boundValues:[]
    ,photoStandard:{}
    ,allTypes:null
    ,selectedStandardType:null
    ,allTypesView:null
    ,render : function render(arg){
        arg = arg || {};
        var d = arg.defer || jQuery.Deferred();
        this.containerToSet = arg.container;
        var me = this;//then after resolve needs a reference to this
        //@todo: get the view and module at the same time and use jQuery.when.apply(jQuery,promissesarry).then
        //@todo: get a list of service names and serviceTypes
        lbs.modHelper.getMod('/global:modal')
        .then(function(globalMod){


              lbs.modHelper.getMessage('/workspace/standards/photos/types.json',true,null,'GET')
                  .then(function(response){
                    console.log('response-----',response);
                    me.allTypes = response;
                  });

              lbs.modHelper.getView('/workspace/publishing/standardTypes.html')
                  .then(function(view){
                    me.allTypesView = view;
                  })
          return jQuery.when(
            lbs.modHelper.getView("/workspace/publishing/formtool/formdesign.html")
            ,globalMod.render({container:me.containerToSet})
          );
        })
        .then(function(view){
          var version = lbs.settings.version;
          lbs.modHelper.setContainer({
            mod:me
            ,html:Mustache.render(view,{})
            ,container:me.containerToSet
          });
          lbs.actionHandler({handlers:me.handlers,container:arg.container});
          //load this first, other script depends on it
          return (me.externalsLoaded)?true:jQuery.when(
            lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/FileSaver.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/json2html.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/jquery.json2html.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/jHtmlArea-0.8.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/json2html.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/jquery.json2html.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/colpick.js'+version})
            ,lbs.modHelper.getCssFromUrl({url:'/workspace/publishing/formtool/css/popup.css'})
            ,lbs.modHelper.getCssFromUrl({url:'/workspace/publishing/formtool/css/app.css'})
            ,lbs.modHelper.getCssFromUrl({url:'/workspace/publishing/formtool/css/colpick.css'})
            ,lbs.modHelper.getCssFromUrl({url:'/workspace/publishing/formtool/css/jHtmlArea.css'})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/dividize.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/jquery.contextmenu.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/redips-table.js'+version})
             ,lbs.modHelper.getCssFromUrl({url:'/workspace/publishing/formtool/css/jquery.contextmenu.css'})
          );
        })
        .then(function(){
          var version = lbs.settings.version;
          return jQuery.when(
            lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/js/popupFeature.js'+version})
            ,lbs.modHelper.getScriptFromUrl({url:'/workspace/publishing/formtool/app.js'+version})
          );
        }).then(function(){
          me.externalsLoaded=true;
          d.resolve();
        });
        return d.promise();
    }
    ,remove : function(arg){
      lbs.binder.unbind(this.boundValues);
    }
    ,create : function(){
      lbs['workspace:nomenu'].publishing['activities:form:new'] = this;
      delete this.deps;
      delete this.create;
    }
    ,openPhotoStandard:function(){
        var me =this;
        var template = Mustache.render(me.allTypesView,{data:me.allTypes});
      jQuery('#inputType00').html(template);


    }
    ,closePhotoStandard:function(){
      var me = this;
      console.log('publishing  closePhotoStandard -----------------',me.photoStandard);

      //@todo: a update activity function already exist, load the mod and use that function
      //  check with harm
      //  unbind
    }
    ,photoStandardChange : function(arg){
      var me = this;
      lbs.binder.unbind(me.boundValues);


      me.selectedStandardType = arg.sc;

          console.log('selectedStandardType----',me.selectedStandardType);


      lbs.modHelper.getMessage('/workspace/standards/standards/'+me.selectedStandardType+'.json',false,null,'GET')
      .then(function(response){
        me.photoStandard=response;
            console.log('response by code----',me.photoStandard);
        me.boundValues = lbs.binder.bind('.norm-param-form',me.photoStandard,'formPhotoStandard')
        lbs.binder.updateUI(me.boundValues);
      })
    }
    ,handlers : {}
    ,deps:['/workspace/publishing']
  };

  lbs.modules['/workspace/publishing/activities:select:service'] = {
    //when searching use post: http://stackoverflow.com/questions/4203686/how-can-i-deal-with-http-get-query-string-length-limitations-and-still-want-to-b
    //  correct way would be to create a result and forward to a GET request but POST can return the results as well
    postalMod:null
    ,boundValues:[]
    ,sqc:[]
    ,container:null
    ,searchValues:{}
    ,render : function render(arg){
      this.remove();
      var me = this;
      arg = arg || {};
      this.containerToSet = arg.container;
      me.container = arg.container;
      var me = this;//then after resolve needs a reference to this
      //@todo: get the view and module at the same time and use jQuery.when.apply(jQuery,promissesarry).then
      //@todo: get a list of service names and serviceTypes
      return lbs.modHelper.getMod('/global:modal')
      .then(function(globalMod){
        var postalMod = me.postalMod || lbs.modHelper.getMod('/global:select:postal');
        if(typeof globalMod.create==='function'){
          globalMod.create();
        }
        return jQuery.when(
          postalMod
          ,globalMod.render({container:me.containerToSet})
        );
      }).then(function(postalMod){
        me.postalMod=postalMod;
        //get mod, pass container: publishing:search:service:select:postal
        // view:"/workspace/publishing/selectservice.html"
        return jQuery.when(
          lbs.modHelper.getMessage(lbs['workspace:nomenu'].publishing.activities.endPoints.serviceNames)
          ,lbs.modHelper.getMessage(lbs['workspace:nomenu'].publishing.activities.endPoints.serviceTypes,true)
          ,lbs.modHelper.getView("/workspace/publishing/selectservice.html")
        );
      })
      .then(function(msg1,msg2,view){
        lbs.modHelper.setContainer({
          mod:me
          ,html:Mustache.render(view,{
            serviceNames:msg1.pl
            ,serviceTypes:msg2.pl
          })
          ,container:me.containerToSet
        });
        return jQuery.when(
                me.postalMod.render({
                  container:'#publishing\\\:search\\\:service\\\:select\\\:postal'
                  ,view:"/workspace/publishing/selectpostal.html"
                  ,boundTo:me.searchValues
                  ,key:'pc'
                })
                ,me.serviceList.render({container:'#serviceSelectionTable'})
        );
      }).then(function(){
        lbs.actionHandler({handlers:me.handlers,container:arg.container});
        me.boundValues=lbs.binder.bind(me.container,me.searchValues,'sv',[],[]);
        lbs.binder.updateUI(me.boundValues);
        lbs.basemodule.pageComplete();
      });
    }
    ,remove : function(arg){
      lbs.binder.unbind(this.boundValues);
    }
    ,create : function(){
      var me = this;

      me.serviceList.handlers['publishing:activity:service:select'] = function(e){
        me.serviceList.moveToselectedServiceBox(e);
      }
      this.handlers['publishing:save:service:query'] = function(e){
        me.commitQuery(e);
      }
      me.serviceList.queryList.handlers['publishing:activity:service:selection:delete'] = function(e){
        me.serviceList.queryList.removeFromselectedServiceBox(e);
      };

      this.handlers['publishing:search:services'] = function(e){


        me.serviceList.meta.p = 0;   //reset the page to zero as it would have been changed by the user clicking on the pagination
        me.seachServices(e);
      };

      lbs['workspace:nomenu'].publishing['activities:select:service'] = this;
      delete this.deps;
      delete this.create;
    }
    ,serviceList:{
      index:0
      ,view:''
      ,pageSize:8
      ,list:[]
      ,meta:{p:0,ps:8,tc:null}//keep ps the same as page size
      ,queryList:{    //KEEP AND UPDATE SELECTED SERVICES?
        view:''
        ,handlers:{}
        ,removeFromselectedServiceBox: function removeFromselectedServiceBox(e){
          var me = this;
          var index = this.list.indexOf(e.target.getAttribute('data-q'));
          var removed={};
          if(index!==-1){
            removed = this.list.splice(index,1);
            removed = JSON.parse(removed);
          }
          if(!removed.pl) {
           jQuery('#serviceSelectionTable').find('button').prop('disabled','');
          }
          me.rerender();
          lbs.actionHandler({handlers:me.handlers,container:'.selectedServicesContainer'});
        }
        ,list:[]
        ,render:function(arg){
          var me = this;
          return lbs.modHelper.getView('/workspace/publishing/queryblocks.html')
          .then(function(view){
            me.view=view;
            return me.rerender(arg);
          });
        }
        ,rerender:function(arg){
          var me = this;
          var i = -1,len = me.list.length,arr=[];
          var tmp;
          while(++i<len){
            tmp={};
            tmp.vals=JSON.parse(me.list[i]);
            tmp.q=me.list[i];
            arr.push(tmp);
          }
          jQuery('.selectedServicesContainer').html(
            Mustache.render(this.view,{items:arr})
          );
          lbs.actionHandler({container:'.selectedServicesContainer',handlers:me.handlers});
        }
      }
      ,handlers:{}
      ,groupAndSort:function(){
        var i = -1, len = this.sqc.length,arr=[]
          ,returnVals=[]
          ,tmp,groups={},groupIndex=0
          ,keys;
        while(++i<len){
          tmp = JSON.parse(this.sqc[i]);
          if(tmp && tmp.ui && !groups[tmp.ui.serviceName]){
            groups[tmp.ui.serviceName]={data:[],groupIndex:groupIndex++};
          }
          arr.push({data:JSON.parse(this.sqc[i]),groupIndex:groups[tmp.ui.serviceName].groupIndex,index:i});
        }
        //sort arr and then use the return values to sort this.sqc;
        arr.sort(function(a,b){
          //a bigger b return 1 for asc, return -1 for desc
          var ret = (a.groupIndex === b.groupIndex)?0
            :(a.groupIndex > b.groupIndex)?1:-1;
          if(ret===0){
            ret = (a.index > b.index)?1:-1;
          }
          returnVals.push(ret);
          return ret;
        });
        i=-1;
        this.sqc.sort(function(){
          return returnVals[++i];
        });
      }
      ,moveToselectedServiceBox: function moveToselectedServiceBox(e){
        var item = e.target.getAttribute('data-q');
        this.sqc.push(e.target.getAttribute('data-q'));
        this.groupAndSort();
        item = JSON.parse(item);
              /*
        if(!item.pl){
          jQuery('#serviceSelectionTable').find('button').prop('disabled','true');
        }*/
        return this.queryList.rerender();
      }
      ,render : function render(arg){
        var me = this;
        var ba = lbs["workspace:nomenu"].publishing.activities.businessActivity;
        var arr = (ba && ba.sqc)||[];
        var i = -1, len = arr.length;
        me.sqc=[];
        while(++i<len){
          me.sqc.push(JSON.stringify(arr[i]));
        }
        me.queryList.list=me.sqc;
        arg.listView = arg.viewUrl || '/workspace/publishing/servicelist.html';
        arg.specialPagination = true;

        console.log('SERVICES LIST RENDER|||||',me.meta);

        return lbs.basemodule['general:list'].render.call(this,arg)
        .then(function(){
          return me.queryList.render();
        });
      }
      ,rerender : function rerender(arg){
        var me = this;
        arg = arg || {};


        console.log('SERVICES LIST RERENDER---------',me.meta);
        return lbs.basemodule["general:list"].rerender.call(this,arg)
        .then(function(){
          lbs.actionHandler({
            container:me.containerToSet
            ,handlers:me.handlers
          });
        });
      }
    }
    ,seachServices : function seachServices(){
      var me = this, q;

      console.log('this.searchValues----',this.searchValues);

      var query = JSON.stringify({query:[this.searchValues],totals:true});

      return lbs.modHelper.getMessage('/workspace/services/services.json',false,{},'POST',{json:query,meta:me.serviceList.meta})
      .then(function(msg){

            console.log('search message',msg);

        var i = msg.pl.totals[0].length;
        while(--i>-1){
          q = {};
          q.sn = msg.pl.totals[0][i].serviceName._id;
          if(me.searchValues.st){q.st = me.searchValues.st;}
          if(me.searchValues.pc){q.pc = me.searchValues.pc;}
          if(me.searchValues.min){q.min = me.searchValues.min;}
          if(me.searchValues.max){q.max = me.searchValues.max;}
          q.ui={};
          q.ui.serviceCode= msg.pl.totals[0][i].service.serviceCode;//all activities
          q.ui.price=msg.pl.totals[0][i].min+'元 - ' + msg.pl.totals[0][i].max+'元';
          q.ui.serviceName=msg.pl.totals[0][i].serviceName.text;
          q.ui.servicePointName="所有网点";
          msg.pl.totals[0][i].isATotal=true;
          msg.pl.totals[0][i].q=JSON.stringify(q);
        }
        var i = msg.pl.results[0].length;
        while(--i>-1){
          q={};
          q.sn=msg.pl.results[0][i].serviceName._id;
          q.pl=msg.pl.results[0][i]._id;
          q.ui={};
          q.ui.serviceCode=msg.pl.results[0][i].service.serviceCode;
          q.ui.price=msg.pl.results[0][i].servicePrices+'元';
          q.ui.serviceName=msg.pl.results[0][i].serviceName.text;
          q.ui.servicePointName=msg.pl.results[0][i].servicePoint.servicePointName;
          msg.pl.results[0][i].isAResult=true;
          msg.pl.results[0][i].q=JSON.stringify(q);
        }
        me.serviceList.list = msg.pl.totals[0].concat(msg.pl.results[0]);
        me.serviceList.meta.tc =  msg.meta.tc;
        lbs.currentListModList.totalQueryResultCount   = msg.meta.tc;

            if(lbs.currentListModList.totalQueryResultCount === 0){
              $('.activityPublishingSelectServicePagination .paginationContainer').addClass('hide');
            }
            else {
              $('.activityPublishingSelectServicePagination .paginationContainer').removeClass('hide');
            }


        return me.serviceList.rerender({container:'#serviceSelectionTable'});
      });
    }
    ,commitQuery : function commitQuery(e){
      var me = this;
      var i = -1, len = this.serviceList.sqc.length;
      var ret=[];
      while(++i<len){
        ret.push(JSON.parse(this.serviceList.sqc[i]));
      }
      lbs.modHelper.getMessage(
        lbs['workspace:nomenu'].publishing.activities.endPoints.activity
        ,false,{},'PUT'
        ,{json:JSON.stringify({
            pl:{
              activity:{
                _id:lbs['workspace:nomenu'].publishing.activities.businessActivity._id
                ,sqc:ret
              }
            }
          })
        }
      )
      .then(function(msg){
        lbs["workspace:nomenu"].publishing.activities.businessActivity.sqc=msg.pl.sqc;
        lbs["workspace:nomenu"].publishing.activities.renderQueryList();
        jQuery(me.container).modal("hide");
      });
    }
    ,handlers : {}
    ,deps:['/workspace/publishing']
  };

//lbs.workspace:nomenu.publishing.activities:select:servic
  
  lbs.modules['/workspace/publishing/activities:list:new'] = {
    view:''
    ,renderStep2 : function renderStep2(arg){
      var me = this;
      arg.listView=arg.view;
      lbs.basemodule['general:list'].render.call(this,arg)
      .then(function(){
        jQuery(me.containerToSet).modal();
      });
    }
    ,render : function render(arg){

        arg = arg || {};
        var d = arg.defer || jQuery.Deferred();
        this.containerToSet = arg.container;
        var me = this;
        jQuery.when(
            lbs.modHelper.getView((arg.view)?arg.view:"/workspace/publishing/modalone.html")
        )
        .then(function(view){
          lbs.modHelper.setContainer({
            mod:me
            ,html:Mustache.render(view,{})
            ,container:me.containerToSet
          });
          lbs.actionHandler({handlers:me.handlers,container:me.containerToSet});
          me.radioClickedBindings = lbs.binder.bind(me.containerToSet,me.radioClicked);
          jQuery(me.containerToSet).modal();
          jQuery(me.containerToSet).on('hidden.bs.modal.new.list',function(){
            me.radioClicked.val=1;
            jQuery(me.containerToSet).off('hidden.bs.modal.new.list');
          })
          d.resolve();
        });
        return d.promise();
    }

    ,config : {
      "1":{
        view:'/workspace/publishing/modaltwo.html'
        ,listEndPoint:'/workspace/activities/nameslist.json'
        ,withPadding:false
        ,action:'renderStep2'
      }
      ,"2":{
        view:'/workspace/publishing/modalthree.html'
      }
      ,"3":{
        view:'/workspace/publishing/modalfour.html'
      },"4":{
          view:'/workspace/publishing/modalfive.html'
      }
    }
    ,radioClicked:{val:1},radioClickedBindings:null
    ,remove : function(arg){
      //@todo:

    }
    ,stepTwo : function stepTwo(){
          console.log("DOING STEP TWO");
      this.openDialog({},this.radioClicked.val);
    }
      ,stepThree : function stepThree(val){
          lbs.modHelper.getMessage('/workspace/activities/activityResponseUpload/'+val+'/'+lbs["workspace:nomenu"].publishing.activities.businessActivity.abd.ac+'.json',
          false,{},"GET").then(function(){
                  $('#platformAPIsModal').modal('hide');
                  lbs.modHelper.setContainer({container:'#platformAPIsModal',html:''});
              })
      }
    ,create : function(){
      var me = this;
      this.handlers['list:step:three'] = function(e){
          var val;
          jQuery('.fieldSelectionChoices').each(function(){
              if(this.checked===true)
              {
                  val = this.value;
                  console.log("Passing through value",val);
              }
          });
          me.stepThree(val)
      }
      this.handlers['list:step:two'] = function(e){
        me.stepTwo(e,'two');
      };
      this.handlers['list:new:user:search'] = function(e,addUserToSelection){
        me.userFilter(e,addUserToSelection);
      };
      this.handlers['list:new:user:select'] = function(e){
        me.addUserToSelection(e);
      };
      this.handlers['list:new:user:delete:all'] = function(e){
        me.emptyAllSelection(e);
      };

      lbs['workspace:nomenu'].publishing['activities:list:new'] = this;
      delete this.deps;
      delete this.create;

    }
    ,openDialog:function openDialog(e,whatDialog){
      var config = this.config[whatDialog];
      config.container=this.containerToSet;
      var fnName = config.action?config.action:'render';
      this[fnName](config);
    }

    ,searchedUserName : null
    ,searchedUserIcon : null

    ,handlers:{
        'list:new:file:upload':function(e){
          var me = this;
          console.log('upload');
            lbs.modules['/workspace/publishing/activities'].upload = lbs['workspace:nomenu'].publishing['activities:list:new'].uploadNewDocument(e);
         
        },
        'list:new:file.submit':function(e){
          var ac = lbs["workspace:nomenu"].publishing.activities.businessActivity.abd.ac;
          var ft = "xlsx";

          console.log('submit',ac,ft)
          lbs['workspace:nomenu'].publishing['activities:list:new'].submitDocument(e,'/workspace/activities/'+ac+'/'+ft+'/uploadResponses.json');

        }
      ,'list:new:user:delete':function(e){
        $(e.target).closest('tr').empty();
      }

    },
    uploadNewDocument: function uploadNewDocument(e) {


        lbs.basemodule.pageComplete();


        var me = this;

        var reader = new FileReader(),
           // img = new Image(),
            fileSize = 0,
            fileSizePxWidth = 0,
            fileSizePxHeight = 0;

        console.log('inside document handlers-------------------');


        var input = $(e.target),
            files = e.target.files[0],
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
             fileSize = Math.round(files.size / 1024);

             console.log(label,"mylable",fileSize);

             //console.log($(e.target).closest('.uploadFileContainer'))
            $("#uploadedFileName").text(label);

        return {size : fileSize, name: label, time: new Date()}

    }
    ,submitDocument: function submitDocument(e, route) {

      console.log("submitting");
        var me = this;
        var type = $.param.fragment().split('/').pop();

        var infoData =  $('#documentInforForm').serializeObject();

        lbs.modHelper.getView('/workspace/documents/spinningStransitionPage.html')
            .then(function (view) {

                lbs.modHelper.setContainer({
                    container: '#platformAPIsModal'
                    , html: Mustache.render(view)
                });

                $('#platformAPIsModal').modal().off('hide.bs.modal.submitDocument');

            });


        $('#uploadForm').ajaxSubmit({

             url:route
            ,type:'POST'
            ,data: {'fileInfo': JSON.stringify(infoData)}
            ,contentType:'multipart/form-data'
            ,dataType: 'json'
            ,success: function (data) {
                console.log('--------submit successful----------',data.pl,route);
                console.log(infoData);
                $('#platformAPIsModal').modal('hide');
                lbs.modHelper.setContainer({
                    container: '#platformAPIsModal'
                    , html: ''
                });
                lbs.modHelper.getView('/workspace/activities/uploadedlist.html').then(function(view){
                    var uploadInfo = {
                        zipuploadedname : lbs.modules['/workspace/publishing/activities'].upload.name,
                        zipuploadedsize : lbs.modules['/workspace/publishing/activities'].upload.size+"kb",
                        zipuploadedtime : lbs.modules['/workspace/publishing/activities'].upload.time
                    }
                    var myradios = data.pl;
                    lbs.modHelper.getView('/workspace/publishing/modalfive.html')
                    .then(function (view) {

                        var data = myradios


                        console.log('data0------',data);

                        lbs.modHelper.setContainer({
                            container: '#platformAPIsModal'
                            , html: Mustache.render(view,{data:data})
                        });

                        $('#platformAPIsModal').modal().off('hide.bs.modal.submitDocument');

                        lbs.actionHandler({container:'#platformAPIsModal', handlers:me.handlers});

                    });
                    lbs.modHelper.setContainer({
                        container: '#mything'
                        , html: Mustache.render(view, uploadInfo)
                    });
                })


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
  ,userFilter : function userFilter(e, cb){
    searchInput = $('.workSpacePopupSeachBox').val()||'search is empty';
    for (var key in this.userList) {
      var obj = this.userList[key];
      for (var prop in obj) {
        if(obj.hasOwnProperty(prop)){


           if(obj[prop].userName===searchInput){

             var iconUrl ="/commons/images/"+obj[prop].icon+".jpg";
             var userName =obj[prop].userName;


             $('.searchMatchShow').find('img').attr("src",iconUrl);
             $('.searchMatchShow').find('.addUsersName').text(userName);

             searchedUserName =userName;
             searchedUserIcon =iconUrl;


           }

        }
      }
    }
  }


  ,addUserToSelection:function addUserToSelection(e,addrow){

      //$('.optionSaveTable').find('tbody').append(function(searchedUserIcon,searchedUserName){   ///why?
      $('.optionSaveTable').find('tbody').append(function(){
        var  newRow = '<tr>'
            +'<td> <img class="addUsersIcon" src="'+searchedUserIcon+'"></td>'
            +'<td>'+searchedUserName+'</td>'
            + '<td><img data-action-click="list:new:user:delete" class="pull-right deleleItemsIcon" src="/commons/images/addUsersDeleteIcon.png"></td></tr>';
        return newRow;
      });
      lbs.actionHandler({
        container:$('.optionSaveTable').find('tbody tr:last').selector
        ,handlers:this.handlers
      });

    }

    ,emptyAllSelection:function emptyAllSelection(e){

      $('.optionSaveTable').find('tbody').empty();

    }

  ,userList: {

      "pl": [{
        "userName": "Tom",
        "userID": "lbs8888",
        "phone": "88888888",
        "icon": 'addUsers1',
        "email": "tom@qq.com"
      }, {
        "userName": "甜甜",
        "userID": "lbs9999",
        "phone": "9999999",
        "icon": 'addUsers2',
        "email": "dadamier@qq.com"
      }, {
        "userName": "guest",
        "userID": "guest6666",
        "phone": "66666666",
        "icon": 'addUsers3',
        "email": "guest@qq.com"
      }
        , {
          "userName": "Lv_001",
          "userID": "guest6666",
          "phone": "66666666",
          "icon": 'addUsers4',
          "email": "guest@qq.com"
        }]

    }
    ,deps:[]
  };