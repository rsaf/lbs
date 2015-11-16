

lbs.routes['/details:nomenu'] = {mod: 'lbs.details:nomenu', location: '/details/main.js'};
lbs.routes['/workspace/login'] = {mod: 'lbs.workspacelogin', location: '/workspace/main.js'};
lbs.routes['/workspace/header'] = {mod: 'lbs.workspaceheader', location: '/workspace/main.js'};

console.log('details is loaded ...');

lbs.modules['/details:nomenu'] = {//lbs.details
    container:"body"
    ,rendered:false
    ,basePath:'/details'
    ,endPoints:{}
    ,deps : ['/basemodule','/workspace/login','/workspace/header']
    ,create : function create(){
      this.parent=lbs.basemodule;


        lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,null)
            .then(function(user){

                if(user&&user.pl){
                    lbs.user = user.pl;

                    if(!lbs.profile&&lbs.basemodule.endPoints["profile:"+lbs.user.userType]){
                        var   endPoint=lbs.basemodule.endPoints["profile:"+lbs.user.userType];


                        lbs.modHelper.getMessage(endPoint,false,null)
                                .then(function(profile){

                            lbs.profile = profile.pl;
                            console.log('lbs.profile----',lbs.profile);

                        });
                    }
                }
            });

       // reprevenDisabledClick();//todo: this is to prevent clicks on a disabled lan_button


      lbs['details:nomenu'] = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      $(document).off('ajaxStop');


      //only render if another module replaced the container (and set remove on me)    
      arg = arg || {};
      //load and render the body if not already done so
      var me = this;
      var ret;
      //@todo: when multiple mods and templates are loaded put the return (promise) in an array
      //  jQuery.when.apply(jQuery,promises).then(function(){
      //  this will load them simultaniously instead of stacking them in serie
      if(!this.rendered){
        ret = this.parent.render()
        .then(function(){//get the view
          return lbs.modHelper.getView("/workspace/master_no_menu.html");//@todo: modulise the menu based on lbs.user.userType
        }).then(function(view){
          lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});



                var urlFragmentArr =  $.param.fragment().split('/');
                urlFragmentArr.pop();
                var registrationPage = urlFragmentArr.pop();

                if(registrationPage!=='registration'){

                    return (lbs.user)?{pl:lbs.user}//either return user, get user from session or give user a chance to log in
                        :lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo,false,false)

                }

        }).then(
          function resolve (msg){
            if(msg&&msg.pl){
              lbs.user=msg.pl;
            }
            me.rendered=true;
              return lbs.modHelper.getMod('/workspace/header');

         },function reject(err){
            console.log('reject, but should continue after')
            lbs.user=false;
            me.rendered=true;
            return lbs.modHelper.getMod('/workspace/header');
        }).then(function(headerMod){
              arg = arg || {};


               if(lbs.user&&arg.registration=== undefined){

                    arg.whatHeader = 'workspace';
                    arg.container = '#header';

                }
                else
                {
                    arg.whatHeader = 'home';
                    arg.container = '#home_header';

                    jQuery('#footer').addClass('public_footer');

                }

                return headerMod.render(arg);
        });
      }
      return jQuery.when(ret);
    }
    ,remove : function remove(){
      this.rendered=false;
    }
    ,handleLogin : function handleLogin(arg){
      arg = arg || {};
      var me = this;
      var d = jQuery.Deferred();
      lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo, false,{})
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