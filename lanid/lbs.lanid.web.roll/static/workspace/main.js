/**
 * workspace client module
 * All controllers inherit from this one, for example /workspace and /smm inherit
 *   from this and everything under those modules inherit from /workspace or /smm
 * written by Harm Meijer: harmmeiier@gmail.com
 */
lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
lbs.routes['/workspace:nomenu'] = {mod: 'lbs.workspace:nomenu', location: '/workspace/main.js'};
lbs.routes['/workspace/menu'] = {mod: 'lbs.workspacemenu', location: '/workspace/main.js'};
lbs.routes['/workspace/login'] = {mod: 'lbs.workspacelogin', location: '/workspace/main.js'};
lbs.routes['/workspace/welcome'] = {mod: 'lbs.workspacewelcome', location: '/workspace/main.js'};
lbs.routes['/workspace/header'] = {mod: 'lbs.workspaceheader', location: '/workspace/main.js'};
lbs.routes['/processes/activities/responses:details'] = {mod: 'lbs.processes.activities.responses:details', location: '/processes/activities/main.js'};
lbs.routes['/workspace/notifications:list'] = {mod: 'lbs.workspace.notifications.list', location: '/workspace/notifications/main.js'};
lbs.routes['/workspace/notifications'] = {mod: 'lbs.workspace.notifications', location: '/workspace/notifications/main.js'};//todo this is needed as dependency of the list notification list
lbs.routes['/workspace/responses'] = {mod: 'lbs.workspace.responses', location: '/workspace/responses/main.js'};
lbs.routes['/workspace/responses:list'] = {mod:'lbs.workspace.responses.list',location:'/workspace/responses/main.js'};

lbs.routes['/workspace'] = {mod: 'lbs.workspace', location: '/workspace/main.js'};
console.log('workspace is loaded...');
lbs.modules['/workspace'] = {//lbs.workspace
  container:"body"
  ,rendered:false
  ,basePath:'/workspace'
  ,menu:null
  ,endPoints:{}
  ,deps : ['/basemodule','/workspace/menu','/workspace/login','/workspace/header']
  ,create : function create(){
    console.log('this is workspace create');
    this.parent=lbs.basemodule;
    this.endPoints.navigation = this.basePath+'/profiles/v1/navigation.json';
    lbs.workspace = this;
    delete this.deps;
    delete this.create;
  }
  ,render : function render(arg){


    jQuery(document).off('ajaxStop');
    //only render if another module replaced the container (and set remove on me)
    arg = arg || {};
    var d = arg.defer || jQuery.Deferred();
    //load and render the body if not already done so
    var me = this;
    //@todo: when multiple mods and templates are loaded put the return (promise) in an array
    //  jQuery.when.apply(jQuery,promises).then(function(){
    //  this will load them simultaniously instead of stacking them in serie
    console.log('workspace render');
    if(!this.rendered){

      this.parent.render()
          .then(function(){//get the view
            return lbs.modHelper.getView("/workspace/master.html");//@todo: modulise the menu based on lbs.user.userType
          }).then(function(view){
            lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
            me.rendered=true;
            return (lbs.user)?{pl:lbs.user}//either return user, get user from session or give user a chance to log in
                :lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,{});
          })
          .then(function(msg){

            if(msg && msg.pl){
              lbs.user = msg.pl;

            }

            //if(lbs.user &&lbs.user.userType!='admin'&& lbs.basemodule.endPoints["profile:"+lbs.user.userType]){
            //  var   endPoint=lbs.basemodule.endPoints["profile:"+lbs.user.userType];
            //}


            if(lbs.user&& lbs.basemodule.endPoints["profile:"+lbs.user.userType]){
              var   endPoint=lbs.basemodule.endPoints["profile:"+lbs.user.userType];
            }

            return jQuery.when(
                (lbs.profile)?{pl:lbs.profile}
                    :lbs.modHelper.getMessage(endPoint,false,{})
                ,lbs.modHelper.getMod('/workspace/menu')//get mod for menu
                ,lbs.modHelper.getMod('/workspace/header')//get mod for header
            );
          }).then(function(profile,menuMod,headerMod){
            if(profile&&profile.pl){

              lbs.profile = profile.pl;
          }
            me.menu=menuMod;

            return jQuery.when(
                me.menu.render({mobileContainer:".topMobileNavigations",bigContainer:".leftNavigations"})
                ,headerMod.render({container:'#header'})
            );
          }).then(function(){
            d.resolve();
          });

    }else{

      this.menu.showCurrentMenu();
      d.resolve();
    }
    return d.promise();
  }
  ,remove : function remove(){
    this.rendered=false;
    this.menu.remove();
  }
  ,handleLogin : function handleLogin(arg){
    arg = arg || {};
    var me = this;
    var d = jQuery.Deferred();
    lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo)
        .then(function(message){
          if(message.pl){
            lbs.user=message.pl;
          }
          d.resolve(message);
        })
        .fail(function(e){//@todo: render content with login module
          lbs.user=null;
          lbs.workspacelogin.render(arg)
              .then(function(msg){
                lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo)
                    .then(function(message){
                      if(message.pl){
                        lbs.user=message.pl;
                      }
                      d.resolve(message);
                    });
              });
        });
    return d.promise();
  }
};

lbs.modules['/workspace/menu'] = {
  userMinified:false
  ,userMaxified:false
  ,delay:false
  ,asBig:true
  ,asMobile:false
  ,currentContainer:''
  ,mobileContainer:'.topMobileNavigations'
  ,bigContainer:'.leftNavigations'
  ,render : function render(arg){


    //only render if another module replaced the container (and set remove on me)
    var menuView = "/workspace/welcome/menu.html";
    var jsonMenu;
    arg = arg || {};
    this.mobileContainer = arg.mobileContainer || this.mobileContainer;
    this.bigContainer = arg.bigContainer || this.bigContainer;
    this.currentContainer = this.bigContainer;
    var d = arg.defer || jQuery.Deferred();
    var split;
    var me = this;
    //@todo: set mobile and big container based on passed args with defaults
    jQuery.when(
        lbs.modHelper.getMessage(lbs.workspace.endPoints.navigation,true,{})
        ,lbs.modHelper.getView(menuView)
    ).then(function(msg,view){

          split = Math.ceil(msg.pl.length/2);
          jsonMenu = {menu1:msg.pl.slice(0,split),menu2:msg.pl.slice(split)};
          jsonMenu.menuNumber=1;
          lbs.modHelper.setContainer({
            mod:me
            ,html:Mustache.render(view,jsonMenu)
            ,container:me.bigContainer
          });
          lbs.actionHandler({container:me.bigContainer,handlers:me.handlers});
          me.showCurrentMenu();
          jQuery(window).on('resize.formenu',function(e){me.windowResizeDelay(e);});
          me.windowResize();
          d.resolve(arg);
        });
    return d.promise();
  }
  ,deps : []
  ,windowResizeDelay : function windowResizeDelay(e){
    //do not do resize on every microsecond, wait 250 miliseconds
    //  before actual code executes
    var me = this;
    clearTimeout(this.delay);
    this.delay = setTimeout(function(){
      me.windowResize(e);
    },250);
  }
  ,showCurrentMenu : function showCurrentMenu(){

    //@todo: not the best solution, depends too much on DOM
    var url = jQuery.param.fragment();
    var urlSplit = url.split('/');
    var i = urlSplit.length;
    var $menuItem = jQuery(this.currentContainer).find('.menu1 [data-linkto=\''+url+'\']');
    while(--i>-1){
      if($menuItem.length){
        break;
      }
      urlSplit.splice(i,1);
      $menuItem = jQuery(this.currentContainer).find('.menu1 [data-linkto=\''+urlSplit.join('/')+'\']');
      console.log(urlSplit.join('/'));
    }
    var $parentItem = $menuItem.parents('.nav_list_bg').find('.service_name');
    this.slideOpen({currentTarget:$parentItem[0]});
    this.handlers.highLightSelectedSubmunuItem({currentTarget:$menuItem[0],preventDefault:function(){}});
  }
  ,slideOpen:function(e){
    //@todo: only on current container
    jQuery(this.currentContainer).find('.nav-menu .nav_list_bg.open').removeClass('open');
    jQuery(e.currentTarget).parents('.nav_list_bg').addClass('open');
    //pita to slide down, jquery leaves a style=display:block that overrides hiding the menu later
    if(typeof e.preventDefault === 'function'){
      e.preventDefault();
      jQuery(e.currentTarget).siblings('div.detail_frame').hide().slideDown('fast').css('display','');
    }
  }
  ,remove : function remove(){
    console.log('removing menu');
    jQuery(window).off('resize.formenu');
  }
  ,windowResize:function windowResize(e){



    var needMobile = false;
    var width = jQuery(window).width();

    var menuEl;
    if (width < 991) {



      if(!this.userMaxified){
        this.toMini();
      }
      if (width < 421){

        needMobile=true;
        this.toNormal();
      }else if (width < 560) {
        jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery(".menu1").width() + 25);
      }else if (width < 760) {
        jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery(".menu1").width() + 20);
      }
      else {
        jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery(".menu1").width() + 20);
      }
    }
    else {
      if(!this.userMinified){
        this.toNormal();
      }
      jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery(".menu1").width() + 25);
    }
    //move menu from/to mobile big if needed

 //   if(needMobile && this.asBig){

    if(needMobile){
      console.log('need to move to mobile');
      jQuery(this.mobileContainer)[0]
          .appendChild(jQuery(this.currentContainer + ' > div')[0]);
      this.currentContainer = this.mobileContainer;
      this.asBig=false;
      this.asMobile=true;
    }
    if(!needMobile && this.asMobile){
      console.log('need to move to big');
      jQuery(this.bigContainer)[0]
          .appendChild(jQuery(this.currentContainer + ' > div')[0]);
      this.currentContainer = this.bigContainer;
      this.asBig=true;
      this.asMobile=false;
    }
  }
  ,toMini:function toMini(){
    jQuery(this.currentContainer).find(".menu1").addClass('mini');
    this.setPopovers();
  }
  ,toNormal:function toNormal(){
    jQuery(this.currentContainer).find(".menu1").removeClass('mini');
    this.removePopovers();
  }
  ,handlers:{
    highLightSelectedSubmunuItem : function (e) {
      e.preventDefault();
      var $this=jQuery(e.currentTarget);
      jQuery(".details").removeClass('highlighted');
      $this.addClass('highlighted');
      if(jQuery(".navbar-collapse.collapse.in").length){
        jQuery(".navbar-toggle").trigger('click');
      }
    }
    ,bbqUpdate: lbs.globalHandlers.bbqUpdate
  }
  ,setPopovers : function(){
    //@todo: can only pass string to the popover, all behavior has to be added
    //  after setting the popover
    //http://stackoverflow.com/questions/15989591/how-can-i-keep-bootstrap-popover-alive-while-the-popover-is-being-hovered
    jQuery(this.currentContainer).find('.nav_list_bg').each(function(){
      jQuery(this).popover({
        trigger:'click hover'
        ,html:true
        ,template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content" style="width:150px"></div></div>'
        ,container:'body'
        ,delay: { "show": 500, "hide": 1500 }
        ,content:jQuery(this).find('.detail_frame').html()});
    });


  }
  ,removePopovers : function(){
    jQuery(this.currentContainer).find('.nav_list_bg').popover('destroy');
  }
  ,miniMaxi:function(e){
    if(jQuery(this.currentContainer).find('.menu1.mini').length===0){
      this.userMinified=true;
      this.userMaxified=false;
      this.toMini();
    }else{
      this.userMinified=false;
      this.userMaxified=true;
      this.toNormal();
    }
    this.windowResize();
  }
  ,create : function create(){
    lbs.workspacemenu = this;
    var me = this;
    this.handlers.miniMaxi=function(e){
      me.miniMaxi(e);
    };
    this.handlers.slideOpen = function(e){
      me.slideOpen(e);
    };
    delete this.deps;
    delete this.create;
  }
};

lbs.modules['/workspace/login'] = {
  defer : null
  ,rendered : false

  ,create : function create(){
    var me = this;
    this.handlers.login = function(e){
      me.login(e);
    };

    this.handlers['recover:register'] = function(e){
      me.registerFromRecover(e);
    }

    this.handlers['reset:password:get:verification:code'] = function(e){
      me.sendVerificationCode(e);
    }
    this.handlers['modal:recover:password:box'] = function(e){
      me.recoverPasswordFromModal(e);
    }

    this.handlers['modal:recover:verification:code'] = function(e){
      me.recoverPasswordVerificationCodeGiven(e);
    }

    this.handlers['modal:recover:new:password'] = function(e){
      me.recoverPasswordNewPasswordGiven(e);
    }

    this.handlers['recover:login:from:registration:box'] = function(e){
      me.loginFromRegistrationBox(e);
    }


    this.handlers['recover:register:info:provided'] = function(e){
      me.registrationInfoProvided(e);
    }

    this.handlers.closeDialog = function(e){
      me.closeDialog(e);
    };
    lbs.workspacelogin = this;
    delete this.create;
    delete this.deps;
  }
  //parent renders this module, since it can be any parent we don't specify parent here
  //  render won't call parent.render either. At some point the menu can be a general module
  //  not only depending on workspace
  ,render : function render(arg){
    var me = this;


    console.log('loggin---------render',arg);

    $('#holdSpinnerContainer').removeClass('spinnerContainerAbsolute');

    if(!this.rendered){
      arg = arg || {};
      this.modalToHide = arg.modalToHide || false;
      this.persist=arg.persist || false;
      this.defer = jQuery.Deferred();
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
      jQuery(this.container).addClass('modal');
      lbs.modHelper.getView('/workspace/login.html')
          .then(function(view){
            jQuery(me.container).html(Mustache.render(view,arg));

            console.log('modalToHide-----',me.modalToHide);
            console.log('container-----',me.container);

            if(me.modalToHide!==false){
              jQuery(me.modalToHide).modal('hide');
            }
            jQuery(me.container).modal();
            jQuery(me.container).on('hide.bs.modal',me.handlers.closeDialog);

            $("#modalRegUserConfirmPassWord").keyup(checkPasswordMatch);
            passWordStrengh();

            lbs.actionHandler({handlers:me.handlers,container:me.container});
            this.rendered = true;
          });
    }
    return this.defer.promise();
  }

  ,login:function login(e){
    var me = this;
    e.preventDefault();
    console.log('loging in----');
    jQuery.post(
        lbs.basemodule.endPoints.login
        ,{
          password:document.getElementById('password').value
          ,username:document.getElementById('username').value
          //password:'123456'
          //,username:'leo'
          ,antiBotValue:'MSNP'
          ,user_captcha:'MSNP'
        }
    ).then(function resolve(e){
          console.log('after post',e);
          if(e&&e.pl&&e.pl.status===true){
            me.logedIn();
          }
        },function reject(msg){
          msg = (msg && msg.status === 0)?'You are disconnected, please connect and try again':'Login failed, please try again.';//@todo: should come from lbs.settings.messages
          jQuery('.login-status').html(msg);//@todo: should
          console.log('reject after post');
        });
  }
  ,closeDialog : function closeDialog(e){
    if(this.persist){
      e.preventDefault();
    }else{
      this.rendered=false;
    }
  }
  ,logedIn : function logedIn(){
    //remove event listeners
    jQuery(this.container).off('hide.bs.modal');
    jQuery(this.container).modal('hide');
    if(this.modalToHide){
      jQuery(this.modalToHide).modal('show');
    }
    jQuery(this.container).remove();
    this.rendered = false;

   // location.reload();
    this.defer.resolve();
  }
  ,registerFromRecover: function registerFromRecover(e){
    var me = this;

    $('#recoverModalRegTitle').removeClass('hide');
    $('#popUpResgitration').removeClass('hide');

    $('#popUpResetPassWord').addClass('hide');
    $('#recoverModalForgotPwTitle').addClass('hide');
    $('.modalLoginBox#home_login_form').addClass('hide');
    $('#recoverModalLoginTitle').addClass('hide');

  }
  ,recoverPasswordFromModal:function recoverPasswordFromModal(e){

    $('#popUpResetPassWord').removeClass('hide');
    $('#recoverModalForgotPwTitle').removeClass('hide');

    $('#recoverModalRegTitle').addClass('hide');
    $('#popUpResgitration').addClass('hide');
    $('.modalLoginBox#home_login_form').addClass('hide');
    $('#recoverModalLoginTitle').addClass('hide');

  }
  ,registrationInfoProvided: function registrationInfoProvided(e){

    var me = this;

    var registeredUser = jQuery('#popUpResgitration form').serializeObject();

    if(registeredUser.password != registeredUser.confirmPassword ){
      $('#modalRegIdNotMatching').removeClass('hide');
    }
    else{
      if( !($('#modalRegIdNotMatching').hasClass('hide'))){
        $('#modalRegIdNotMatching').addClass('hide');
      }

      lbs.modHelper.getMessage(lbs.basemodule.endPoints.register,null,null,'POST',registeredUser)
          .then(function(response){


            var latest = response.pl;

            console.log("made into thing",latest);

            if(latest&&latest.status){


              lbs.user = latest;

              me.logedIn();

              //var url = $.param.fragment();  //todo refeshing page
             // console.log('url--', url);
             // $.bbq.pushState('#'+ url);

            }
            else{
              alert("注册出错， 请重试");
            }

          });
    }

  }
  ,loginFromRegistrationBox:function loginFromRegistrationBox(e){
    var me  = this;
    $('#popUpResgitration').addClass('hide');
    $('#popUpResetPassWord').addClass('hide');
    $('#recoverModalRegTitle').addClass('hide');
    $('#recoverModalForgotPwTitle').addClass('hide');

    $('.modalLoginBox#home_login_form').removeClass('hide');
    $('#recoverModalLoginTitle').removeClass('hide');

  }

  ,sendVerificationCode:function sendVerificationCode(e){
    var me = this;

    var phone = $('#modalResetPassWordPhone').val();


    if(phone){


      this.countDowndManager('.transactionCountDown','.getVerificationCodeBtn');

      lbs.modHelper.getMessage('/home/user/recover/verification/'+phone+'.json',false,null,'POST',{mobile:phone})
          .then(function(response){

            if(response&&response.pl&&response.pl.status){

              me.phone = phone;
              console.log('mobile phonse save succesfully---',response);

            }
            else{
              $('#modalResetPwIdNotMatching').text('此手机号未绑定');
              $('#modalResetPwIdNotMatchingBox').removeClass('hide');
            }

          })

    }
    else
    {

      $('#modalResetPwIdNotMatching').text('请输入手机号');
      $('#modalResetPwIdNotMatchingBox').removeClass('hide');

    }
  }
  ,recoverPasswordVerificationCodeGiven:function recoverPasswordVerificationCodeGiven(e){

    var me = this;

    console.log('change---');
    $('#modalResetPassWordNewPassword').prop('disabled','')
    $('#modalResetPassWordConfirmNewPassword').prop('disabled','')


  }

  ,countDowndManager: function countDowndManager(container,btn){

    $('.verificationCodeSentNote').removeClass('hide');
    $(container).removeClass('hide');


    if($('.transactionCountDown').parents('.getVerificationCodeBtn').hasClass('disabled')){

          console.log('disabled--');
          return;
    }

    $(btn).addClass('disabled');

    preventDisabledClick();//todo: seems not being used;

    var countDownWorkSpace = setInterval(function(){


      var val = $(container).text();
      var intVal  = parseInt(val,10);
      if(intVal>0){
        $(container).text(intVal-1);
      }
      else{

        clearInterval(countDownWorkSpace);
        $(btn).removeClass('disabled');
        $('.verificationCodeSentNote').addClass('hide');
        $(container).addClass('hide');
        $(container).text('60');


      }

    },1000);


  }

  ,recoverPasswordNewPasswordGiven:function recoverPasswordNewPasswordGiven(e){

    var me = this;

    var code = $('#modalResetPassWordVerificationCode').val();

    var newPw = $('#popUpResetPassWord form').serializeObject();


    if(code){


          if(newPw.confirmNewPassword&&newPw.newPassword){


                if(newPw.confirmNewPassword === newPw.newPassword){


               return  lbs.modHelper.getMessage('/home/user/recover/verification/code/'+code+'.json',null,null,'POST',{userInfo:me.phone,code:code,mobile:me.phone,newPassword:newPw.newPassword})
                      .then(function(response){

                        console.log('user found by mobile---',response);

                        if(response&&response.pl&&response.pl.status){



                          jQuery.post(
                              lbs.basemodule.endPoints.login
                              ,{
                                password:newPw.newPassword
                                ,username:me.phone
                                ,antiBotValue:'MSNP'
                                ,user_captcha:'MSNP'
                              }
                          ).then(function resolve(e){
                                console.log('after reset--=====',e);
                                if(e&&e.pl&&e.pl.status===true){
                                  me.logedIn();
                                }
                              },function reject(msg){
                                msg = (msg && msg.status === 0)?'You are disconnected, please connect and try again':'Login failed, please try again.';//@todo: should come from lbs.settings.messages
                                jQuery('.login-status').html(msg);//@todo: should
                                console.log('reject after post');
                              });


                        }
                        else{

                          $('#modalResetPwIdNotMatching').text('验证码有误,请重试！');
                          $('#modalResetPwIdNotMatchingBox').removeClass('hide');

                        }

                      });


                }
                else{

                  console.log('password not matching--');

                  $('#modalResetPwIdNotMatching').text('密码不一致!');
                  $('#modalResetPwIdNotMatchingBox').removeClass('hide');

                }


          }
        else{
          $('#modalResetPwIdNotMatching').text('密码不能为空!');
          $('#modalResetPwIdNotMatchingBox').removeClass('hide');
        }

    }
    else{

      $('#modalResetPwIdNotMatching').text('请输入验证码');
      $('#modalResetPwIdNotMatchingBox').removeClass('hide');

    }


  }

  ,deps:[]
  ,handlers : {
  }
};

lbs.modules['/workspace/welcome'] = {
  defer : null
  ,rendered : false
  ,container: '#right_container'
  ,pageSize:5
  ,index:0
  //parent renders this module, since it can be any parent we don't specify parent here
  //  render won't call parent.render either. At some point the menu can be a general module
  //  not only depending on workspace
  ,render : function render(arg){
    arg = arg || {};
    var d = arg.defer || jQuery.Deferred();
    var me = this;//resolve handler needs a reference to this
    var view;
    var  endpoint1 = '/workspace/notifications/unread.json';
    var  endpoint2 = null;
    var  httpType = 'GET';
    this.parent.render(arg)
        .then(function(){
          console.log(lbs.user);
          if(lbs.user.userType==='personal'){
            view = "/workspace/welcome/personalHome.html";
            endpoint2 = '/workspace/activities/responses.json';
          httpType = 'GET'
            //endpoint2 = '/workspace/responses/all.json';

          }
          if(lbs.user.userType === 'corporate'){
            view = "/workspace/welcome/corporateHome.html";
            endpoint2 = '/workspace/activities/activities.json';
          }
          if(lbs.user.userType === 'admin'){
            view = "/workspace/welcome/adminHome.html";
          }
          //load child (list module) and view for this module
          return jQuery.when(lbs.modHelper.getView(view),
            lbs.modHelper.getMessage(endpoint1,false,null,'GET'),
            lbs.modHelper.getMessage(endpoint2,false,null,httpType)
          );
        })
        .then(function(view,jsonData1,jsonData2){
          //no data to bind so we can continue

          var item1,item2;

          if(jsonData1.pl){
            item1 = lbs.basemodule.fillup(jsonData1.pl.slice(me.index,me.index+me.pageSize),me.pageSize);

            lbs.workspace.notifications.list.list = item1;

          }

          if(jsonData2.pl){
            item2 = lbs.basemodule.fillup(jsonData2.pl.slice(me.index,me.index+me.pageSize),me.pageSize);

          }

          console.log('notif-----', jsonData1);
          console.log('activity-----', jsonData2);
          if(lbs.user.loginCount===1&&!me.shownModal&&lbs.fistTimeLogin) {//rolland jan.9
            console.log('welcome popup ---------');
            me.shownModal = true;

            lbs.util.showCountDownMessage({message:{action:'注册成功',goto:'进入个人中心'}});
          }
           lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{user:lbs.user,profile:lbs.profile, items1:item1,items2:item2,limitLengthDate:lbs.util.renderDateTime,date:lbs.util.renderDate,status:me.renderResponseStatus,status2:me.renderActivityStatus}),container:me.container});
          lbs.actionHandler({container:me.container, handlers:me.handlers});

          d.resolve();
        });
    return d.promise();
  }


  ,getActivityCodeModal:function getActivityCodeModal(e){

    var me = this;

    lbs.modHelper.getView('/processes/activities/enterCodeForSearch.html')
        .then(function(view){
          lbs.modHelper.setContainer({
            container: '#platformAPIsModal'
            , html: Mustache.render(view)
          });
          lbs.actionHandler({
            container: '#platformAPIsModal'
            , handlers: me.handlers
          });

          lbs.basemodule.pageComplete();

          $('#platformAPIsModal').modal().on('hide.bs.modal.enterCode');

          $('#platformAPIsModal').modal().off('hide.bs.modal.enterCode' , function(){

            lbs.modHelper.setContainer({
              container: '#platformAPIsModal'
              , html: ''
            });

          });

        })
  }

  ,findActivityByActivityCode:function findActivityByActivityCode(e){

    var me = this;

    var code = jQuery('#lanzhengCodeForResponse').val();

    if(code){

      $('#spinning_icon_sm').removeClass('hide');
      lbs.modHelper.getMod('/processes/activities/responses:details')
          .then(function(mod){
            console.log('response details modules---',mod);
            mod.render({code:code});

          })
    }
    else{
      $('.errorMessageHolder').text('蓝证码不能为空!')
      //@todo there is a function on the util basemodule page complete to clear the errror message on keydown;
    }

  }
  ,deps:['/workspace']
  ,handlers : {
  }

    ,renderResponseStatus: function(){

      return function(text, render) {

        var index;
        index = lbs.util.find({
          arr:lbs.settings.messages[lbs.settings.lang].responseStatus
          ,key:'val'
          ,val:render(text)
        });


        if(index!=-1)
        {
          return lbs.settings.messages[lbs.settings.lang].responseStatus[index].text;
        }

      }

    }

    ,renderActivityStatus:function(){

      return function(text, render) {
        var index;

        index = lbs.util.find({
          arr:lbs.settings.messages[lbs.settings.lang].publishingStatus
          ,key:'val'
          ,val:render(text)
        });

        if(index!==-1){
          return lbs.settings.messages[lbs.settings.lang].publishingStatus[index].text;
        }


      }

    }
  ,create : function create(){
    var me = this;



    this.handlers['processes:activities:findbycode'] = function(e){

      console.log('clicked------');
      me.getActivityCodeModal(e);
    }

    this.handlers['processes:seach:by:code'] = function(e){

      me.findActivityByActivityCode(e);
    }


    lbs.modHelper.getMod('/workspace/notifications').then(function(notificationMod){

        lbs.modHelper.getMod('/workspace/notifications:list').then(function(notificationListMod){

          jQuery.extend(me.handlers,notificationListMod.handlers);


          lbs.modHelper.getMod('/workspace/responses').then(function(response){

            lbs.modHelper.getMod('/workspace/responses:list').then(function(responseDetailMod){

              jQuery.extend(me.handlers,responseDetailMod.handlers);

            });

          });

        });

    });



    lbs.workspacewelcome = this;
    this.parent = lbs.workspace;
    delete this.create;
    delete this.deps;
  }
};

lbs.modules['/workspace/header'] = {
  deps : []
  ,create : function create(){
    lbs.workspaceheader = this;
    var me = this;

      this.handlers['workspace:header:logout']=function(e){
      me.logout(e);
    };
      this.handlers['search:by:key'] = function (e) {
        me.handleSearch(e);
      }


    delete this.deps;
    delete this.create;
  }
  ,render : function render(arg){
    arg = arg || {};
    var getHeaderView;
    var d = arg.defer || jQuery.Deferred();
    var me = this;


    if (arg.whatHeader&&(arg.whatHeader === 'home')){

      console.log('home header');
      jQuery('#home_header').removeClass('hide');
      jQuery('#header').addClass('hide');

      getHeaderView =    lbs.modHelper.getView('/home/header.html');
    }

    else {
      console.log('workspace header');
      getHeaderView =    lbs.modHelper.getView('/workspace/header.html');
        jQuery('footer').removeClass('home_footer');
        jQuery('footer').addClass('logedin_footer');

    }
    getHeaderView.then(function(view){

      lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{user:lbs.user}),container:arg.container});
      lbs.actionHandler({container:arg.container,handlers:me.handlers});
      lbs.basemodule.pageComplete();
      d.resolve();
    });
    return d.promise();
  }
  ,logout:function logout(e){
    e.preventDefault();
    lbs.modHelper.getMessage(lbs.basemodule.endPoints.logout)
        .then(function(msg){
          lbs.user=null;
          lbs.profile=null;
          if(lbs.workspace && lbs.workspace.endPoints && lbs.workspace.endPoints.navigation){
            lbs.cache[lbs.workspace.endPoints.navigation]=false;
          }
          lbs.globalHandlers.bbqUpdate(false,'/home');
        });
  }
  ,handleSearch:function handleSearch(e){

    var me = this;
    var searchKey = $('#searchValueHolder').val();
    var scope = $('#headerFileterSelectContainer select').val();



    var url = $.param.fragment();


      if(searchKey) {
          url = '#/home/detailPages/search/'+scope+'/' + searchKey;
          $.bbq.pushState(url);

      }
    else{
          url = '#/home/detailPages/search/'+scope;
          $.bbq.pushState(url);
      }

  }
  ,handlers:{
    'workspace:header:bbqUpdate': lbs.globalHandlers.bbqUpdate
    ,'workspace:header:search':function(e){
      //@todo: implement search
      console.log('preventing search to submit the form');
      e.preventDefault();
    }
    ,'workspace:header:openSettings':function(e){
      //@todo: for now it's static content but it should be an own module to
      //  open and edit user settings
      lbs.modHelper.getMod('/global:modal')
          .then(function(modalMod){
            modalMod.render({view:'/workspace/settingsModal.html',container:'#platformAPIsModal'});
          });
    }
  }

  ,remove : function remove(){
  }
};

lbs.modules['/workspace:nomenu'] = {//lbs.workspace
  container:"body"
  ,rendered:false
  ,basePath:'/workspace'
  ,endPoints:{}
  ,deps : ['/basemodule','/workspace/login','/workspace/header']
  ,create : function create(){
    this.parent=lbs.basemodule;
    this.endPoints.navigation = this.basePath+'/profiles/v1/navigation.json';
    lbs['workspace:nomenu'] = this;
    delete this.deps;
    delete this.create;
  }
  ,render : function render(arg){
    var endPoint;
    jQuery(document).off('ajaxStop');
    //only render if another module replaced the container (and set remove on me)
    arg = arg || {};
    //load and render the body if not already done so
    var me = this;
    var ret;
    //@todo: when multiple mods and templates are loaded put the return (promise) in an array
    //  jQuery.when.apply(jQuery,promises).then(function(){
    //  this will load them simultaniously instead of stacking them in serie
    if(!this.rendered){
      return this.parent.render()
          .then(function(){//get the view
            return lbs.modHelper.getView("/workspace/master_no_menu.html");//@todo: modulise the menu based on lbs.user.userType
          }).then(function(view){
            lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
            me.rendered=true;
            return    (lbs.user)?{pl:lbs.user}//either return user, get user from session or give user a chance to log in
                :lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,{});
          }).then(function(user){
            if(user&&user.pl){
              lbs.user = user.pl;

            }
            //if(lbs.user &&lbs.user.userType!='admin'&& lbs.basemodule.endPoints["profile:"+lbs.user.userType]){
            //  endPoint=lbs.basemodule.endPoints["profile:"+lbs.user.userType];
            //}
            if(lbs.user&& lbs.basemodule.endPoints["profile:"+lbs.user.userType]){
              endPoint=lbs.basemodule.endPoints["profile:"+lbs.user.userType];
            }


            return jQuery.when(
                (lbs.profile)?{pl:lbs.profile}:lbs.modHelper.getMessage(endPoint,false,{})
                ,lbs.modHelper.getMod('/workspace/header')//get mod for header
            );
          }).then(function(msg,headerMod){
            if(msg && msg.pl){
              lbs.profile = msg.pl;
            }
            return headerMod.render({container:'#header'});
          });
    }



  }
  ,remove : function remove(){
    this.rendered=false;
  }
  ,handleLogin : function handleLogin(arg){
    arg = arg || {};
    var me = this;
    var d = jQuery.Deferred();
    lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo)
        .then(function(message){
          if(message.er===null){
            lbs.user=message.pl;
          }
          d.resolve(message);
        })
        .fail(function(e){//@todo: render content with login module
          lbs.user=null;
          lbs.workspacelogin.render(arg)
              .then(function(msg){
                lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo)
                    .then(function(message){
                      if(message.er===null){
                        lbs.user=message.pl;
                      }
                      d.resolve(message);
                    });
              });
        });
    return d.promise();
  }
};


