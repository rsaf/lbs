/**
 * finance client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
    console.log('finance is loaded...');
  //registration routers/modules of smm if not already registered
  lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
  lbs.routes['/workspace/finance'] = 
    lbs.routes['/workspace/finance/status'] =
    lbs.routes['/workspace/finance/history'] =
        {mod: 'lbs.workspace.finance', location: '/workspace/finance/main.js'};
  lbs.routes['/workspace/finance/historyorg'] = lbs.routes['/workspace/finance/historyorg'] || {mod: 'lbs.workspace.financehistoryorg', location: '/workspace/main.js'};
  
  lbs.routes['/workspace/finance:list'] = {mod:'lbs.workspace.finance.list',location:'/workspace/finance/main.js'};

  lbs.modules['/workspace/finance'] = 
  lbs.modules['/workspace/finance/status'] =
  lbs.modules['/workspace/finance/history'] = {
    create:function(){
      this.parent = lbs.workspace;
      this.endPoints={};
      this.endPoints.status = this.basePath+'/history.json';
      this.endPoints.history = this.basePath+'/history.json';
      this.routeParams={//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
        '/workspace/finance/status':{
          listEndPoint:this.endPoints.status
          ,listView:'/workspace/finance/status.html'
          ,currentPage:'账户状态'
          ,balance1 : ['账户余额：']
          ,expences: ['累计消费：']
          ,showChargeButton:true
        }
        ,'/workspace/finance/history':{
          listEndPoint:this.endPoints.history
          ,listView:'/workspace/finance/history.html'
          ,currentPage:'交易统计'
          ,balance2 : {inCome:'共收入：', outCome:'共支出：', balance:'当前账户金额：'}
        }
      };
      var me = this;
      lbs.workspace.finance = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/finance'
    ,deps:['/workspace']
    ,container:'#right_container'
    ,routeParams:null
    ,render : function render(arg){
      var me = this;
      var route = jQuery.param.fragment();
      return lbs.modHelper.getMessage('/workspace/finance/balance.json',false,{},'GET')
          .then(function(balanceInfo){

              var mainBalance = balanceInfo.pl;

              console.log('mainBalance----',mainBalance);

              var data = {
                  container : '.container_bottom'
                  ,showChargeButton:me.routeParams[route].showChargeButton
                  ,balance:me.routeParams[route].balance
                  ,expences:me.routeParams[route].expences
                  ,mainBalance:mainBalance
              };
              return lbs.basemodule['general:list'].parentRender.call(me,{
                  listMod:'/workspace/finance:list'
                  ,mainView:'/workspace/finance/main.html'
                  ,data:data
              });

          });

    }
    ,handlers:{}
  };

  lbs.modules['/workspace/finance:list'] = {
  view:''
  ,list:[]
  ,viewUrl:null
  ,pageSize:10
  ,index:0
  ,render : function render(arg){
    return lbs.basemodule['general:list'].render.call(this,arg);
  }
  ,rerender: function (arg) {
    var me =  this;
    arg.color = lbs.modHelper.isVal({
      key : function(){
        var num = parseFloat(this.obj.field2,10);
        this.no = (num>=0)?'green':'red';
        if(isNaN(num)){this.no='';}
        this.obj=false;
        return 'colorkey';
      }
      ,val : 2,yes:'yes'
    });
    arg.shorter=lbs.util.shorter('createdAt',0,10);
    return lbs.basemodule['general:list'].rerender.call(this, arg)
    .then(function(){
      lbs.actionHandler({container:me.containerToSet,handlers:me.handlers});
    });
  }
  ,create : function(){
    lbs.workspace.finance.list = this;
    delete this.deps;
    delete this.create;
  }
  ,handlers:{}
  ,deps:[]
};

  lbs.modules['/workspace/finance/historyorg'] = {
    create:function(){
      this.parent = lbs.workspace;
      var me = this;
      lbs.workspace.financehistoryorg = this;
      delete this.deps;
      delete this.create;
    }
    ,basePath:'/workspace/finance'
    ,deps:['/workspace']
    ,container:'#right_container'
    ,routeParams:null
    ,render : function render(arg){
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      var route = jQuery.param.fragment();
      this.parent.render(arg)
      .then(function(){
        return lbs.modHelper.getView('/workspace/finance/historyorg.html');
      })
      .then(function(view){
        //no data to bind so we can continue
        lbs.modHelper.setContainer({mod:me,html:Mustache.render(
            view,{}),container:me.container});
        //registration handlers now, we rendered template and set innerhtml
        d.resolve();
      });
      return d.promise();
    }
    ,handlers:{}
  };
