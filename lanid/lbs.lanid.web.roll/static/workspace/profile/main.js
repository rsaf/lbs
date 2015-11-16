/**
 * profile client module
 * 
 *
 */
    console.log('profile is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
lbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};
lbs.routes['/details:nomenu'] = {mod: 'lbs.details:nomenu', location: '/details/main.js'};
  lbs.routes['/workspace/profile'] = 
    lbs.routes['/workspace/profile/personals'] =
    lbs.routes['/workspace/profile/corporates'] =
    lbs.routes['/workspace/profile/securitymanagement'] =
    lbs.routes['/workspace/profile/personalprofile'] =
    lbs.routes['/workspace/profile/corporateprofile'] =
        {mod: 'lbs.workspace.profile', location: '/workspace/profile/main.js'};

lbs.routes['/comments'] = {mod: 'lbs.comments', location: '/commons/js/util.js'};




lbs.routes['/workspace/profile/corporatedetail'] = {mod: 'lbs.workspace.profileCorporateDetailPage', location: '/workspace/profile/main.js'};
lbs.routes['/workspace/profile:list'] = {mod:'lbs.workspace.profile.list',location:'/workspace/profile/main.js'};
lbs.routes['/workspace/profile/photos:list'] = {mod:'lbs.workspace.profile.photos:list',location:'/workspace/profile/main.js'};

  lbs.modules['/workspace/profile'] = 
    lbs.modules['/workspace/profile/personals'] =  //http://localhost/#/workspace/profile/personals
    lbs.modules['/workspace/profile/corporates'] =  
    lbs.modules['/workspace/profile/securitymanagement'] =  
    lbs.modules['/workspace/profile/personalprofile'] =  
    lbs.modules['/workspace/profile/corporateprofile'] =
  {
    create:function(){
      var me = this;
      this.parent = lbs.workspace;
      this.endPoints={};
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/profile/personals':{
            profileEndPoint:'/workspace/profiles/v1/personal.json'
          ,listView:'/workspace/profile/personalprofile.html'
          ,currentPage:'个人资料'
        }
        ,'/workspace/profile/corporates':{
              profileEndPoint:this.endPoints.corporate
          ,profileView:'/workspace/profile/profileList.html'
          ,currentPage:'单位资料'
        }
        ,'/workspace/profile/securitymanagement':{
              profileEndPoint:null
          ,profileView:'/workspace/profile/securitymanagement.html'
          ,currentPage:'安全管理'
        }
        ,'/workspace/profile/personalprofile':{
          //,profileEndPoint:this.basePath+'/personalUserProfile.json'
          profileEndPoint:'/workspace/profiles/v1/personal.json'
          //,profileEndPoint:'/profile.json'
          ,profileView:'/workspace/profile/personalprofile.html'
          ,page:'personal'
          //,personalDetail:''//rolland
          ,currentPage:'我的信息'
        }
        ,'/workspace/profile/corporateprofile':{
          profileEndPoint:'/workspace/profiles/v1/corporate/corporate.json'
          ,profileView:'/workspace/profile/corporateprofile.html'
          ,currentPage:'单位信息'
        }
      };

      this.handlers['profile:open:photo:list']=function(e){me.openPhotoList(e,{showSwichType:true,info:{saveBasic:true,savePrivate:false}})};
      this.handlers['profile:open:idphoto:list']=function(e){me.openPhotoList(e,{showSwichType:false, info:{saveBasic:false,savePrivate:true}})};

      this.handlers['basic:edit'] = function(e){
        me.basicEditInfo(e);
      };

      this.handlers['basic:save'] = function(e){
        me.basicSaveInfo(e);
      };


      this.handlers['corporate:logo:upload'] = function(e){
            me.uploadCorporateLogo(e);
        };

      this.handlers['contacts:set:email'] = function(e){
        me.setContactEmail(e);
      };

      this.handlers['contacts:set:email:success'] = function(e){
        me.setContactEmailSuccess(e);
      };

      this.handlers['contacts:set:phone:done'] = function(e){
        me.setContactPhoneVerificationCodeProvided(e);
      };


        this.handlers['contact:phone:reset:feedback:viewed'] = function(e){
            jQuery('#platformAPIsModal').modal('hide');
            me.render(e);
        };

      this.handlers['set:phone:get:verification:code'] = function(e){
          me.getPhoneVerificationCode(e);
      }

      this.handlers['contacts:set:QQ:success'] = function(e){
        me.setContactQQSuccess(e);
      };

      this.handlers['contacts:set:WeChat:success'] = function(e){
        me.contactWeChatProvided(e);
      };


      this.handlers['contacts:set:phone'] = function(e){
        me.setContactPhone(e);
      };

      this.handlers['contacts:set:QQ'] = function(e){
        me.setContactQQ(e);
      };

      this.handlers['contacts:set:WeChat'] = function(e){
        me.goToUserProfilePage(e);
      };

    this.handlers['wechat:linking:done'] = function(e){

        window.location = window.location.origin +'/#/workspace/profile/personalprofile';
    };



      this.handlers['profile:createNew']=function(e){
        me.createNew(e);
      }
      lbs.workspace.profile = this;
      delete this.deps;
      delete this.create;
  }
    ,render : function render(arg){
      //  var d = jQuery.Deferred();
      var me = this;
      var profileUrlRoot = jQuery.param.fragment().split('?');

      var config = me.routeParams[profileUrlRoot[0]];
      //    promises = [];



      return  this.parent.render().then(function(){


          config.root = me.mainTitles[lbs.user.userType];
          config.limitLength = function() {
              return function(text, render) {
                  return render(text).substr(0,10);
              }
          }

          config.dumyData = function() {

              console.log('data passed to mustache----',this);
          }

          var getEndPoint = lbs.modHelper.getMessage(config.profileEndPoint,false,{});
          var getView = lbs.modHelper.getView(config.profileView);


          $.when(getEndPoint,getView).then(function(profile,view) {
              config.profile = profile.pl; //could check msg.er also
              me.personalProfile = profile.pl;
              var notValidated = false;

              if(me.personalProfile&&me.personalProfile.vs&&lbs.user&&lbs.user.userType === 'personal'&&me.personalProfile.vs === '未实名认证'){
                  notValidated = true;
              }
              else if(me.personalProfile&&me.personalProfile.basic.vs&&lbs.user&&lbs.user.userType === 'corporate'&&me.personalProfile.basic.vs === '未单位认证'){
                  notValidated = true;
              }
              config.notValidated = notValidated;
              config.weixin = lbs.browsers?lbs.browsers.weixin:null;


              lbs.modHelper.setContainer({
                  container:me.container
                  ,html:Mustache.render(view, config)
              });

              lbs.actionHandler({
                  container:me.container
                  ,handlers:me.handlers
              });

          }).then(function(){
                  lbs.basemodule.pageComplete();
              me.handleWechatBasicInfo();

                  if (lbs.browsers.weixin){


                      var   urlsearch = window.location.href;
                      me.weixinCode = getParameterByName('code',urlsearch);


                      if(me.weixinCode){
                          me.handleWechatBasicInfo();
                      };

                  }

              })



          // personal profile needs to get data and do stuff
          // if(config.page==='personal'){
          //   promises.push(me.renderProfile(config));
          // }
          // return jQuery.when.apply(jQuery,promises)
      });
      //.then(function(){
      //        console.log('------config.data is:',config.data)
      //  return lbs.basemodule['general:list'].parentRender.call(me,config);
      //})
      //.then(function(){
      //  d.resolve();
      //})
      //return d.promise();
  }
    ,openPhotoList:function openPhotoList(e,photoSwicher){
      var container = '#platformAPIsModal',
          me=this;
      console.log('create teh mod and rener it');
      lbs.modHelper.getMod('/workspace/profile/photos:list')
      .then(function(photoListMod){
        return photoListMod.render({
          container:container
          ,handlers:me.handlers
          ,settings:{showSwichType:photoSwicher.showSwichType,
            action:
            {
              saveBasic:photoSwicher.info.saveBasic,
              savePrivate:photoSwicher.info.savePrivate
            }
          }
        });
      }).then(function(){
        jQuery(container).modal();
      });
    }
    ,updateJson:function updateJson(key,val){

      var profileObject = lbs.workspace.profile.personalProfile;

         levels =  key.split('.');

        if(levels[0]==='private'){

            profileObject.private.lastestPhoto.value = val;
             }
        if(levels[0]==='basic'){

            profileObject.basic.avatar.value = val;
        }

        $.ajax({
            type: "POST",
            url: 'workspace/profiles/v1/personal.json',
            data: profileObject,
            success: function(){ console.log('success');},
            dataType:'json'
        });

    }

    ,basePath:'/workspace/profiles/v1'
    ,deps:['/workspace','/global:modal']
    ,container:'#right_container'
    ,updatedContact:null
    ,routeParams:null
    ,weixinCode:null
    ,phone:null
    ,mainTitles : {
      'corporate' : '单位资料'
      ,'admin' : '用户资料'
      ,'personal' : '个人资料'
    }

   ,renderProfile:function renderProfile(config){


      //var me = this;
      //return lbs.modHelper.getMessage(config.profileEndPoint,false,{})
      // .then(function(msg) {
      //    config.data.profile = msg.pl; //could check msg.er also
      //      me.personalProfile = msg.pl;
      //
      //});
    }
    ,handlers:{

      'profile:avatar:upload':function(e){

        var input = $(e.target),
          numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

        if ($(e.target)[0].files[0]) {
          var reader = new FileReader();

          reader.onload = function (e){
            $('#avatar img').attr('src', e.target.result);



          //    var profileToPost = JSON.stringify(JSON.parse(lbs.workspace.profile.personalProfile));

              
            $('#uploadForm').ajaxSubmit({
              type:'POST',
              url:'workspace/profiles/v1/upload.json',

              data:{"json":JSON.stringify(lbs.workspace.profile.personalProfile)},
              dataType: 'json',
              success:function(data){

                  console.log('avatar updated successfully-----');
                  $('#uploadForm').resetForm();
              },

              error:function(err){
                  alert('更新失败了，请重试');
                  console.log('error------', err);
                  $('#uploadForm').resetForm();
              }
            });
          }
          reader.readAsDataURL($(e.target)[0].files[0]);
        }
     }

    }

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
    ,uploadCorporateLogo: function uploadCorporateLogo(e){
      var me = this;


      var input = $(e.target),
          numFiles = input.get(0).files ? input.get(0).files.length : 1,
          label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

      if ($(e.target)[0].files[0]) {
          var reader = new FileReader();

          reader.onload = function (e){

              var oldImage = $('#corporateLogoImage').attr('src');

              $('#corporateLogoImage').attr('src', e.target.result);

              $('#uploadForm').ajaxSubmit({
                  type:'POST',
                  url:'workspace/profiles/v1/corporate/logo/upload.json',

                  data:{"json":JSON.stringify(lbs.profile)},
                  dataType: 'json',
                  success:function(data){

                      console.log('logo updated successfully-----');
                      $('#uploadForm').resetForm();
                  },
                  error:function(err){
                      alert('上传失败了，请重试!');
                      $('#corporateLogoImage').attr('src', oldImage);
                      console.log('error------', err);
                      $('#uploadForm').resetForm();
                  }
              });
          }
          reader.readAsDataURL($(e.target)[0].files[0]);
      }
  }
    ,basicEditInfo: function basicEditInfo(e){
      var me = this,boundVals=[];
     var getView = lbs.modHelper.getView('/workspace/profile/editBasicProfileInfo.html');
     var getAreas = lbs.modHelper.getMessage('/commons/js/china_regions.js',true) ;

        $.when(getView,getAreas).then(function(view, areas){

           var areasJson = JSON.parse(areas);

            lbs.modHelper.setContainer({
              container:'#basicProfileInfo'
              ,html:Mustache.render(view,{profile:me.personalProfile ,areas:areasJson})
            });
            lbs.actionHandler({
              container:'#basicProfileInfo'
              ,handlers:me.handlers
            });
            $('.selectpicker').selectpicker();
            boundVals = lbs.binder.bind('#basicProfileInfo',me.personalProfile.basic,'basic');
            var i = -1,len=boundVals.length;
            while(++i<len){
              boundVals[i].updateUI();
            }

          })
    }
    ,getPhoneVerificationCode: function getPhoneVerificationCode(e){
            var me = this;

      var phone = $('#savePhoneToUserInfo').val();


      me.countDowndManager('.transactionCountDown','.getVerificationCodeBtn');



      if(phone){

        return $.when((lbs.user)?{pl:lbs.user}:lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,{})).then(function(user){

                console.log('userrrr-----',user);

                  if(user&&user.pl){

                      lbs.modHelper.getMessage('/workspace/users/user/verification/'+phone+'.json',false,null,'POST',{userInfo:user.pl.loginName,mobile:phone})
                          .then(function(response){

                              me.phone = phone;
                              console.log('mobile phonse save succesfully---',response);

                          });

                    }
              },function(err){

            alert('出错了，请重试!')
            $('#setPhoneFeedbackBOx').text('');
            $('#setPhoneFeedbackBOx').closest('form-group').addClass('hide');
        });
      }
      else{

          $('#setPhoneFeedbackBOx').text('请输入手机号');
          $('#setPhoneFeedbackBOx').closest('form-group').removeClass('hide');

      }




  }
   ,countDowndManager: function countDowndManager(container,btn){


      var countDownProfile;

      $('.verificationCodeSentNote').removeClass('hide');
      $(container).removeClass('hide');



      $(btn).addClass('disabled');

      clearInterval(countDownProfile);

       countDownProfile = setInterval(function(){


          var val = $(container).text();
          var intVal  = parseInt(val,10);
          if(intVal>0){
              $(container).text(intVal-1);
          }
          else{

              clearInterval(countDownProfile);
              $(btn).removeClass('disabled');
              $('.verificationCodeSentNote').addClass('hide');
              $(container).addClass('hide');
              $(container).text('60');
          }

      },1000);

    }
   ,basicSaveInfo: function basicSaveInfo(e){
      var me = this,boundVals=[];
      lbs.modHelper.getView('/workspace/profile/saveBasicProfileInfo.html')
          .then(function(view){
            console.log(me.personalProfile);
            lbs.modHelper.setContainer({
              container:'#basicProfileInfo'
              ,html:Mustache.render(view,{profile:me.personalProfile, limitLength :function() {
                    return function(text, render) {
                        return render(text).substr(0,10);
                    }
                }})
            });

            lbs.actionHandler({
              container:'#basicProfileInfo'
              ,handlers:me.handlers
            });

          })


        $.ajax({
            type: "POST",
            url: 'workspace/profiles/v1/personal.json',
            data: me.personalProfile,
            success: function(){ console.log('success');},
            dataType:'json'
        });

//        $.post( "ajax/test.html", function( data ) {
//            $( ".result" ).html( data );
//        });

      lbs.binder.unbind(boundVals);
    }
   ,updateTargetUI: function updateTargetUI(container,value){
        $(container).text(value);

    }
   ,setContactEmail: function setContactEmail(e){
      var me = this,boundVals=[];
      lbs.modHelper.getView('/workspace/profile/setEmail.html')
      .then(function(view){

            lbs.modHelper.setContainer({
              container:'#platformAPIsModal'
              ,html:Mustache.render(view,me.personalProfile)
            });
            lbs.actionHandler({
              container:'#platformAPIsModal'
              ,handlers:me.handlers
            });
            boundVals = lbs.binder.bind('#platformAPIsModal',me.personalProfile.contacts,'contacts');

            $('#platformAPIsModal').modal().off('hide.bs.modal.setEmail');
            $('#platformAPIsModal').modal().on('hide.bs.modal.setEmail',function(){
              lbs.binder.unbind(boundVals);
              lbs.modHelper.setContainer({
                container:'#platformAPIsModal'
                ,html:''
              });
            });
            var i = -1,len=boundVals.length;
            while(++i<len){
              boundVals[i].updateUI();
              me.updatedContact = boundVals[i];
            }

            })
       }
   ,setContactEmailSuccess: function setContactEmailSuccess(e){


      var me = this,boundVals=[];


        lbs.modHelper.getView('/workspace/profile/setEmailFeedBack.html')
          .then(function(view){

            lbs.modHelper.setContainer({
              container:'#platformAPIsModal'
              ,html:Mustache.render(view,me.personalProfile)

            });

            $('#platformAPIsModal').modal().off('hide.bs.modal.setEmailFeedBackSuccess');
            $('#platformAPIsModal').modal().on('hide.bs.modal.setEmailFeedBackSuccess',function(){
              lbs.binder.unbind(boundVals);
            });

           var i = -1,len=boundVals.length;
            while(++i<len){
              boundVals[i].updateUI();
            }

              me.updateTargetUI("#boundEmail",me.updatedContact.element.value);
          })
    }
   ,setContactPhone: function setContactPhone(e){
      var me = this,boundVals=[];
      lbs.modHelper.getView('/workspace/profile/setPhoneNumber.html')
          .then(function(view){
          //  console.log(me.personalProfile);

            lbs.modHelper.setContainer({
              container:'#platformAPIsModal'
              ,html:Mustache.render(view,me.personalProfile)
            });

            lbs.actionHandler({
              container:'#platformAPIsModal'
              ,handlers:me.handlers
            });

            $('#platformAPIsModal').modal().off('hide.bs.modal.setPhoneNumber');
            $('#platformAPIsModal').modal().on('hide.bs.modal.setPhoneNumber',function(){


                lbs.modHelper.setContainer({
                    container:'#platformAPIsModal'
                    ,html:''
                });

            });

          })
    }

   ,setContactPhoneVerificationCodeProvided: function setContactPhoneVerificationCodeProvided(e){

      //var me = this,boundVals=[];
      var code = $('#savePhoneToUserInfoCode').val();
       var me = this;


      console.log('code---',code);

      if(code){

          return $.when((lbs.user)?{pl:lbs.user}:lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,{})).then(function(user){

              console.log('user-----',user);

              if(user&&user.pl){

                  lbs.modHelper.getMessage('/workspace/users/user/verification/code/'+code+'.json',false,null,'POST',{userInfo:user.pl.loginName,code:code,mobile:me.phone})
                      .then(function(response){

                          console.log('mobile phonse save succesfully---',response);

                          if(response&&response.pl&&response.pl.status){


                              lbs.modHelper.getView('/workspace/profile/setPhoneNumberFeedBack.html')
                                  .then(function(view){
                                      console.log('profile--',me.personalProfile);
                                      lbs.modHelper.setContainer({
                                          container:'#platformAPIsModal'
                                          ,html:Mustache.render(view,me.personalProfile)

                                      });
                                      $('#platformAPIsModal').modal().off('hide.bs.modal.setEmailFeedBackSuccess');
                                      $('#platformAPIsModal').modal().on('hide.bs.modal.setEmailFeedBackSuccess',function(){
                                          //lbs.binder.unbind(boundVals);
                                      });

                                      lbs.actionHandler({
                                          container:'#platformAPIsModal',
                                          handlers:me.handlers

                                      })

                                  });

                          }
                          else{

                              $('#setPhoneFeedbackBOx').text('验证码有误,请重试！');
                              $('#setPhoneFeedbackBOx').closest('form-group').removeClass('hide');

                          }

                 });
              }
          },function(err){

              alert('出错了，请重试!')
              $('#setPhoneFeedbackBOx').text('');
              $('#setPhoneFeedbackBOx').closest('form-group').addClass('hide');
          });
      }
      else{

          $('#setPhoneFeedbackBOx').text('请输入手机号');
          $('#setPhoneFeedbackBOx').closest('form-group').removeClass('hide');

      }





    }
   ,setContactQQ: function setContactQQ(e){
      var me = this,boundVals=[];
      lbs.modHelper.getView('/workspace/profile/setQQNumber.html')
          .then(function(view){
         console.log(me.personalProfile);

            lbs.modHelper.setContainer({
              container:'#platformAPIsModal'
              ,html:Mustache.render(view,me.personalProfile)
            });

            lbs.actionHandler({
              container:'#platformAPIsModal'
              ,handlers:me.handlers
            });


            boundVals = lbs.binder.bind('#platformAPIsModal',me.personalProfile.contacts,'contacts');
            $('#platformAPIsModal').modal().off('hide.bs.modal.setQQNumber');
            $('#platformAPIsModal').modal().on('hide.bs.modal.setQQNumber',function(){
              lbs.binder.unbind(boundVals);
            });
            var i = -1,len=boundVals.length;
            while(++i<len){
              boundVals[i].updateUI();
             me.updatedContact = boundVals[i];
            }
          })


    }
   ,setContactQQSuccess: function setContactQQSuccess(e){

      var me = this,boundVals=[];
      lbs.modHelper.getView('/workspace/profile/setQQNumberFeedBack.html')
          .then(function(view){
            console.log(me.personalProfile);
            lbs.modHelper.setContainer({
              container:'#platformAPIsModal'
              ,html:Mustache.render(view,me.personalProfile)

            });
            $('#platformAPIsModal').modal().off('hide.bs.modal.setQQFeedBackSuccess');
            $('#platformAPIsModal').modal().on('hide.bs.modal.setQQFeedBackSuccess',function(){
              lbs.binder.unbind(boundVals);
            });
            var i = -1,len=boundVals.length;
            while(++i<len){
              boundVals[i].updateUI();

            }

              me.updateTargetUI("#boundQQ",me.updatedContact.element.value);
          })
    }
   ,setContactWeChat: function setContactWeChat(e){
      var me = this,boundVals=[];
      lbs.modHelper.getView('/workspace/profile/setWeChat.html')
          .then(function(view){
           console.log('profile---',me.personalProfile);

            lbs.modHelper.setContainer({
              container:'#platformAPIsModal'
              ,html:Mustache.render(view,{profile:me.personalProfile,renderWechatValue:me.renderWechatValue})
            });


            lbs.actionHandler({
              container:'#platformAPIsModal'
              ,handlers:me.handlers
            });

              $('#platformAPIsModal').modal().off('hide.bs.modal.setWechatNumer');
              $('#platformAPIsModal').modal().on('hide.bs.modal.setWechatNumer',function(){

                  lbs.modHelper.setContainer({
                      container:'#platformAPIsModal'
                      ,html:''
                  });

              });

          })
  }

   ,goToUserProfilePage: function goToUserProfilePage(e){



          var siteUrl = window.location.href;


          siteUrl = siteUrl.split('?')[0];
          //alert('wechat will redirect to:----'+siteUrl);

                //snsapi_base,snsapi_userinfo


          window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5a85d57385f32302&redirect_uri=' + encodeURIComponent(siteUrl) + '&response_type=code&scope=snsapi_userinfo&state=77#wechat_redirect';



  }

    ,handleWechatBasicInfo:function handleWechatBasicInfo(){

      var me = this;



         // alert('weixinCode---'+me.weixinCode);

            if(me.weixinCode){


                $.when((lbs.user)?{pl:lbs.user}:lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,{}))
                    .then(function(user){

                        //todo user i issume the profile is loaded when the user logsin;

                        lbs.modHelper.getMessage('/workspace/profiles/v1/personal/weixin.json',null,null,'POST',{code:me.weixinCode,user:user.pl,profile:lbs.profile})
                            .then(function(response){

                             // alert('server response---'+JSON.stringify(response));

                                lbs.modHelper.getView('/workspace/profile/setWeChatFeedBack.html')
                                    .then(function(view){

                                        lbs.modHelper.setContainer({
                                            container:'#platformAPIsModal'
                                            ,html:Mustache.render(view,me.personalProfile)

                                        });

                                        lbs.actionHandler({
                                            container:'#platformAPIsModal',
                                            handlers:me.handlers

                                        })

                                        $('#platformAPIsModal').modal().off('hide.bs.modal.setWechatFeedBackSuccess');
                                        $('#platformAPIsModal').modal().on('hide.bs.modal.setWechatFeedBackSuccess',function(){

                                            lbs.modHelper.setContainer({
                                                container:'#platformAPIsModal'
                                                ,html:''
                                            });
                                        });



                                    });


                            },
                            function(err){

                                alert('微信绑定失败，请重试！');


                            });

                    });

            }

  }

    ,renderWechatValue:function (){

                        var wechatval  = this.profile.contacts.linkToWechat.value||'';
                        if(wechatval !== '未设置微信绑定'){
                            return wechatval;
                        }
                        else{
                            return '';
                        }
     }

    };

lbs.modules['/workspace/profile/photos:list'] = {
  deps : []
  ,views:{
    galleryView:'/workspace/profile/chooseProfilePicture.html'
//    ,listView:'/workspace/photos/listView.html'
  }
  ,endpoints:{
    'idphoto' :'/workspace/profiles/v1/idphotos.json'
    ,'others' :'/workspace/profiles/v1/otherphotos.json'
  }
  ,currentView:null
  ,list:[]
  ,otherHandlers:false
  ,index:0
  ,totalRecords:null
  ,pageSize:8
  ,boundValues:[]
  ,selectedPhoto:null
  ,currentEndpoint:null
  ,templateHelpers:{}
  ,create : function create(){
    var me = this;

    this.handlers['profile:photos:list:movePage']=function(e){
      me.movePage(e);
    };
    this.handlers['profile:photos:list:switch']=function(e){
      me.switchEndPoint(e);
    };

    this.handlers['profile:save:selected:photo:private']=function(e){
      me.saveSelectedPhoto(e,'private',lbs.workspace.profile.updateJson);
    };
    this.handlers['profile:save:selected:photo:basic']=function(e){
      me.saveSelectedPhoto(e,'basic',lbs.workspace.profile.updateJson);
    };

    lbs.workspace.profile['photos:list'] = this;
    delete this.deps;
    delete this.create;
  }
  ,render : function render(arg){
    this.modalContainer=arg.container;
//    if(!arg.endPoint){
//      this.currentEndpoint=null;
//    }
    arg.endPoint=arg.endPoint || this.endpoints[this.currentEndpoint]||this.endpoints.idphoto;
    lbs.basemodule['photo:list'].render.call(this,arg);
  }
  ,rerender:function rerender(){
    var me = this;
    this.templateHelpers.isSelected=lbs.modHelper.isChecked([this.selectedPhoto],'_id');
   // console.log([this.selectedPhoto]);
    this.templateHelpers.photoTypeSelected=function(){
      return function(text) {
        if(!me.currentEndpoint&&text==='idphoto'){
          return 'checked=""';
        }
        if(me.currentEndpoint===text){
          return 'checked=""';
        }
        return '';
      };
    }
    lbs.binder.unbind(me.boundValues);
    lbs.basemodule['photo:list'].rerender.call(this)
    .then(function(){
      me.boundValues = lbs.binder.bind(me.modalContainer,me,'profile')
    })
  }
  ,movePage:function movePage(e){
    lbs.basemodule['photo:list'].movePage.call(this,{e:e});
  }
  ,switchEndPoint : function switchEndPoint(e){

    var ep = e.target.getAttribute('data-endpoint');
    if(this.currentEndpoint===ep){
      return;
    }
    this.currentEndpoint=ep;
    this.render({
      endPoint:this.endpoints[ep]
      ,container:this.modalContainer
      ,handlers:this.handlers
      ,settings:{showSwichType:true,
                    action:
                         {saveBasic:true,
                          savePrivate:false
                         }
      }

    });
  }
  ,saveSelectedPhoto: function saveSelectedPhoto(e,type, callback){
    var me = this;

    var photoUrl=null;

    var index = lbs.util.find({
      arr:this.list
      ,key:'_id'
      ,val:parseInt(this.selectedPhoto,10)})
    if(index!==-1){
      photoUrl=this.list[index].photourl;
    }

    if(type==='private'){
       $('#privateAvatar').attr('src',photoUrl);
        return callback('private.lastestPhoto',photoUrl);
    }

    if(type==='basic'){
      $('#avatar img').attr('src',photoUrl);
        return callback('basic.avatar',photoUrl);
    }





  }
  ,updateArrows:function updateArrows(){
    lbs.basemodule['photo:list'].updateArrows.call(this);
  }
  ,handlers:{
  }
  ,remove : function remove(){
  }
};

lbs.modules['/workspace/profile:list'] = {
  view:''
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,index:0
  ,render : function render(arg){
    arg.listView = arg.listView || '/workspace/profile/profileList.html';
    return lbs.basemodule['general:list'].render.call(this,arg);
  }
  ,rerender : function render(arg){
    return lbs.basemodule['general:list'].rerender.call(this,arg);
  }
  ,create : function(){
    lbs.workspace.profile.list = this;
    delete this.deps;
    delete this.create;
  }
  ,deps:[]
};

lbs.modules['/workspace/profile/corporatedetail'] = {
    deps : ['/workspace','/global:modal','/details:nomenu']
    ,currentView:null
    ,container:'#right_container'
    ,parent:null
    ,profileEndPoint:'/workspace/profiles/v1/corporateDetails/:profileID.json'
    ,activityEndPoint:'/workspace/activities/activitieslist.json'
    ,mainView:'/workspace/profile/corporatedetail.html'
    ,currentPage:'单位详情'
    ,root:'单位资料'
    ,otherHandlers:false
    ,index:0
    ,boundValueHolder:[]
    ,CorporateDetails:null
    ,totalRecords:null
    ,pageSize:8
    ,boundValues:[]
    ,selectedPhoto:null
    ,currentEndpoint:null
    ,templateHelpers:{}
    ,newFaqAdder: null
    ,create : function create(){
        var me = this;

        this.parent = lbs.workspace;



        this.handlers['send:notification:from:detailpage'] = function (e) {

             if(!$(e.target).hasClass('disabled')){
                 var user = e.target.getAttribute('data-user');
                 var subject = e.target.getAttribute('data-subject');

                 lbs.modHelper.getMod('/comments')
                     .then(function(mod){
                         mod.sendInmailFromComment({
                             e: e,
                             user: user,
                             subject: subject
                         });

                     });
             }

        };

        this.handlers['corporate:details:general:edit']=function(e){
            me.editGeneralInfo(e);
        };
        this.handlers['corporate:details:general:save']=function(e){
            me.saveGeneralInfo(e);
        };
        this.handlers['corporate:details:logo:upload']=function(e){
            me.uploadCorporateDetailsLogo(e);
        };
        this.handlers['corporate:details:description:edit']=function(e){
            me.editDescriptionInfo(e);
        };
        this.handlers['corporate:details:description:save']=function(e){
            me.saveDescriptionInfo(e);
        };
        this.handlers['corporate:details:attachment:upload']=function(e){

            me.uploadCorporateDetailAttachements(e);
        };
        this.handlers['corporate:details:attachement:delete']=function(e){

            me.deleteCorporateDetailAttachements(e);
        };
        this.handlers['corporate:details:image:edit']=function(e){
            console.log('edit images');

            me.editCorporateDetailImage(e);
        };
        this.handlers['corporate:details:image:delete']=function(e){
            console.log('delete images');

            me.deleteCorporateDetailImage(e);
        };
        this.handlers['corporate:details:image:save']=function(e){
            console.log('save images');
            me.saveCorporateDetailImage(e);
        };
        this.handlers['corporate:details:image:upload']=function(e){
            console.log('upload images');
            me.uploadCorporateDetailImage(e);
        };
        this.handlers['corporate:details:faq:edit']=function(e){

            me.editCorporateDetailFaq(e);
        };
        this.handlers['corporate:details:faq:save']=function(e){

            me.saveCorporateDetailFaq(e);
        };
        this.handlers['corporate:details:faq:new:save']=function(e){

            me.saveNewCorporateDetailFaq(e);
        };
        this.handlers['corporate:details:faq:delete:single']=function(e){

            me.deleteSingleCorporateDetailFaq(e);
        };
        this.handlers['corporate:details:faq:edit:single']=function(e){

            me.editSingleCorporateDetailFaq(e);
        };
        this.handlers['corporate:details:faq:save:single']=function(e){

            me.saveSingleCorporateDetailFaq(e);
        };
        this.handlers['corporate:details:audio:edit']=function(e){

            me.editCorporateDetailAudio(e);
        };
        this.handlers['corporate:details:audio:save']=function(e){

            me.saveCorporateDetailAudio(e);
        };
        this.handlers['corporate:details:audio:new']=function(e){

            me.addnewCorporateDetailAudio(e);
        };
        this.handlers['corporate:details:video:save']=function(e){

            me.saveCorporateDetailVideo(e);
        };
        this.handlers['corporate:details:video:edit']=function(e){

            me.editCorporateDetailVideo(e);
        };
        this.handlers['corporate:details:video:new']=function(e){

            me.addnewCorporateDetailVideo(e);
        };
        this.handlers['corporate:details:video:delete']=function(e){

            me.deleteCorporateDetailVideo(e);
        };
        this.handlers['corporate:details:audio:delete']=function(e){

            me.deleteCorporateDetailAudio(e);
        };


        lbs.workspace.profileCorporateDetailPage = this;
        delete this.deps;
        delete this.create;
    }
    ,render : function render(arg){
        var me = this;
        var arg = arg||{};

        var config = arg.config||{};


        var url = $.param.fragment().split('/');
        url.shift();

        return this.parent.render().then(function(){

            config.root = me.root;
            config.currentPage = me.currentPage;
            config.data = {};
            config.data.limitLength = function() {
                return function(text, render) {
                    return render(text).substr(0,10);
                }
            }


                var getView = lbs.modHelper.getView(me.mainView);


                var getProfileEndPoint = (arg&&arg.details)?{pl:arg.details}:lbs.modHelper.getMessage(me.profileEndPoint,null,{},'GET');




          //@todo commented parts related to activites until we find beter way to render the activity based on corporation id

           // var getCorporateEndPoint = lbs.modHelper.getMessage(me.activityEndPoint, null,null,'GET');

           // jQuery.when(getView,getProfileEndPoint,getCorporateEndPoint).then(function(view, data,exdata){

            jQuery.when(getView,getProfileEndPoint).then(function(view, data ){

                    lbs.workspace.profileCorporateDetailPage.CorporateDetails =  data.pl;
                console.log('CorporateDetails--------', me.CorporateDetails);


                //lbs.modHelper.setContainer({
            //        container:me.container
            //        ,html:Mustache.render(view, {config:config, profile:me.CorporateDetails,items:exdata.pl})
            //    });
            lbs.modHelper.setContainer({
                container:me.container
                ,html:Mustache.render(view, {config:config, profile:me.CorporateDetails,user:(arg)?arg.user:true,loggedIn:lbs.user})//todo the user if the user if checking from outside we use the parameters from the arguments(which come from the detail pages main.js)
            });



            lbs.actionHandler({
                container:me.container
                ,handlers:me.handlers
            });

            }).then(function(){

                lbs.basemodule.pageComplete();
            });
        });
    }

    ,editGeneralInfo: function editGeneralInfo(e){
        var me = this;

        lbs.modHelper.getView('/workspace/profile/editCorporateGeneralDetails.html')
            .then(function(view1){

                lbs.modHelper.setContainer({
                    container:'#corporateDetailsGeneralInfo'
                    ,html:Mustache.render(view1,{profile:me.CorporateDetails})
                });
            })
            .then(function(){

                lbs.modHelper.getView('/workspace/profile/editCorporateContactDetails.html')
                    .then(function(view2){
                        lbs.modHelper.setContainer({
                            container:'#corporateDetailsContacts'
                            ,html:Mustache.render(view2,{profile:me.CorporateDetails})
                        });
                    })
                    .then(function(){
                        lbs.binder.unbind(me.boundValueHolder);
                        me.boundValueHolder = lbs.binder.bind('.detailPageTopTable',me.CorporateDetails,'general');

                        var i = -1,len=me.boundValueHolder.length;
                        while(++i<len){
                            me.boundValueHolder[i].updateUI();
                        }
                    })
            })


        jQuery('#saveGeneralINfoBtn').removeClass('hide');
        jQuery('#editGeneralINfoBtn').addClass('hide');


    }
    ,saveGeneralInfo: function editGeneralInfo(e){
        var me = this;

    lbs.modHelper.getView('/workspace/profile/saveCorporateGeneralDetails.html')
        .then(function(view1){

            lbs.modHelper.setContainer({
                container:'#corporateDetailsGeneralInfo'
                ,html:Mustache.render(view1,{profile:me.CorporateDetails})
            });
        })
        .then(function(){
            lbs.modHelper.getView('/workspace/profile/saveCorporateContactDetails.html')
                .then(function(view2){

                    lbs.modHelper.setContainer({
                        container:'#corporateDetailsContacts'
                        ,html:Mustache.render(view2,{profile:me.CorporateDetails})
                    });

                })
                .then(function(){
                    lbs.basemodule.pageComplete();
                });


        })


        console.log('me.CorporateDetails----',me.CorporateDetails);

        lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/'+me.CorporateDetails._id+'.json',null,null,'PUT', me.CorporateDetails)
            .then(function(response){
                console.log(response);
            });


        jQuery('#saveGeneralINfoBtn').addClass('hide');
        jQuery('#editGeneralINfoBtn').removeClass('hide');

    }
    ,uploadCorporateDetailsLogo: function uploadCorporateDetailsLogo(e){
        var me = this;


            var input = $(e.target),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

            if ($(e.target)[0].files[0]) {
                var reader = new FileReader();

                reader.onload = function (e){

                   var oldImage = $('.corporateDetailsLogo img').attr('src');
                    console.log('oldImage',oldImage)
                    $('.corporateDetailsLogo img').attr('src', e.target.result);

                    $('#uploadForm').ajaxSubmit({
                        type:'POST',
                        url:'workspace/profiles/v1/corporateDetails/upload.json',

                        data:{"json":JSON.stringify(me.CorporateDetails)},
                        dataType: 'json',
                        success:function(data){

                            console.log('avatar updated successfully-----');
                            $('#uploadForm').resetForm();
                        },
                        error:function(err){
                            alert('上传失败了，请重试!');
                            $('.corporateDetailsLogo img').attr('src', oldImage);
                            console.log('error------', err);
                            $('#uploadForm').resetForm();
                        }
                    });
                }
                reader.readAsDataURL($(e.target)[0].files[0]);
            }
    }
    ,editDescriptionInfo: function editDescriptionInfo(e){

        var me = this;

         lbs.modHelper.getView('/workspace/profile/editCorporateDescriptionDetails.html')
                    .then(function(view){
                        lbs.modHelper.setContainer({
                            container:'.corporateDetailsDescriptionContainer'
                            ,html:Mustache.render(view,{profile:me.CorporateDetails})
                        });
                    })
                    .then(function(){
                        lbs.binder.unbind(me.boundValueHolder);
                        me.boundValueHolder = lbs.binder.bind('#corporateDetailsDescription',me.CorporateDetails.description,'description');

                        var i = -1,len=me.boundValueHolder.length;
                        while(++i<len){
                            me.boundValueHolder[i].updateUI();
                        }

                            lbs.actionHandler({
                                container:'#corporateDetailsDescription'
                                ,handlers:me.handlers
                            });
                    })

        jQuery('#saveDescINfoBtn').removeClass('hide');
        jQuery('#editDescINfoBtn').addClass('hide');

    }
    ,saveDescriptionInfo: function saveDescriptionInfo(e){

        var me = this;

        jQuery('#saveDescINfoBtn').addClass('hide');
        jQuery('#editDescINfoBtn').removeClass('hide');



        lbs.modHelper.getView('/workspace/profile/saveCorporateDescriptionDetails.html')
            .then(function(view){
                lbs.modHelper.setContainer({
                    container: '.corporateDetailsDescriptionContainer'
                    ,html:Mustache.render(view,{profile:me.CorporateDetails})
                });

            });


        lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/description/'+me.CorporateDetails._id+'.json',null,null,'PUT', me.CorporateDetails)
            .then(function(response){
                console.log('saved----');
            });

    }
    ,uploadCorporateDetailAttachements: function uploadCorporateDetailAttachements(e){

        var me = this;


        var input = $(e.target),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),
            ext = label.split('.').pop();
            ext = ext.toLowerCase();


        if ($(e.target)[0].files[0]) {
            var reader = new FileReader();

            reader.onload = function (e){
                input.closest('.uploadFileContainer').find('.uploadedFileName').text(label);

            }
            reader.readAsDataURL($(e.target)[0].files[0]);
        }

        input.closest('.attachmentFileUploaderUploader').addClass('uploadDingAttachment');

        $('#uploadAttachmentForm').ajaxSubmit({
            type:'POST',
            url:'workspace/profiles/v1/corporateDetails/description/attachment.json',

            data:{"json":JSON.stringify({_id:me.CorporateDetails._id, description:{attachment:[]}})},
            dataType: 'json',
            success:function(response){

                console.log('saved----');

                var latest = response.pl;

                console.log('latest',latest);


                var $el = jQuery('<li> <img class="fileTypeIcon"  src="../commons/images/attachment'+latest.fm+'.jpg"><a href="'+latest.url+'">'+latest.nm+'</a><strong class=" glyphicon glyphicon-trash pull-right" data-id="'+latest.uuid+ '" data-action-click="corporate:details:attachement:delete" data-toggle="toolpit" title="删除"></strong></li>')

                jQuery('.detailPageAttatchmentLine').append($el);

                lbs.actionHandler({
                    container:$el
                    ,handlers:me.handlers
                });


                me.CorporateDetails.description.attachment.push(latest);

                input.closest('.uploadFileContainer').find('.uploadedFileName').text('');

                input.closest('.attachmentFileUploaderUploader').removeClass('uploadDingAttachment');

                console.log('attachments updated successfully-----');
                $('#uploadAttachmentForm').resetForm();
            },
            error:function(err){
                alert('上传失败了，请重试!');
                console.log('error------', err);
                $('#uploadAttachmentForm').resetForm();
            }
        });

    }
    ,deleteCorporateDetailAttachements:function deleteCorporateDetailAttachements(e){

        console.log('deleting----');

        var me = this;
        var uuid = e.target.getAttribute('data-id');
        var targetDomel = $(e.target).closest('li');


        var index =  lbs.util.find({arr:me.CorporateDetails.description.attachment,key:'uuid',val:uuid});

        console.log('deleting id',uuid);
        jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');

        lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/description/attachment/'+me.CorporateDetails._id+'/'+uuid+'.json',null,null,'DELETE')
            .then(function(response){

                targetDomel.remove();
                console.log('delete successful');


                me.CorporateDetails.description.attachment.splice(index,1);
                jQuery('.newfaqspinner .spinnerContainer').addClass('hide');
            })

    }
    ,editCorporateDetailImage: function editCorporateDetailImage(e){


        jQuery('#editImageINfoBtn').addClass('hide');
        jQuery('#saveImageINfoBtn').removeClass('hide');
        jQuery('.deleteCorporatedetailsImage').removeClass('hide');
        jQuery('.imageUploaderContainer').removeClass('hide');
    }
    ,uploadCorporateDetailImage: function uploadCorporateDetailImage(e){

        var me = this;
        var input = $(e.target),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),
            ext = label.split('.').pop();
        ext = ext.toLowerCase();


        if ($(e.target)[0].files[0]) {
            var reader = new FileReader();

            reader.onload = function (e){
                input.closest('.uploadFileContainer').find('.uploadedFileName').text(label);

            }
            reader.readAsDataURL($(e.target)[0].files[0]);
        }

        input.closest('.attachmentFileUploaderUploader').addClass('uploadDingAttachment');

        $('#uploadCorporateDetailsImageForm').ajaxSubmit({
            type:'POST',
            url:'workspace/profiles/v1/corporateDetails/images.json',

            data:{"json":JSON.stringify({_id:me.CorporateDetails._id})},
            dataType: 'json',
            success:function(response){
                console.log('saved----');

                var latest = response.pl;


                var $el = jQuery('  <div class="lan_margin_10 singleCorporateDetailsImage">   <span data-id="'+latest.uuid+'" data-action-click="corporate:details:image:delete" class="glyphicon glyphicon-trash deleteCorporatedetailsImage"></span>  <img src="'+latest.url+'" alt="image"> </div>');
                jQuery('.corporateDetailsImageContainer').append($el);

                lbs.actionHandler({
                    container:$el
                    ,handlers:me.handlers
                });


                me.CorporateDetails.images.push(latest);

                input.closest('.attachmentFileUploaderUploader').removeClass('uploadDingAttachment');
                input.closest('.uploadFileContainer').find('.uploadedFileName').text('');


                $('#uploadCorporateDetailsImageForm').resetForm();
            },
            error:function(err){
                alert('上传失败了，请重试!');
                console.log('error------', err);
                $('#uploadCorporateDetailsImageForm').resetForm();
            }
        });
    }
    ,saveCorporateDetailImage: function saveCorporateDetailImage(e){

        var me = this;

        jQuery('#editImageINfoBtn').removeClass('hide');
        jQuery('#saveImageINfoBtn').addClass('hide');
        jQuery('.imageUploaderContainer').addClass('hide');
        jQuery('.deleteCorporatedetailsImage').addClass('hide');

    }
    ,deleteCorporateDetailImage: function deleteCorporateDetailImage(e){

        console.log('deleting----');
        var me = this;
        var uuid = e.target.getAttribute('data-id');
        var targetDomel = $(e.target).closest('.singleCorporateDetailsImage');


        console.log('deleting id',uuid);

       lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/images/'+me.CorporateDetails._id+'/'+uuid+'.json',null,null,'DELETE')
          .then(function(response){



               var latest = response.pl;

               if(latest.status ===true)
               {
                   targetDomel.remove();
                   console.log('delete successful');

               }
               else  if(latest.status ===false)
               {
                   console.log('delete failed');
                   alert('删除失败，请重试');

               }

            })

    }
    ,editCorporateDetailAudio:function editCorporateDetailAudio(e) {
        var me = this;


        jQuery('#editAudioINfoBtn').addClass('hide');
        jQuery('#saveAudioINfoBtn').removeClass('hide');
        jQuery('.audioUploaderContainer').removeClass('hide');
        jQuery('.deleteCorporatedetailsAudio').removeClass('hide');


    }
    ,addnewCorporateDetailAudio:function addnewCorporateDetailAudio(e){
        var me = this;


        var _id =   me.CorporateDetails._id;
        var url =  jQuery('#audioLinkToEmbed').val();
        var newaudio = {url:url ,_id:_id};

        console.log('newaudio----',newaudio);

        if(newaudio.url){



            lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/audios.json',null,null,'POST', newaudio)
                .then(function(response){
                    console.log('saved----');

                    var latest = response.pl;

                    me.CorporateDetails.audios.push(latest);



                    var addaudio = '<div class="audioContainer added lan_padding_20"> <span data-id="'+latest.uuid+'" data-action-click="corporate:details:audio:delete" class="glyphicon glyphicon-trash  deleteCorporatedetailsAudio"></span> <audio controls=""><source src="'+latest.url+'" type="audio/mp4">  </audio> </div>'
                    jQuery('.corporateDetailsAudioContainer').append(addaudio);
                    jQuery('#audioLinkToEmbed').val('');

                    var $el = jQuery('.audioContainer.added:last-child');

                    lbs.actionHandler({
                        container:$el
                        ,handlers:me.handlers
                    });

                });
        }
    }
    ,deleteCorporateDetailAudio:function deleteCorporateDetailAudio(e){

        console.log('deleting----');
        var me = this;
        var uuid = e.target.getAttribute('data-id');
        var targetDomel = $(e.target).closest('.audioContainer');

        console.log('deleting id:--',uuid);


         lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/audios/'+me.CorporateDetails._id+'/'+uuid+'.json',null,null,'DELETE')
           .then(function(response){

                 var latest = response.pl;

                 if(latest.status ===true)
                 {

                     targetDomel.remove();
                     console.log('delete successful');
                 }
                 else  if(latest.status ===false)
                 {
                     console.log('delete failed');
                     alert('删除失败，请重试');

                 }


             })

    }
    ,saveCorporateDetailAudio:function saveCorporateDetailAudio(e) {
        var me = this;

        jQuery('#saveAudioINfoBtn').addClass('hide');
        jQuery('#editAudioINfoBtn').removeClass('hide');
        jQuery('.audioUploaderContainer').addClass('hide');
        jQuery('.deleteCorporatedetailsAudio').addClass('hide');


    }
    ,editCorporateDetailVideo:function editCorporateDetailVideo(e) {
        var me = this;


        jQuery('#editVideoINfoBtn').addClass('hide');
        jQuery('#saveVideoINfoBtn').removeClass('hide');
        jQuery('.videoUploaderContainer').removeClass('hide');
        jQuery('.deleteCorporatedetailsVideo').removeClass('hide');


    }
    ,addnewCorporateDetailVideo:function addnewCorporateDetailVideo(e){

        var me = this;


        var _id =   me.CorporateDetails._id;
        var url =   jQuery('#videoLinkToEmbed').val();
        var newvid = {url:url ,_id:_id};


        console.log('inputLink----',newvid);


        if(newvid.url){

            lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/videos.json',null,null,'POST', newvid)
                .then(function(response){

                    console.log('saved----');

                    var latest = response.pl;


                    me.CorporateDetails.videos.push(latest);
                    var addvideo = '<div class="videoContainer added lan_padding_20">  <span data-id="'+latest.uuid+ '" data-action-click="corporate:details:video:delete" class="glyphicon glyphicon-trash   deleteCorporatedetailsVideo"> </span><embed src="'+latest.url+'"  allowFullScreen="true" quality="high" width="100%" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed></div>'
                    jQuery('.corporateDetailsVideoContainer').append(addvideo);
                    jQuery('#videoLinkToEmbed').val('');


                    var $el = jQuery('.videoContainer.added:last-child');

                    lbs.actionHandler({
                        container:$el
                        ,handlers:me.handlers
                    });

                });
           }
    }
    ,saveCorporateDetailVideo:function saveCorporateDetailVideo(e) {
        var me = this;

        jQuery('#saveVideoINfoBtn').addClass('hide');
        jQuery('#editVideoINfoBtn').removeClass('hide');
        jQuery('.videoUploaderContainer').addClass('hide');
        jQuery('.deleteCorporatedetailsVideo').addClass('hide');
    }
    ,deleteCorporateDetailVideo:function deleteCorporateDetailVideo(e){


        console.log('deleting----');
        var me = this;
        var uuid = e.target.getAttribute('data-id');
        var targetDomel = $(e.target).closest('.videoContainer');


        console.log('deleting id',uuid);

         lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/videos/'+me.CorporateDetails._id+'/'+uuid+'.json',null,null,'DELETE')
          .then(function(response){


                 var latest = response.pl;

                 if(latest.status ===true)
                 {
                     targetDomel.remove();
                     console.log('delete successful');
                 }
                 else  if(latest.status ===false)
                 {
                     console.log('delete failed');
                     alert('删除失败，请重试');

                 }

         })

    }
    ,deleteSingleCorporateDetailFaq:function deleteSingleCorporateDetailFaq(e){

        console.log('deleting----');

        var me = this;
        var uuid = e.target.getAttribute('data-id');
        var faqDomelem = $(e.target).closest('.questionAnswerPairs');

        var index =  lbs.util.find({arr:me.CorporateDetails.faq,key:'uuid',val:uuid});

        jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');

        lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/faq/'+me.CorporateDetails._id+'/'+uuid+'.json',null,null,'DELETE')
            .then(function(response){

                var latest = response.pl;

                if(latest.status ===true)
                {
                    faqDomelem.remove();
                    console.log('delete successful');
                    me.CorporateDetails.faq.splice(index, 1);

                }
               else  if(latest.status ===false)
                {
                    console.log('delete failed');
                    alert('删除失败，请重试');

                }


                jQuery('.newfaqspinner .spinnerContainer').addClass('hide');

            })
    }
    ,editSingleCorporateDetailFaq:function editSingleCorporateDetailFaq(e){

        console.log('editing single----');

        var me = this;

        jQuery('.corporateDetailsFaqEdit').addClass('hide');
        jQuery('.corporateDetailsFaqSave').removeClass('hide');


        var q = $(e.target).closest('.questionAnswerPairs').find('.questionText').text();
        var a = $(e.target).closest('.questionAnswerPairs').find('.answerText').text();

        $(e.target).closest('.questionAnswerPairs').find('.questionText').parent().html('<textarea  class="form-control" id="EditedQuestionField" placeholder="请输入问题..." rows="1"></textarea>');
        $(e.target).closest('.questionAnswerPairs').find('.answerText').parent().html('  <textarea   class="form-control" id="EdtitedAnswerField"  placeholder="请输入解答..." rows="3"></textarea>');
        $('#EditedQuestionField').val(q);
        $('#EdtitedAnswerField').val(a);


    }
    ,saveSingleCorporateDetailFaq:function saveSingleCorporateDetailFaq(e){

        var me = this;

        var q =  $('#EditedQuestionField').val();
        var a =  $('#EdtitedAnswerField').val();



        console.log('daving single----');

        var uuid = e.target.getAttribute('data-id');

        var newValues = {q:q,a:a,uuid:uuid,_id:me.CorporateDetails._id};

        console.log('uuid',uuid);

      var index =  lbs.util.find({arr:me.CorporateDetails.faq,key:'uuid',val:uuid});

        console.log('index-----',index);

        console.log(me.CorporateDetails.faq[index]);
        jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');

        console.log('deleting id',uuid);
        lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/faq/'+newValues._id+'/'+newValues.uuid+'.json',null,null,'PUT',newValues)
            .then(function(response){

                var latest = response.pl;

                if(latest.status === true){

                    me.CorporateDetails.faq[index].q = newValues.q;
                    me.CorporateDetails.faq[index].a = newValues.a;

                    $(e.target).closest('.questionAnswerPairs').find('#EditedQuestionField').parent().html('  <div class="questionText">'+newValues.q+'</div>');
                    $(e.target).closest('.questionAnswerPairs').find('#EdtitedAnswerField').parent().html('<div class="answerText">'+newValues.a+'</div>');


                    console.log('update successful');
                }
                else if(latest.status === false){
                    alert('编辑保存失败！');
                     console.log('update failed');
                }


                jQuery('.corporateDetailsFaqEdit').removeClass('hide');
                jQuery('.corporateDetailsFaqSave').addClass('hide');
                jQuery('.newfaqspinner .spinnerContainer').addClass('hide');

            });

    }
    ,editCorporateDetailFaq: function editCorporateDetailFaq(e){
        var me = this;

        lbs.modHelper.getView('/workspace/profile/editCorporateFAQDetails.html')
            .then(function(view){
                lbs.modHelper.setContainer({
                    container:'.corporateDetailsFAQContainer'
                    ,html:Mustache.render(view,{profile:me.CorporateDetails})
                });
            })
            .then(function(){
                lbs.binder.unbind(me.boundValueHolder);
                me.boundValueHolder = lbs.binder.bind('.corporateDetailsFAQContainer',me.CorporateDetails,'faq');

                var i = -1,len=me.boundValueHolder.length;
                while(++i<len){
                    me.boundValueHolder[i].updateUI();
                }


                lbs.actionHandler({
                    container:'.corporateDetailsFAQContainer'
                    ,handlers:me.handlers
                });
            })

        jQuery('#editFaqINfoBtn').addClass('hide');
        jQuery('#saveFaqINfoBtn').removeClass('hide');


    }
    ,saveCorporateDetailFaq: function saveCorporateDetailFaq(e){
        var me = this;
        lbs.modHelper.getView('/workspace/profile/saveCorporateFAQDetails.html')
            .then(function(view){
                lbs.modHelper.setContainer({
                    container:'.corporateDetailsFAQContainer'
                    ,html:Mustache.render(view,{profile:me.CorporateDetails})
                });
            })
            .then(function(){
                lbs.basemodule.pageComplete({secondLoad:true});
            });

        jQuery('#saveFaqINfoBtn').addClass('hide');
        jQuery('#editFaqINfoBtn').removeClass('hide');

    }
    ,saveNewCorporateDetailFaq: function saveNewCorporateDetailFaq(e){

        var me = this;

        var newq =  jQuery('#newQuestionField').val();
        var newa =  jQuery('#newAnswerField').val();



        if(newq&&newa)
        {
            var _id =   me.CorporateDetails._id;
            var newfaq = {q:newq, a:newa,_id:_id};

            // me.CorporateDetails.faq.push(newfaq);
            jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');


            lbs.modHelper.getMessage('/workspace/profiles/v1/corporateDetails/faq.json',null,null,'POST',newfaq)
                .then(function(response){
                    console.log(response);
                    var latest = response.pl;
                    console.log('added');

                    me.CorporateDetails.faq.push(latest);
                    jQuery('.newfaqspinner .spinnerContainer').addClass('hide');

                    lbs.modHelper.getView('/workspace/profile/saveNewCorporateDetailsFaq.html')
                        .then(function(view){
                            var newfaqTemplate = Mustache.to_html(view,latest);
                            jQuery('.questionAnswerPairsContainer').append(newfaqTemplate);
                            var $el = jQuery('.questionAnswerPairs.added:last-child');

                            lbs.actionHandler({
                                container:$el
                                ,handlers:me.handlers
                            });
                        });
                    jQuery('#newfaqAdder').find('textarea').val('');
                    jQuery('.newfaqspinner .spinnerContainer').addClass('hide');
                });
        }
        else{
            alert('请输入常见问题与解答！');
        }

    }
,handlers:{
    }
    ,remove : function remove(){
    }
};