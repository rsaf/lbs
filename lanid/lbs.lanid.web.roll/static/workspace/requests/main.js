/**
 * requests client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('requests is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/requests'] = 
    lbs.routes['/workspace/requests/all'] =
    lbs.routes['/workspace/requests/unprocess'] =
    lbs.routes['/workspace/requests/approved'] =
    lbs.routes['/workspace/requests/rejected'] =
        {mod: 'lbs.workspace.requests', location: '/workspace/requests/main.js'}
  lbs.routes['/workspace/requests:list'] = {mod:'lbs.workspace.requests.list',location:'/workspace/requests/main.js'};
  lbs.routes['/workspace/requests:edit'] = {mod:'lbs.workspace.requests.edit',location:'/workspace/requests/main.js'};

  lbs.modules['/workspace/requests'] = 
    lbs.modules['/workspace/requests/all'] = 
    lbs.modules['/workspace/requests/unprocess'] = 
    lbs.modules['/workspace/requests/approved'] = 
    lbs.modules['/workspace/requests/rejected'] = {
    create:function(){
      var me =this;
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.all = this.basePath+'/all.json';
      this.endPoints.unprocess = this.basePath+'/unprocess.json';
      this.endPoints.approved = this.basePath+'/approved.json';
      this.endPoints.rejected = this.basePath+'/rejected.json';
      this.endPoints.request = this.basePath+'/request.json';
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/requests/all':{
          listEndPoint:this.endPoints.all
          ,currentPage:'所有申请'
        }
        ,'/workspace/requests/unprocess':{
          listEndPoint:this.endPoints.unprocess
          ,currentPage:'未申请'
        }
        ,'/workspace/requests/approved':{
          listEndPoint:this.endPoints.approved
          ,currentPage:'已通过'
        }
        ,'/workspace/requests/rejected':{
          listEndPoint:this.endPoints.rejected
          ,currentPage:'已拒绝'
        }
      };
      lbs.workspace.requests = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/requests'
    ,deps:['/workspace']
    ,container:'#right_container'
    ,routeParams:null
    ,render : function render(arg){
      var data = {
        container : '.container_bottom'
      };
      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/requests:list'
        ,mainView:'/workspace/requests/main.html'
        ,data:data
      });
    }
    ,handlers: {
    }
  };

  lbs.modules['/workspace/requests:list'] = {
    view:''
    ,list:[]
    ,pageSize:10
    ,index:0
    ,create : function(){
      var me =this;
      this.handlers['request:show:details'] = function(e){
        me.showRequestDetails(e);
      }
      this.handlers['request:delete']=function(e){
        lbs.basemodule["general:list"].deleteEntity({
          type:'申请'
          ,code:'rc'
          ,entityName:'request'
          ,listMod:me
          ,updateEndpoint:lbs.workspace.requests.endPoints.request//@todo: no endpoint created yet
          ,_id:e.target.getAttribute('data-id')
        });
      };
      lbs.workspace.requests.list = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      var me = this;
      var arg = arg||{};

      arg.listEndPoint=lbs.workspace.requests.routeParams[jQuery.param.fragment()].listEndPoint;
      return lbs.basemodule['general:list'].render.call(this,arg)
      .then(function(){
        lbs.actionHandler({
          container:me.containerToSet
          ,handlers:me.handlers
        });
      });
    }
    ,rerender: function (arg) {
      var me =  this;
      arg = arg || {};
      arg.listView = arg.listView || '/workspace/requests/list.html'
      me.view = arg.listView;
      //arg.shortDate = function(){
      //  if(this.rd){
      //    return this.rd.substr(0,10) + " " + this.rd.substr(11,8)
      //  }
      //  return "";
      //};
      arg.showStatus=function(){

        return function(text,render){


          var val = render(text);

          if(val){
            return lbs.settings.messages.status[val].text;
          }
          return '';

        }

      };
      return lbs.basemodule['general:list'].rerender.call(this, arg)
      .then(function(){
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
    ,showRequestDetails:  function showRequestDetails(e){
      lbs.modHelper.getMod('/workspace/requests:edit')
      .then(function(editMod){
        editMod.render({container:'#platformAPIsModal',recordid:e.target.getAttribute('data-id')});
      });
    }
    ,handlers:{}
    ,deps:[]
  };

  lbs.modules['/workspace/requests:edit'] = {
    view:'/workspace/requests/showRequestDetails.html'
    ,containerToSet:''
    ,modalContainer:'#platformAPIsModal'
    ,request:{}
    ,rejectReason:{}
    ,rejectBoundValues:[]
    ,render : function render(arg){
      var me =this;

      var arg = arg||{};
      me.view=arg.view||me.view;
      me.containerToSet=arg.container;
      return  lbs.modHelper.getView(me.view).then(function(view){
        return jQuery.when(
                lbs.modHelper.getMessage('/workspace/requests/request.json',false,{},'GET',{_id:arg.recordid})
                ,view
        );
      }).then(function(msg,view){
        me.request={_id:msg.pl._id};
      //@todo: get the data details of the request
        var data = {request:msg.pl};


        data.shortDate = lbs.util.renderDateTime;


        data.showStatus =function(){

          return function(text,render){


            var val = render(text);

            if(val){
              return lbs.settings.messages.status[val].text;
            }
            return '';

          }

        };


        //data.showStatus=function(){
        //  if(this.request.rs){
        //    return lbs.settings.messages.status[this.request.rs].text;
        //  }
        //  return '';
        //};


        data.RenderUrl = function(){

          var patern1 = /\/workspace\/services\/myservicepoints/;
          var patern2 = /\/workspace\/services\/myservices/;

          return function(text, render){

                var url = render(text);

           // console.log('url----',url);

                if(url){

                  if(patern1.test(url)){

                    return '/workspace/services/myservicepoints';

                  }
                  else if(patern2.test(url)){

                    return '/workspace/services/myservices';

                  }
                  else{
                    return url;
                  }


                }
                else{
                  return '';
                }
          }


        };

        lbs.modHelper.setContainer({
          container:me.modalContainer
          ,html:Mustache.render(view,data)
         // ,mod:me
        });
        lbs.actionHandler({
          container:me.modalContainer
          ,handlers:me.handlers
        });
        jQuery(me.modalContainer).off('show.bs.modal.showRequestDetails');
        jQuery(me.modalContainer).on('show.bs.modal.showRequestDetails',function(){
          $(this).fadeIn(250);
        });


        jQuery(me.modalContainer).on('hidden.bs.modal.showRequestDetails',function(e){

          lbs.modHelper.setContainer({
            container:me.modalContainer
            ,html:''
          });
        });
        jQuery(me.modalContainer).modal();
      });
    }
    ,handlers:{}
    ,basePath:'/workspace/requests/'
    ,endPoints:{}
    ,create : function(){
      var me =this;
      me.endPoints.getRequest=me.basePath+'request.json'
      me.endPoints.saveRequest=me.basePath+'request.json'
      me.handlers['request:details:accept'] = function(e){
        me.requestAccepted(e);
      };
      this.handlers['request:details:accept:confirmed'] = function(e){
        me.requestAcceptedConfirmed(e);
      };
      this.handlers['request:details:reject'] = function(e){
        me.requestRejected(e);
      };
      this.handlers['request:details:reject:confirm'] = function(e){
        me.confirmReject(e);
      }
      this.handlers['request:details:accept:canceled'] = function(e){
        $(me.containerToSet).modal('hide');
        $(me.containerToSet).modal('show');
        me.render({container:me.containerToSet,recordid:me.request._id});
      }
      lbs.workspace.requests.edit = this;
      delete this.deps;
      delete this.create;
    }
    ,remove:function(arg){
      jQuery(this.containerToSet).modal().off('show.bs.modal.showRequestDetails');
      jQuery(this.containerToSet).modal('hide');
      lbs.binder.unbind(this.rejectBoundValues);
      this.request={};
      this.rejectReason={};
    }
    ,requestRejected:function requestRejected(e){
      var me =this;
      lbs.modHelper.getView('/workspace/requests/rejectReason.html').then(function(view){
        lbs.modHelper.setContainer({
          container:me.modalContainer
          ,html:Mustache.render(view)
        });
        me.rejectBoundValues=lbs.binder.bind(me.containerToSet,me.rejectReason,'rejectReason');
        lbs.binder.updateUI(me.rejectBoundValues);
        lbs.actionHandler({
          container:me.modalContainer
          ,handlers:me.handlers
        });
      });
    }
    ,confirmReject:function confirmReject(e){
      var me =this;
      lbs.modHelper.getMessage('/workspace/requests/request.json',false,{},'PUT',
        { json: 
          JSON.stringify({pl:{
            request:{
              rs:40
              ,_id:me.request._id
              ,rb:me.request.rb+me.rejectReason.reason + (me.rejectReason.textReason)?'\n'+me.rejectReason.textReason:''
            }
          }
        })
      })
      .then(function(){


      lbs.util.showCountDownMessage({message:{action:'审核拒绝操作成功',goto:'返回管理中心'},count:2});



          //@todo: sloppy solution, create re render in list
          lbs.workspace.requests.list.render({
            container:".container_bottom"
//            ,listEndPoint:"/workspace/requests/all.json"
            ,listView:"/workspace/requests/list.html"
          });
        });
      }
    ,requestAcceptedConfirmed:function requestAcceptedConfirmed(e){
      var me =this;
      lbs.modHelper.getMessage('/workspace/requests/request.json',false,{},'PUT',
        {json:JSON.stringify({pl:{request:{rs:30,_id:me.request._id}}})}
      ).then(function(){

            lbs.util.showCountDownMessage({message:{action:'审核通过操作成功',goto:'返回管理中心'},count:2});

        //@todo: sloppy solution, create re render in list
          lbs.workspace.requests.list.render({
            container:".container_bottom"
//          ,listEndPoint:"/workspace/requests/all.json"
            ,listView:"/workspace/requests/list.html"
          });
      } , function failure(e){
              lbs.util.showFailureMessage(e);
          });
      //@todo: update the main list, the item that is accepted should have the correct status
    }
    ,requestAccepted:function requestAccepted(e){
      var me =this;
      lbs.modHelper.getView('/workspace/requests/requestAcceptedConfirm.html').then(function(view){
        lbs.modHelper.setContainer({
          container:me.modalContainer
          ,html:Mustache.render(view)
        });
        lbs.actionHandler({
          container:me.modalContainer
          ,handlers:me.handlers
        });
       // $(me.containerToSet).modal('hide');
        $(me.modalContainer).modal('show');
      });
    }
    ,deps:[]
  };
