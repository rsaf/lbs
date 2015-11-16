/**
 * /home/activities client module
 * written by Harm Meijer: harmmeiier@gmail.com
 */
  lbs.routes['/home'] = {mod: 'lbs.home', location: '/main.js'};
  lbs.routes['/home/activities'] = {mod: 'lbs.home.activities', location: '/home/activities/main.js'};
  lbs.routes['/home/activities/activities'] = {mod: 'lbs.home.activities.activities', location: '/home/activities/main.js'};
  lbs.routes['/home/activities/application'] = {mod: 'lbs.home.activities.application', location: '/home/activities/main.js'};
  lbs.routes['/home/activities/payment'] = {mod: 'lbs.home.activities.payment', location: '/home/activities/main.js'};
  lbs.routes['/home/activities/done'] = {mod: 'lbs.home.activities.done', location: '/home/activities/main.js'};
  console.log('activities is loaded...');
  lbs.modules['/home/activities'] = {
    basePath:'/home/activities'
    ,endPoints:{}
    ,deps : ['/home']
    ,create : function create(){
      this.parent=lbs.home;
      lbs.home.activities = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      this.parent.render(arg)
      .then(function(){
          $("#home_main_containter_selector").addClass('notHomeMainContainer');//add a new class to the main_contaiter
          $("#home_main_containter_selector").removeClass('home_main_containter');
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{}
    ,remove : function remove(){
    }
  };
  
  lbs.modules['/home/activities/activities'] = {
    deps : ['/home/activities']
    ,container:'#home_main_containter_selector'
    ,create : function create(){
      this.parent=lbs.home.activities;
      lbs.home.activities.activities = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      console.log('activities activities render')
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      jQuery.when(
        lbs.modHelper.getView('/home/activities/activities.html')
        ,this.parent.render({fromChild:true})
      ).then(function(view){
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
        lbs.actionHandler({container:me.container,handlers:me.handlers});
        console.log('rendered resolved for activities/activities');
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{
      'activities:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
    }
  };
  
  lbs.modules['/home/activities/application'] = {
    deps : ['/home/activities']
    ,container:'#home_main_containter_selector'
    ,create : function create(){
      this.parent=lbs.home.activities;
      lbs.home.activities.application = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      console.log('activities application render')
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      jQuery.when(
        lbs.modHelper.getView('/home/activities/application.html')
        ,this.parent.render({fromChild:true})
      ).then(function(view){
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
        lbs.actionHandler({container:me.container,handlers:me.handlers});
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{
      'application:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
    }
  };

  lbs.modules['/home/activities/payment'] = {
    deps : ['/home/activities']
    ,container:'#home_main_containter_selector'
    ,create : function create(){
      this.parent=lbs.home.activities;
      lbs.home.activities.payment = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      console.log('activities payment render')
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      jQuery.when(
        lbs.modHelper.getView('/home/activities/payment.html')
        ,this.parent.render({fromChild:true})
      ).then(function(view){
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
        lbs.actionHandler({container:me.container,handlers:me.handlers});
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{
      'payment:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
    }
  };
  
  lbs.modules['/home/activities/done'] = {
    deps : ['/home/activities']
    ,container:'#home_main_containter_selector'
    ,create : function create(){
      this.parent=lbs.home.activities;
      lbs.home.activities.done = this;
      delete this.deps;
      delete this.create;
    }
    ,render : function render(arg){
      console.log('activities done render')
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      jQuery.when(
        lbs.modHelper.getView('/home/activities/done.html')
        ,this.parent.render({fromChild:true})
      ).then(function(view){
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{}),container:me.container});
        lbs.actionHandler({container:me.container,handlers:me.handlers});
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{
      'activities:done:bbqUpdate': lbs.globalHandlers.bbqUpdate
    }
    ,remove : function remove(){
    }
  };
