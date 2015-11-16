/**
 * 
 * operation type mod,view:
 *   save time started in this
 *   save container to set in lbs.loadingMods[containerCssQuery].push({started, url})
 *   save where the mod registers for example (/workspace/static/smm/myservices.js registers in lbs.smm.myservices)
 *   add this to lbs.modules[url]
 *   
 *   after loading/cache 
 *     check lbs.loadingMods[containerCssQuery].push({started, url}) for a more recent one; if so return and do nothing
 *     if not call init on lbs.modules[url]
 *     
 *   init will load html (fetch and dobind)
 */
/**
 * End testing
 */
//@todo if not lbs.smm then load smm module first, code should not be here
//  
lbs.smm = lbs.smm || (function(){
  var Smm = function smm(arg){
    this.actions={};
  };
  Smm.prototype.cache = {};
  Smm.prototype.basePath='/workspace/services';
  Smm.prototype.endPoints = {
    serviceTypes:Smm.prototype.basePath+'/servicetypes.json'
    ,myServices:Smm.prototype.basePath+'/myservices.json'
  };
  Smm.prototype.fetchTemplate = function fetchTemplate(arg){
    
  };
  Smm.prototype.init = function init(arg){
    // unregister old ajaxStop handler that's used by other code
    //  old way was to overwrite it 
    $(document).off('ajaxStop');//unregister other handlers, smm does not use this    
  };
  //@todo: inherit from baseModule
  return new Smm();
}());

lbs.smm.myservices = (function(){
  var MyServices = function MyServices(arg){
    //call parent
    lbs.smm.constructor.call(this,arg);
    this.container='#right_container';
    this.actions.openNewService=function openNewService(){
      //@todo: load the new service module
      lbs.actionHandler({
        container:this.container
        ,handlers:lbs.smm.actions
        ,type:'click'
      });
    };
    //registration routers/modules of smm if not already registered
    lbs.modules['/workspace/services/myserviceslist.js'] = 
            lbs.modules['/workspace/services/myserviceslist.js'] 
            || 'lbs.smm.myserviceslist';
  };
  //inherit from lbs.smm (is singleton just like this)
  MyServices.prototype=Object.create(lbs.smm.constructor.prototype);
  MyServices.prototype.constructor=MyServices;
  MyServices.prototype.init = function init(arg){
    //re use smm init code
    lbs.smm.constructor.prototype.init.call(this,arg);
    //get the template for this one and bind it
    //need to get the myserviceslist module at the same time;
    var fetchTemplate = new lbs.Fetcher();
    var me = this;//then after resolve needs a reference to this
    fetchTemplate.fetch({
      url:"/workspace/services/myservices.html"
      ,cache:this.cache
      ,type:'view'
      ,container:this.container
    }).then(function(msg){
      //no data to bind so we can continue
      jQuery(me.container).html(Mustache.render(msg,{}));
      //load the myserviceslist module here
      //  container for that one is: myservices-list-container
      new lbs.Fetcher().fetch({
        url:'/workspace/services/myserviceslist.js'//type mod is default
        ,cache:me.cache
      });
    });
  };
  return new MyServices();
}());
// unregister old ajaxStop handler that's used by other code
//  old way was to overwrite it 
$(document).off('ajaxStop');//unregister other handlers, smm does not use this
