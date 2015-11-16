lbs.smm.myserviceslist = (function(){
  var MyServicesList = function MyServicesList(arg){
    //call parent
    lbs.smm.constructor.call(this,arg);
    this.container='.myservices-list-container';
    this.view;
  };
  //inherit from lbs.smm (is singleton just like this)
  MyServicesList.prototype=Object.create(lbs.smm.constructor.prototype);
  MyServicesList.prototype.constructor=MyServicesList;
  MyServicesList.prototype.init = function init(arg){
    //re use smm init code
    lbs.smm.constructor.prototype.init.call(this,arg);
    //get the template for this one and bind it
    //need to get the myserviceslist module at the same time;
    var fetchTemplate = new lbs.Fetcher();
    var me = this;//then after resolve needs a reference to this
    fetchTemplate.fetch({
      url:"/workspace/services/myserviceslist.html"
      ,cache:this.cache
      ,type:'view'
      ,container:this.container
    }).then(function(msg){
      me.view=msg;
      return fetchTemplate.fetch({
        url:me.endPoints.myServices
        ,cache:false
        ,type:'endpoint'
        ,container:me.container
      });
    }).then(function(msg){
      console.log('got the data',msg);
      //got data to bind so should wait for the data to arrive
      //  maybe stack the thens to make sure data is loaded
      //  after template. template will be cached so goes quicker
      //  second time and will go flying when pre compiled
      console.log(msg);
      jQuery(me.container).html(Mustache.render(me.view,{myservices:msg.pl}));
    });
    //@todo: load the data
  };
  return new MyServicesList();
}());
