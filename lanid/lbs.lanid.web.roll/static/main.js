/**
 * Home client module
 * written by Harm Meijer: harmmeiier@gmail.com
 */
  lbs.routes['/home'] = {mod: 'lbs.home', location: '/main.js'};
  lbs.routes['/home-default'] = {mod: 'lbs.home-default', location: '/main.js'};
  lbs.routes['/home/activities'] = {mod: 'lbs.home.activities', location: '/home/activities/main.js'};
lbs.routes['/workspace/header'] = {mod: 'lbs.workspaceheader', location: '/workspace/main.js'};
lbs.routes['/processes/activities/responses:details'] = {mod: 'lbs.processes.activities.responses:details', location: '/processes/activities/main.js'};
  console.log('home is loaded...');
  lbs.modules['/home'] = {
    container:"body"
    ,rendered:false
    ,basePath:'/'
    ,endPoints:{}
    ,deps : ['/basemodule']
    ,create : function create(){
      var me = this;



      this.parent=lbs.basemodule;
      lbs.home = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      arg = arg || {};
      if(arg.fromChild!==true){
        return lbs.modHelper.getMod('/home-default')
        .then(function(mod){
          return mod.render({container:'#home_main_containter_selector'});
        });
      }
      var d = arg.defer || jQuery.Deferred();
      //load and render the body if not already done so
      var me = this;
      console.log('home render');
      if(!this.rendered){
        console.log('rendering home');
        this.parent.render()  // setting time out?
        .then(function(){//get the view
          return lbs.modHelper.getView(lbs.settings.views.masterTemplate);
        }).then(function(view){
          lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
          lbs.actionHandler({container:me.container,handlers:me.handlers});

          me.rendered=true;
          d.resolve();
        }).then(function(){
              lbs.modHelper.getMod('/workspace/header')
                  .then(function(mod){
                    console.log('header module activated-----');
                    mod.render({whatHeader:'home',container:'#home_header'});
                  });
            })
      }else{
        d.resolve();
      }
      return d.promise();
    }

    ,handlers:{
      'home:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
      //@todo, workspace is being removed, call menu remove and clean up
      this.rendered=false;
    }
  };
  
  //this is the home default(inter part), not routable but can only be created by / (lbs.home)
  lbs.modules['/home-default'] = {
    parent:null
    ,render : function render(arg){
      console.log('home-default render');
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      var randomString;


      lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo)
          .then(function(msg){

            $.bbq.pushState('#/workspace/welcome');
          }
          ,function(msg){


            jQuery.when(
                lbs.modHelper.getView(lbs.settings.views.interTemplate)
                ,me.parent.render({fromChild:true})
            ).then(function(view){


                  randomString=makeRandomString();
                  lbs.modHelper.setContainer({
                    mod:me
                    ,html:Mustache.render(view,{randomString:randomString})
                    ,container:arg.container
                  });

                  lbs.actionHandler({container:arg.container,handlers:me.handlers});
                  $("#home_main_containter_selector").removeClass('notHomeMainContainer');//add a new class to the main_contaiter
                  $("#home_main_containter_selector").addClass('home_main_containter');
                  d.resolve(arg);
                });




          })





      return d.promise();
    }
    ,deps : []
    ,remove : function remove(){
      console.log('removing home');
    }
    ,handlers:{
      'home-default:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,login : function login(e){
      e.preventDefault();

      var loginFailMsg = {'1':"用户名或密码有误 !!",'2':"验证码错误 !!"};

      var loginFail = function(msg){
        alert(loginFailMsg[msg]);
      };
      //@todo: could bind in template and bind these values to a login object
      //  maintained by this module
     // $(e.currentTarget).addClass('btnPressed');

      if($("#user_captcha").val()===$("#antiBotValue").val()){


        lbs.modHelper.getMessage(lbs.basemodule.endPoints.login,false,false,'POST',{
          "username": $("#username").val(),
          "password": $("#password").val(),
          "user_captcha": $("#user_captcha").val(),
          "antiBotValue": $("#antiBotValue").val()
        })
            .then(function(msg){
              if(msg&&msg.pl&&msg.pl.status===true){
                lbs.user=msg.pl;
                $.bbq.pushState('#/workspace/welcome');
              }
              else{
                loginFail('1');
              }
            })
            .fail(function(msg){
              loginFail('1');
            });

      }
      else{
        loginFail('2');
      }


      return;
      //check out http://localhost/home/home.js
      //$("#homeLoginSubmit").click(function (e) {
      var d = jQuery.Deferred();
      lbs.modHelper.getMessage(this.endPoints.login)
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
    ,create : function create(){
      lbs['home-default'] = this;
      var me = this;


      this.handlers['processes:activities:findbycode'] = function(e){

        console.log('clicked------');
        me.getActivityCodeModal(e);
      }

      this.handlers['processes:seach:by:code'] = function(e){

        me.findActivityByActivityCode(e);
      }


      this.handlers['home-default:login'] = function(e){
        me.login(e);
      }
      this.parent=lbs.home;
      delete this.deps;
      delete this.create;
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

  };
