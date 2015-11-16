
lbs.smm.myservicepoints = (function(){
  var MyServicePoints = function MyServicePoints(arg){
    //call parent
    lbs.smm.constructor.call(this,arg);
    this.container='#right_container';
  };
  //inherit from lbs.smm (is singleton just like this)
  MyServicePoints.prototype=Object.create(lbs.smm.constructor.prototype);
  MyServicePoints.prototype.constructor=MyServicePoints;
  MyServicePoints.prototype.init = function init(arg){
    //re use smm init code
    lbs.smm.constructor.prototype.init.call(this,arg);
    var fetchTemplate = new lbs.Fetcher();
    var me = this;//then after resolve needs a reference to this
    fetchTemplate.fetch({
      url:"/workspace/services/myservicepoints.html"
      ,cache:this.cache
      ,type:'view'
      ,container:this.container
    }).then(function(msg){
      //no data to bind so we can continue
      jQuery(me.container).html(Mustache.render(msg,{}));
      $('.selectpicker').selectpicker();
    });
  };
  return new MyServicePoints();
}());
// unregister old ajaxStop handler that's used by other code
//  old way was to overwrite it 
$(document).off('ajaxStop');//unregister other handlers, smm does not use this
