/**
 * users client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('users is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/users'] = 
    lbs.routes['/workspace/users/all'] =
    lbs.routes['/workspace/users/groups'] =
    lbs.routes['/workspace/users/acl'] =
    lbs.routes['/workspace/users/personal'] =
    lbs.routes['/workspace/users/corporate'] =
    lbs.routes['/workspace/users/api'] =
        {mod: 'lbs.workspace.users', location: '/workspace/users/main.js'};
  
  lbs.routes['/workspace/users:list'] = {mod:'lbs.workspace.users.list',location:'/workspace/users/main.js'};

  lbs.modules['/workspace/users'] = 
    lbs.modules['/workspace/users/all'] =
    lbs.modules['/workspace/users/groups'] =
    lbs.modules['/workspace/users/acl'] =
    lbs.modules['/workspace/users/personal'] =
    lbs.modules['/workspace/users/corporate'] =
    lbs.modules['/workspace/users/api'] ={
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.all = this.basePath+'/all.json';
      this.endPoints.groups = this.basePath+'/groups.json';
      this.endPoints.acl = this.basePath+'/acl.json';
      this.endPoints.personal = this.basePath+'/personal.json';
      this.endPoints.corporate = this.basePath+'/corporate.json';
      this.endPoints.api = this.basePath+'/api.json';
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/users/all':{
          listEndPoint:this.endPoints.all
          ,listView:'/workspace/users/list.html'
          ,currentPage:'所有用户'
        }
        ,'/workspace/users/groups':{
          listEndPoint:this.endPoints.groups
          ,listView:'/workspace/users/groups.html'
          ,currentPage:'安全小组'
        }
        ,'/workspace/users/acl':{
           listEndPoint:this.endPoints.acl
          ,listView:'/workspace/users/acl.html'
          ,currentPage:'功能授权'
        }
        ,'/workspace/users/personal':{
          listEndPoint:this.endPoints.personal
          ,listView:'/workspace/users/list.html'
          ,currentPage:'个人用户'
       }
       ,'/workspace/users/corporate':{
          listEndPoint:this.endPoints.corporate
          ,listView:'/workspace/users/list.html'
          ,currentPage:'单位用户'
       }
       ,'/workspace/users/api':{
          listEndPoint:this.endPoints.api
          ,listView:'/workspace/users/list.html'
          ,currentPage:'API用户'
        }

      };

      var me = this;
      this.handlers['users:create:new']=function(e){
        me.usersCreateNew(e);
      }
      this.handlers['user:create:new:common']=function(e){
        me.createNewCommonUser(e);
      }

      this.handlers['user:create:new:api']=function(e){
        me.createNewApiUser(e);
      }


      this.handlers['user:create:new:done']=function(e){
        me.createNewApiUserDone(e);
      }

        this.handlers['user:create:common:new:done']=function(e){
            me.createCommonUserDone(e);
        }

      this.handlers['users:new:done:confirmed']=function(e){
        me.createNewApiUserDoneConfirmed(e);
      }


      lbs.workspace.users = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/users'
    ,deps:['/workspace','/global:modal']
    ,container:'#right_container'
    ,modalContainer:'#platformAPIsModal'
    ,routeParams:null
    ,render : function render(arg){

        var me = this;
      return lbs.basemodule['general:list'].parentRender.call(this,{
        listMod:'/workspace/users:list'
        ,mainView:'/workspace/users/main.html'
        ,data:{container : '.container_bottom'}
      }).then(function(){
        lbs.actionHandler({
          container:'.container_top'
          ,handlers:me.handlers
        });
      })
    }
    ,usersCreateNew:function usersCreateNew(e){
            var me = this;

        lbs.modHelper.getView('/workspace/users/createNewUser.html')
            .then(function(view){
              lbs.modHelper.setContainer({
                container:me.modalContainer
                ,html:Mustache.render(view)
              });


              lbs.basemodule.pageComplete();

              jQuery(me.modalContainer).modal().off('hidden.bs.modal');


              lbs.actionHandler({
                container:me.modalContainer
                ,handlers:me.handlers
              });

              jQuery(me.modalContainer).on('hidden.bs.modal',function(){

                lbs.modHelper.setContainer({
                  container:me.modalContainer
                  ,html:''
                });
              });
            })
    }

   ,createNewApiUserDone: function createNewApiUserDone(e){
        var me = this;

            var newAPIUser = jQuery('#createNewUserForm').serializeObject();
           // console.log('newAPIUser--------',newAPIUser);

            lbs.modHelper.getMessage('/home/user.json',false,{},'POST',newAPIUser)
                .then(function(response){

                    var latest = response.pl
                    console.log('latest-------',latest);


                    lbs.modHelper.getView('/workspace/users/createNewUserDone.html')
                        .then(function(view){
                            lbs.modHelper.setContainer({
                                container:me.modalContainer
                                ,html:Mustache.render(view)
                            });

                            lbs.basemodule.pageComplete();
                            jQuery(me.modalContainer).modal().off('hidden.bs.modal');
                            lbs.actionHandler({
                                container:me.modalContainer
                                ,handlers:me.handlers
                            });

                            jQuery(me.modalContainer).on('hidden.bs.modal',function(){

                                lbs.modHelper.setContainer({
                                    container:me.modalContainer
                                    ,html:''
                                });
                            });


                        })


                })


      }
    ,createCommonUserDone: function createCommonUserDone(e){
            var me = this;

            var newUser = jQuery('#createCommonUserForm').serializeObject();
            console.log('newUser--------',newUser);

            lbs.modHelper.getMessage('/home/user.json',false,{},'POST',newUser)
                .then(function(response){

                    var latest = response.pl
                    console.log('latest-------',latest);


                    lbs.modHelper.getView('/workspace/users/createNewUserDone.html')
                        .then(function(view){
                            lbs.modHelper.setContainer({
                                container:me.modalContainer
                                ,html:Mustache.render(view)
                            });

                            lbs.basemodule.pageComplete();
                            jQuery(me.modalContainer).modal().off('hidden.bs.modal');
                            lbs.actionHandler({
                                container:me.modalContainer
                                ,handlers:me.handlers
                            });

                            jQuery(me.modalContainer).on('hidden.bs.modal',function(){

                                lbs.modHelper.setContainer({
                                    container:me.modalContainer
                                    ,html:''
                                });
                            });


                        })


                })


        }

   ,createNewApiUserDoneConfirmed:function createNewApiUserDoneConfirmed(e){
        var me = this;

        jQuery(me.modalContainer).modal('hide')

        lbs.modHelper.setContainer({
          container:me.modalContainer
          ,html:''
        });

      }

   ,createNewCommonUser: function createNewCommonUser(e){
        console.log('common user----')

        jQuery('.createUserBoxBoddy.commonUserBox').removeClass('hide');
        jQuery('.createUserBoxBoddy.APIUserBox').addClass('hide');
        jQuery('#CommonUserSubmit').removeClass('hide');
            jQuery('#apiUserSubmit').addClass('hide');
        jQuery('.createUserBoxHeader .commonUser').removeClass('gradientBg');
        jQuery('.createUserBoxHeader .apiUser').addClass('gradientBg');


      }
   ,createNewApiUser: function createNewApiUser(e){
      console.log('api user----')
      jQuery('.createUserBoxBoddy.commonUserBox').addClass('hide');
        jQuery('.createUserBoxBoddy.APIUserBox').removeClass('hide');
        jQuery('.createUserBoxHeader .commonUser').addClass('gradientBg');
        jQuery('.createUserBoxHeader .apiUser').removeClass('gradientBg ');
            jQuery('#CommonUserSubmit').addClass('hide');
            jQuery('#apiUserSubmit').removeClass('hide');
    }

    ,handlers:{}

  };


  lbs.modules['/workspace/users:list'] = {
  view:''
  ,detailView1:'/workspace/users/usersListDetails.html'
  ,detailView2:'/workspace/users/userListDetailsCommon.html'
  ,container:'.container_bottom'
  ,modalContainer:'#platformAPIsModal'
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,index:0
  ,render : function render(arg){

      var me = this;

          return lbs.basemodule['general:list'].render.call(this,arg)
              .then(function(){
                  console.log('general list render done------');
              })
  }
  ,rerender: function (arg) {
    var me =  this;

     var  arg = arg||{};


          arg.extraData= {}

          arg.extraData.renderUserStatus = me.renderUserStatus;
          arg.extraData.renderUserType = me.renderUserType;

    return lbs.basemodule['general:list'].rerender.call(this, arg)
    .then(function(){
      lbs.actionHandler({container:me.container,handlers:me.handlers});
    });
  }
  ,create : function(){
    var me = this;


    this.handlers['user:details:show'] = function(e){
      me.listViewDetails(e);
    }
    this.handlers['user:delete']=function(e){
      console.log('not yet implemented on server.');
      return '';
      lbs.basemodule["general:list"].deleteEntity({
        type:'用户'
  //        ,code:'serviceCode'
        ,entityName:'notification'
        ,listMod:me
        ,updateEndpoint:''//@todo:not created yet
        ,_id:e.target.getAttribute('data-id')
      });
    };
    this.handlers['user:status:disable'] = function(e){

            var id =  e.target.getAttribute('data-id');
            var userType = e.target.getAttribute('data-type');
            var itemName = e.target.getAttribute('data-name');
           console.log('user---',id,userType);
              me.updateUserStatus({e:e,id:id,status:'30',actionName:'停止用户',userType:userType, itemName:itemName});
          }

    this.handlers['user:status:enable'] = function(e){
          var id = e.target.getAttribute('data-id');
          var userType = e.target.getAttribute('data-type');
          var itemName = e.target.getAttribute('data-name');

         console.log('user---',id,userType);
          me.updateUserStatus({e:e,id:id,status:'20' ,actionName:'激活用户',userType:userType,itemName:itemName});
     }



    lbs.workspace.users.list = this;
    delete this.deps;
    delete this.create;
  }
  ,renderUserStatus: function renderUserStatus(){

          console.log('rendering user status');

          return function(text,render){



                    var arr = lbs.settings.messages.cn.userStatus;

                var index = lbs.util.find({'arr':arr,key:'val',val:render(text)})


              console.log('render(text)---',render(text));
              console.log('index)---',index);

                    if(index>-1){

                        return arr[index].text;

                    }
                    else{
                        return '';
                    }

          }

      }


  ,updateUserStatus: function updateUserStatus(arg){
          var me = this;
          var container = '#platformAPIsModal';

          var index = lbs.util.find({arr:me.list,key:'_id',val:arg.id});


     lbs.modules['/basemodule'].confirmAction({actionName:arg.actionName,itemName:arg.itemName,container:container})
         .then(function(){

             lbs.actionHandler({
                 handlers: {
                     'general:action:confirmed': function (e) {
                         lbs.modHelper.getMessage('/workspace/users/'+ arg.status+'/'+arg.userType+'/'+ arg.id+'.json' ,false,{},'PUT')
                             .then(function(response){
                                 console.log('response--', response);

                                 if(index > -1){
                                     me.list[index].accountStatus = response.pl.accountStatus;
                                     me.rerender();
                                 }
                                 $(container).modal('hide');
                             })
                     }
                 },
                 container: container
             });
         })

      }

  ,renderUserType: function renderUserType(){

      console.log('rendering user type');

      return function(text,render){

          if(render(text)==='corporate'){

              return '单位用户';

          }
          if(render(text)==='personal'){

              return '个人用户';

          }

          if(render(text)==='admin'){

              return '管理用户';

          }
         else if(render(text)==='api'){
              return 'API用户';
          }

      }

  }
  ,handlers:{}
  ,listViewDetails:function listViewDetails(e){

      var me = this;


     var id = e.target.getAttribute('data-id');
          console.log('id---',id);


      var user = null;
      var arr = lbs.workspace.users.list.list;
      var detailview = null;


      if(id){
          var index =  lbs.util.find({arr:arr,key:'_id',val:id})
          console.log(index);
          if(index>-1){
              user =  arr[index];
              console.log('user---',user);

              if(user.userType === 'api'){
                  detailview = me.detailView1;
              }
              else if((user.userType === 'corporate')||(user.userType === 'personal')){
                  detailview = me.detailView2;
              }


              lbs.modHelper.getView(detailview)
                  .then(function(view){
                      lbs.modHelper.setContainer({
                          container:me.modalContainer
                          ,html:Mustache.render(view,{user:user,status:me.renderUserStatus})
                      });

                      jQuery(me.modalContainer).modal().off('hidden.bs.modal.user.details');

                      lbs.basemodule.pageComplete();

                      jQuery(me.modalContainer).on('hidden.bs.modal.user.details',function(){

                          lbs.modHelper.setContainer({
                              container:me.modalContainer
                              ,html:''
                          });
                      });
                  })

          }
      }



    }
  ,deps:[]
};