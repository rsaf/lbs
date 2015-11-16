//do not want to break IE because of console.log
if (!(console && console.log)) {
  console = {
    log: function () {}
  };
}

///////////////////////
//
// Ed's Pagination Code
//
///////////////////////
var DEFAULT_PAGINATION_PAGE = 0;
var DEFAULT_PAGINATION_SIZE = 10;
var DEFAULT_PAGINATION_MAXPAGES = 5;

findInArray = function(array, fn){
    for(var i = 0; i < array.length; i ++)
    {
        if(fn(array[i]))
        {
            return i;
        }
    }
    return -1;
}
calculatePaginationElements = function(totalCount, requestedPage, requestedPageSize, doHyphentruncation){
    //Specify defaults
    if(requestedPage === undefined)
        requestedPage = DEFAULT_PAGINATION_PAGE;
    if(requestedPageSize === undefined)
        requestedPageSize = DEFAULT_PAGINATION_SIZE;
    if(totalCount === undefined) totalCount = 0;

    requestedPage = parseInt(requestedPage);
    requestedPageSize = parseInt(requestedPageSize);
    totalCount = parseInt(totalCount);

    var total_logical_pages = Math.ceil(totalCount/requestedPageSize);
    var pagination_elements = [];

    if(total_logical_pages == 0)
    {
        //We've nothing to really paginate, but show a pagination element anyways to the 'blank'
        var ele = {label:i+1, isLink: true, p:0, ps:requestedPageSize, current: true};
        pagination_elements.push(ele);
    }
    else if(total_logical_pages <= DEFAULT_PAGINATION_MAXPAGES){
        //We've space to show all pages, so just list all page's elements
        for(var i = 0; i < total_logical_pages; i++)
        {
            var ele = {label:i+1, isLink: true, p:i, ps:requestedPageSize, current: requestedPage == i};
            pagination_elements.push(ele);
        }
    }
    else
    {
        //We need to hide some of the pages
        //Show requested page in middle
        var reqIDX = parseInt(requestedPage);//Math.floor(DEFAULT_PAGINATION_MAXPAGES / 2)
        pagination_elements[reqIDX] = {label:parseInt(requestedPage)+1, isLink: true, p:requestedPage, ps:requestedPageSize, current: true};

        //Hip hop around filling away from middle
        var leftOvershoot = 0, rightOvershoot = 0;
        for(var i = 1; i < DEFAULT_PAGINATION_MAXPAGES; i++)
        {
            var scalarStep = i;
            var log1 = reqIDX - scalarStep;
            var log2 = reqIDX + scalarStep;

            if(log1 < 0) leftOvershoot++;
            if(log2 > total_logical_pages) rightOvershoot++;
            pagination_elements[log1] = {label: log1 + 1, isLink: true, p: log1, ps: requestedPageSize, current:false};
            pagination_elements[log2] = {label: log2 + 1, isLink: true, p: log2, ps: requestedPageSize, current:false};
        }
        pagination_elements = pagination_elements
            .filter(function(ele,k){return ele && ele.p >=0 && ele.p < total_logical_pages});
        var currAt = findInArray(pagination_elements,function(ele){return ele.current});
        var unsliced = pagination_elements.length;
        if(false && unsliced != 2 * DEFAULT_PAGINATION_MAXPAGES - 1 )//we're near an end
        {
            if (currAt <= DEFAULT_PAGINATION_MAXPAGES / 2)//we're near zero
            {
                pagination_elements = pagination_elements.slice(0, DEFAULT_PAGINATION_MAXPAGES);
            }
            else//we're near max\
             {
                pagination_elements = pagination_elements.slice(pagination_elements.length - DEFAULT_PAGINATION_MAXPAGES - rightOvershoot,pagination_elements.length)
                }
        }
        else
        {
            var left = Math.max(currAt - Math.floor(DEFAULT_PAGINATION_MAXPAGES/2) - (rightOvershoot>0?rightOvershoot-1:0),0);
            var right = currAt + Math.floor(DEFAULT_PAGINATION_MAXPAGES/2) + 1 + (leftOvershoot>1?leftOvershoot-2:0)
            pagination_elements = pagination_elements.slice(left,right)
        }
        //Always show first and last lgoical page
        //pagination_elements[0] = {label:1, isLink: true, p:0, ps:requestedPageSize, current: requestedPage == 0};
        //pagination_elements[DEFAULT_PAGINATION_MAXPAGES-1] = {label:total_logical_pages, isLink: true, p:total_logical_pages-1, ps:requestedPageSize, current: requestedPage == total_logical_pages-1};
    }
    return pagination_elements;
}
// function receiveGetPageResponse
/*
 Given a GET request on a .json endpoint of form:

 'GET .../foo.json?page=X&size=N'

 This function will ensure the received response
 results can be dumped into the view table. The
 response will also have a valid META field available
 to calculate number of pagination ui elements.
 */
receiveGetPageResponse = function(msg, requestedPage, requestedPageSize){
    //Specify defaults
    if(requestedPage === undefined)
        requestedPage = DEFAULT_PAGINATION_PAGE;
    if(requestedPageSize === undefined)
        requestedPageSize = DEFAULT_PAGINATION_SIZE;
    
    if(msg.mt && msg.mt.p == requestedPage && msg.mt.ps == requestedPageSize && msg.mt.tc !== undefined)
    {
        //The message payload has a meta object, and the server respected our parameters
        //We assume this structure as a result:
        /*
         {
         pl : [X*N...X*N+N],             //object array, length = msg.meta.pageSize
         er : {...},                     //error object
         meta: {
         page : X,                   //Which page of results this result set matches.
         pageSize : N                //How many results there are per page
         totalQueryResultCount : T   //Number of results matched by the query, ignoring pagination
         }
         }
         */
        return msg;
    }
    else if(!msg.mt)
    {
        console.log("b");

        //The message payload has no meta object, meaning server did not respect our request for pagination
        //We assume the server did a 'return all' and has this structure:
        /*
         {
         pl : [0...T],     //object array, length = (T)otal size
         er : {...},     //error object
         }
         */
        //We will therefore trim down the pl array, if we can, to just our requested page.

        var min_idx = requestedPage * requestedPageSize;
        var max_idx = (requestedPage+1) * requestedPageSize;


        msg.mt = {
            _inferred: true,
            p: requestedPage,
            ps: requestedPageSize

        }

        if(msg.pl)
        {

            msg.mt.tc = msg.pl.length;

            msg.pl = msg.pl.slice(min_idx,max_idx);
        }
        else
        {

            msg.mt.tc = 0;

        }
        return msg;
    }
    else
    {
        //The message payload has a meta object, but the server did not respect our pagination parameters
        //We assume the message is trash and throw an error

        throw new Error("INCONSISTENT PAGINATION PARAMETERS ON RESPONSE: Got "+JSON.stringify(msg.mt)+", but was expecting {page:"+requestedPage+", pageSize:"+requestedPageSize+", totalQueryResultCount: < some number >}");

    }
}
///////////////////////
//
// END Ed's Pagination Code
//
///////////////////////

var lbs = {};
lbs.modHelper = function (arg) {
  this.url = null;
  this.type = null;
  this.start = null;
  this.cache = lbs.cache;
  this.d = null;
};

lbs.fistTimeLogin = false;
lbs.modules = {};
lbs.loadingMods = {};
lbs.loadedModules = {};
lbs.cache = {};
lbs.browsers = {};
lbs.routes = {};
lbs.settings = {};
lbs.servicePointMap = {latitude:121.439936, longitude:31.205326};
//lbs settings are set here: wrapped in a function so it can be collapsed
(function () {
  lbs.settings.lang = 'cn';
  lbs.settings.messages = {
    cn: {}
  };
  lbs.settings.messages.validate = {};
  lbs.settings.messages.validate.service = {
    'NAME_EMPTY': '服务名称不能为空',
    'STANDARD_PRICE_NOT_NUMBER': '服务价格必须是一个数字',
    'DISCOUNT_PRICE_NOT_NUMBER': '优惠价格必须是一个数字'
  };
  lbs.settings.version = '?v=1.020';
  lbs.settings.views = {
    interTemplate: '/home/home.html',
    logedInInterTemplate: '/home/loggedInHome.html',
    masterTemplate: "/home/master.html"
  };
  lbs.settings.messages.serviceStatus = {
        '10': {
          val: 10,
          text: '等待'
        } //PENDING
        ,
        '20': {
          val: 20,
          text: '未处理'
        } //ISSUED
        ,
        '30': {
          val: 30,
          text: '已付款'
        } //PAID
        ,
        '40': {
          val: 40,
          text: '正在处理'
        } //UNDERPROCESSING
        ,
        '50': {
          val: 50,
          text: '已处理'
        } //PROCESSED
        ,
        '51': {
              val: 51,
              text: '取消'
        } //REJECTED

      };
  lbs.settings.messages.status = {
        '0': {
            id: 0,
            text: '未创建'
        } //creating
        ,
        '10': {
            id: 10,
            text: '等待'
        } //pending
        ,
        '20': {
            id: 20,
            text: '待处理'
        } //review
        ,
        '30': {
            id: 30,
            text: '成功'
        } //success
        ,
        '40': {
            id: 40,
            text: '拒绝'
        } //refused
    };
  lbs.settings.messages.userlimits = [   //todo: any change to this array should be updated on lbs.settings.messages.userlimits.object bellow
         {
            val: '0',
            text: '无需求'
         }, // no condition
         /*{
            val: '10',
            text: '注册用户'
        },
        *///registered
        {
            val: '20',
            text: '已认证个人用户'
        } //validated user
        ,
         {
            val: '30',
            text: '已认证单位用户'
        } //validated corporate user
      ,{
          val: '40',
          text: '认证用户'
      } //validated corporate user

    ];


  lbs.settings.messages.userlimits.object = {
        '无需求':   {
            val: 0,
            text: '无需求'
        }
        ,
        '注册用户': {
            val: 10,
            text: '注册用户'
        },
        '实名用户':  {
            val: 20,
            text: '实名用户'
        } //validated user
        ,
        '单位用户': {
            val: 30,
            text: '单位用户'
        }
    };


    lbs.settings.messages.standardPaymentActivities = [ //@todo: this needs to be an endpoint providing payment methods
        {
            val: '10',
            text: '响应用户付款'
        }, {
            val: '20',
            text: '预付款统一结算'
        }
        , {
            val: '30',
            text: '后付款统一结算'
        }





        //, {
        //  val: '5',
        //  text: '蓝证信用支付'
        //}
    ];




  lbs.settings.messages.standardPayment = [ //@todo: this needs to be an endpoint providing payment methods
    {
      val: '1',
      text: '在线支付'
    }, {
      val: '2',
      text: '现场支付'
    }
    //        , {
    //  val: '3',
    //  text: '预付款统一结算'
    //}
    //
    //, {
    //  val: '4',
    //  text: '后付款统一结算'
    //}



    //, {
    //  val: '5',
    //  text: '蓝证信用支付'
    //}
          ];
  lbs.settings.messages.cn.standardPayment = lbs.settings.messages.standardPaymentActivities;
  lbs.settings.messages.cn.activityTypes = [
    {
      val: "1",
      text: "证件办理事务"
    }
   ,{
      val: "2",
      text: "中小学教育与学生学业事务"
    }
    ,{
      val: "3",
      text: "高等教育与学生学业事务"
    }
    ,{
      val: "4",
      text: "考试报名事务"
    }
    ,{
      val: "5",
      text: "中国出入境事务"
    }
    ,{
      val: "6",
      text: "亚洲国家签证事务"
    }
    ,{
      val: "7",
      text: "欧洲国家签证事务"
    }
    ,{
      val: "8",
      text: "北美洲国家签证事务"
    }

    ,{
      val: "9",
      text: "南美洲国家签证事务"
    }
    ,{
      val: "10",
      text: "大洋洲国家签证事务"
    }
    ,{
      val: "11",
      text: "非洲国家签证事务"
    }

    ,{
      val: "12",
      text: "信用评价事务"
    }
    ,{
      val: "13",
      text: "银行金融事务"
    }
    , {
      val: "14",
      text: "证券期货事务"
    }
    , {
      val: "15",
      text: "网站备案事务"
    }
    , {
      val: "16",
      text: "网站注册认证事务"
    }
    , {
      val: "17",
      text: "电信服务事务"
    }
    , {
      val: "18",
      text: "求职应聘事务"
    }
    , {
      val: "19",
      text: "人事管理事务"
    }
    , {
      val: "20",
      text: "体育运动事务"
    }
    , {
      val: "21",
      text: "自愿者事务"
    }
    , {
      val: "22",
      text: "公益服务事务"
    }
    , {
      val: "23",
      text: "大型活动事务"
    }
    , {
      val: "24",
      text: "医疗健康事务"
    }
    , {
      val: "25",
      text: "物流管理事务"
    }
    , {
      val: "26",
      text: "家政服务事务"
    }
    , {
      val: "27",
      text: "物业服务事务"
    }
    , {
      val: "28",
      text: "交运服务事务"
    }
    , {
      val: "29",
      text: "商贸服务事务"
    }
    , {
      val: "30",
      text: "调研统计事务"
    }
    , {
      val: "31",
      text: "政务服务事务"
    }
    , {
      val: "32",
      text: "法律服务事务"
    }
    , {
      val: "33",
      text: "婚介服务事务"
    }
    , {
      val: "34",
      text: "社交服务事务"
    }
    , {
      val: "35",
      text: "房地产服务事务"
    }
    , {
      val: "36",
      text: "商务旅行事务"
    }
    , {
      val: "37",
      text: "服饰服务事务"
    }
    , {
      val: "38",
      text: "餐饮服务事务"
    }
    , {
      val: "39",
      text: "文化娱乐事务"
    }
    , {
      val: "40",
      text: "彩票服务事务"
    }
    , {
      val: "41",
      text: "其它"
    }
  ];
  lbs.settings.messages.cn.publishingStatus = [
    {
      val: "1",
      text: "未创建"
    } //not created
   , {
      val: "4",
      text: "创建中"
    } //saved
   , {
      val: "7",
      text: "未发布"
    } //unpublished
   , {
      val: "10",
      text: "审核中"
    } //reviewing (when changing to this a request message is sent)
   , {
      val: "40",
      text: "拒绝"
    } //refused
   , {
      val: "30",
      text: "已发布"
    } //published (when request is accepted)
   , {
      val: "60",
      text: "已暂停"
    } //closed
   , {
      val: "70",
      text: "已终止"
    } //stopped
  ];
  lbs.settings.messages.cn.responseStatus = [
    {
      val: "10",
      text: "已创建"
    } //created
   , {
      val: "20",
      text: "已提交"
    } //submitted
   , {
      val: "30",
      text: "已响应"
    } //paid
   , {
      val: "40",
      text: "享受服务中"
    } //consuming
   , {
      val: "45",
      text: "已完成"
    } //closed
  ];
  lbs.settings.messages.cn.publishingType = [
    {
      val: "10",
      text: "自主发布"
    }
   , {
      val: "20",
      text: "代理（委托）发布"
    }
  ];
  lbs.settings.messages.cn.splitting = [
    {
      val: "10",
      text: "服务完成"
    }
   , {
      val: "20",
      text: "响应完成"
    }
   , {
      val: "30",
      text: "事务完成"
    }

  ];
  lbs.settings.messages.cn.splittingPhase = [
    {
      val: "10",
      text: "每日清分"
    }
   , {
      val: "20",
      text: "每周清分"
    }
   , {
      val: "30",
      text: "每月清分"
    }
    ,{
          val: "40",
          text: "每季清分"
      }
      , {
          val: "50",
          text: "半年清分"
      }
      , {
          val: "60",
          text: "按年清分"
      }
      , {
          val: "70",
          text: "按双月清分"
      }
  ];
  lbs.settings.messages.cn.gender = [
    {
      val: "10",
      text: "不限定"
    }
   , {
      val: "20",
      text: "仅男性"
    }
    , {
      val: "30",
      text: "仅女性"
    }
  ];
  lbs.settings.messages.cn.userType = [
    {
      val: "10",
      text: "不限定"
    }
   , {
      val: "20",
      text: "个人用户"
    }
    ,{
      val: "30",
      text: "个人认证用户"
    }
    , {
      val: "40",
      text: "单位认证用户"
    }
    , {
      val: "50",
      text: "（其它-例如学生)"
    }
  ];
  lbs.settings.messages.cn.userStatus = [
        {
            val: "10",
            text: "审核中"
        }
        , {
            val: "20",
            text: "正常"
        }

        , {
            val: "30",
            text: "停止"
        }
    ];

}());

/**
 * BaseModule client module
 * All controllers inherit from this one, for example /workspace and /smm inherit
 *   from this and everything under those modules inherit from /workspace or /smm
 * written by Harm Meijer: harmmeiier@gmail.com
 */
lbs.routes['/basemodule'] = {
  mod: 'lbs.basemodule',
  location: '/commons/js/util.js'
};
lbs.routes['/global:modal'] = {
  mod: 'lbs.globalModal',
  location: '/commons/js/util.js'
};
lbs.routes['/comments'] = {
  mod: 'lbs.comments',
  location: '/commons/js/util.js'
};

lbs.routes['/global:select:postal'] = {
  mod: 'lbs.globalSelectPostal',
  location: '/commons/js/util.js'
};
lbs.routes['/global:photos:list'] = {mod:'lbs.globalPotosList',location: '/commons/js/util.js'};

lbs.basemodule = lbs.modules['/basemodule'] = {
  pageComplete: function (arg) {
    //@todo: certain pages need effects scripted after they are done, do that in this function
    table_effects();
    slideEffectsHandler(arg);
      clearErrorMessage();

console.log('page complete');


    jQuery('[data-toggle="popover"]').popover();
    jQuery('.dropdown.open .dropdown-toggle').dropdown('toggle');
    jQuery('.selectpicker').selectpicker({
      language: 'zh_CN'
    }); // the option language here is not necessary. the select picker language in the inde
  },
  render: function render(arg) {
    // unregister old ajaxStop handler that's used by other code
    //  old way was to overwrite it


    var modalREg = function(){

          $('#modalReg').click(function(){

                console.log('clicked---');
              $('.modalLoginBox').addClass('hide');
              $('#popUpResgitration').removeClass('hide');
          });
      }

      modalREg();


    jQuery(document).off('ajaxStop');
    return lbs.modHelper.returnResolved(arg);
  },
  deps: [],
  fillup: function fillup(list, pageSize,paddingBox) {
    var add = pageSize - (list.length % pageSize),
      i = -1,
      ret = [];

     var emptyObj = paddingBox?{paddingBox:true}:{};

    add = (add === pageSize) ? 0 : add;
    add = (list.length === 0) ? pageSize : add; //0%10 is 0 so no padding is added, need to add on empty lists as well
    add = list.length + add;
    while (++i < add) {
      ret.push(list[i] || emptyObj);
    }
    return ret;
  },
  endPoints: {
    userInfo: '/home/user.json',
    logout: '/home/logout.json',
    login: '/home/login.json',
    register:'/home/registration.json',
    "profile:admin": '/workspace/profiles/v1/corporate/corporate.json',
    "profile:personal": '/workspace/profiles/v1/personal.json',
    "profile:corporate": '/workspace/profiles/v1/corporate/corporate.json'
  },
  remove: function () {},
  create: function () {

          var ua = window.navigator.userAgent.toLowerCase();//todo: detect browser and see if it is weixin;
          if(ua.match(/MicroMessenger/i) == 'micromessenger'){
              lbs.browsers.weixin = true;
          }

    var me = this;
    delete this.debs;
    delete this.create;
  },
  settings: null,
  'photo:list': {
    render: function render(arg) {


      arg = arg || {};
      arg.queryData = arg.queryData || {p:0,ps:arg.pageSize || 2};
      var me = this;
      var httpType = arg.httpType || 'GET';
      this.otherHandlers = arg.handlers;
      this.forContainer = arg.container;
      this.currentView = arg.view || 'galleryView';
      this.templateHelpers = arg.helpers || this.templateHelpers;
      this.pageSize = arg.queryData.ps
      this.settings = arg.settings;

      var tmpArg = {};

      tmpArg.list = [];
      tmpArg.withSpinner = true;

        var route = $.param.fragment()
        var delim = '/';
        var routeUrl = route.split(delim).slice(0,3);
        var module = routeUrl.join(delim);
        console.log('routUrl',routeUrl,'module',module);
        var listModArrr = ['lbs',routeUrl[1],routeUrl[2],'list'];
        var listMod =  lbs.util.getMember(window, listModArrr);


        lbs.currentListModList  =  this;//listMod;
        lbs.currentListMod  = module;
        lbs.currentListRoute = route;

        var searchText = jQuery("#searchtext");
        var searchStart = jQuery("#startdate");
        var searchEnd = jQuery("#enddate");

      //  console.log("TRYING TO SET UP SEARCH, with elements","\nTEXT:",searchText,"\nStart:",searchStart,"\nEnd:",searchEnd);

        if(searchText && searchText.val()) arg.queryData.sk = searchText.val();
        if(searchStart && searchStart.val()) arg.queryData.sd = searchStart.val();
        if(searchEnd && searchEnd.val()) arg.queryData.ed = searchEnd.val();

      this.rerender(tmpArg);//todo first render empty view, then render again when the data is available

        return (arg.endPoint ? lbs.modHelper.getMessage(arg.endPoint, false, arg.params, httpType,arg.queryData) : jQuery.when({
            pl: me.list
        })) //either get the endpoint or use list
            .then(function (msg) {

                if(arg.endPoint) me.endPoint = arg.endPoint;
                //PROVISIONAL EDIT BY ED
                console.log('msg----',msg);
                if(arg.queryData)
                {

                    msg = receiveGetPageResponse(msg,arg.queryData.p,arg.queryData.ps);
                    me.list = msg.pl;
                    me.totalQueryResultCount = msg.mt.tc;
                }
                else
                {
                    msg = receiveGetPageResponse(msg,0,10);
                    me.list = msg.pl;
                    me.totalQueryResultCount = null;
                }

                me.meta = msg.mt;
                me.meta.p = parseInt(me.meta.p);
                me.meta.ps = parseInt(me.meta.ps);



                me.updateArrows();

                return me.rerender(arg);
            });
     },
      rerender: function rerender(arg) {


         console.log('------in rerender-----',arg);

          var me = this;
          arg = arg || {};
          var rowSize = arg.rowSize || 4;
          return lbs.modHelper.getView(this.views[this.currentView])
              .then(function (view) {
                  var rand = Math.random();



                  if(me.meta){

                      if(arg === 'singleview'){
                          me.meta.ps = 1;
                      }
                      else if(arg === 'galleryView'){


                          console.log('galery view------');

                          me.meta.ps = 20;  //todo the  galery list pages size is temporarily bring changed here as well;
                      }

                  }



                  lbs.modHelper.setContainer({
                      mod: me,
                      html: Mustache.render(view, {
                          photostage : rand,
                          list: lbs.basemodule.fillup(me.list.slice(me.index, me.index + me.pageSize), me.pageSize),
                          total: me.meta?me.meta.tc:0,
                          row: lbs.modHelper.isVal({
                              obj: {
                                  ret: 0
                              },
                              key: 'ret',
                              val: (function (pageSize, getIndex) {
                                  return function () {
                                      var index = getIndex(); //call getIndex only once per line
                                      if (index % rowSize === 0 //(4%4=0,8%4=0,...)
                                          && index !== pageSize) {
                                          return 0;
                                      }
                                  };
                              }(me.pageSize, lbs.modHelper.index({
                                  index: 1
                              }))),
                              yes: true,
                              no: false
                          }),
                          page: lbs.modHelper.isVal({
                              obj: {
                                  itemSize: true
                              },
                              key: 'itemSize',
                              val: (function (index, pageEnd) {
                                  return function () {
                                      if (index() > pageEnd) {
                                          return true;
                                      }
                                  };
                              }(lbs.modHelper.index({
                                  index: me.index
                              }), me.index + me.pageSize)),
                              yes: false,
                              no: true
                          }),
                          helpers: me.templateHelpers,
                          activities: me.activities,
                          settings: me.settings,
                          date:lbs.util.renderDate,
                          size:lbs.util.renderFileSizeInKB

                      }),
                      container: me.forContainer
                  });


                  if(arg&&arg.withSpinner){
                      $('#idphotoGaleryContain').addClass('spinnerContainer');
                  }

                  lbs.actionHandler({
                      container: me.forContainer,
                      handlers: me.handlers
                  });
                  if (me.otherHandlers) {
                      lbs.actionHandler({
                          container: me.forContainer,
                          handlers: me.otherHandlers
                      });
                  }



                  me.updateArrows();


                  arg.noNeed = arg.noNeed||false;

                  if(arg&&arg.withSpinning&&!arg.noNeed){

                      console.log('with spinning-----');
                      $('.spinnerPlaceHolder').addClass('spinnerContainerAbsolute');
                  }
                  else{


                      if(me.meta&&me.meta.tc > 0){
                          arg.queryData = me.meta;
                      //    console.log('calling pagination-----',arg.queryData);
                          //lbs.modules['/pagination'].create('.container_bottom','.form_right_search');
                          //lbs.modules['/pagination'].render(arg);
                      }
                  }
              });
      },
    movePage: function movePage(arg) {




        arg = arg || {};
        var me = this;
        arg.endPoint = me.endPoint;
        var e = arg.e;
        var searchText = jQuery("#searchtext");
        var searchStart = jQuery("#startdate");
        var searchEnd = jQuery("#enddate");
        console.log("TRYING TO SET UP SEARCH, with elements","\nTEXT:",searchText.val(),"\nStart:",searchStart,"\nEnd:",searchEnd);

        if(searchText && searchText.val()) this.meta.sk = searchText.val();
        else this.meta.sk = undefined;
        if(searchStart && searchStart.val()) this.meta.sd = searchStart.val();
        else this.meta.sd = undefined;
        if(searchEnd && searchEnd.val()) this.meta.ed = searchEnd.val();
        else this.meta.ed = undefined;

        console.log("FROM",this.meta);
        if(e.currentTarget)
        {
            var dirAttr = jQuery(e.currentTarget).attr('data-direction');
            if(dirAttr === 'right')
                this.meta.p++;
            else if(dirAttr === 'left')
                this.meta.p--;
            else this.meta.p = 0;
        }
        this.meta.p = Math.min(Math.max(0,this.meta.p),Math.ceil(this.meta.tc/this.meta.ps));
        console.log("TO",this.meta);


        if(arg.e.target.getAttribute('data-view') === 'single'){

            this.meta.ps = 1;

        }



        arg.queryData = this.meta;


        var httpType = arg.httpType || 'GET';

        console.log("MOVING PAGE",this.meta,arg);
        return (arg.endPoint ?
            lbs.modHelper.getMessage(arg.endPoint, false, arg.params, httpType,arg.queryData) :
            jQuery.when({pl: me.list}))
            .then(function(msg){
                //PROVISIONAL EDIT BY ED
                console.log('msg----',msg);
                if(arg.queryData)
                {
                    console.log('with arg------');
                    msg = receiveGetPageResponse(msg,arg.queryData.p,arg.queryData.ps);
                    me.list = msg.pl;
                    me.totalQueryResultCount = msg.mt.tc;
                }
                else
                {
                    msg = receiveGetPageResponse(msg,0,10);
                    me.list = msg.pl;
                    me.totalQueryResultCount = null;
                }

                me.meta = msg.mt;
                me.meta.p = parseInt(me.meta.p)
                me.meta.ps = parseInt(me.meta.ps)
                me.rerender(arg);
            });

    },
    updateArrows: function updateArrows(arg) {
      var $container = jQuery(this.forContainer);
      if (this.meta && this.meta.p === 0) {
        $container.find('.idPhotoGaleryArrowContainerLeft').addClass('disabled');
        $container.find('.idPhotoGaleryArrow.left').addClass('disabled');
      } else {
        $container.find('.idPhotoGaleryArrowContainerLeft').removeClass('disabled');
        $container.find('.idPhotoGaleryArrow.left').removeClass('disabled');
      }
      if (this.meta && (((this.meta.p * this.meta.ps)  >= (this.meta.tc - 1))||(this.meta.ps>this.meta.tc))) {

        $container.find('.idPhotoGaleryArrowContainerRight').addClass('disabled');
        $container.find('.idPhotoGaleryArrow.right').addClass('disabled');
      } else {

        $container.find('.idPhotoGaleryArrowContainerRight').removeClass('disabled');
        $container.find('.idPhotoGaleryArrow.right').removeClass('disabled');
      }
    },
    setSelectedMode: function setSelectedMode(arg) {
      arg = arg || {};
      var e = arg.e;
      var $this = jQuery(e.currentTarget);
      if ($this.prop('class').indexOf('Clicked') !== -1) {
        return; //do nothing, is already clicked
      }
      //remove clicked class from others, @todo: could be better
      $this.parents('.inspectionDisplyModes').find('div')
        .each(function () {
          var $this = jQuery(this),
            classes = $this.prop('class').split(' '),
            i = -1,
            len = classes.length;
          while (++i < len) {
            if (classes[i].indexOf('Clicked') !== -1) {
              $this.removeClass(classes[i]);
            }
          }
        });
      $this.addClass($this.prop('class') + 'Clicked'); //add clicked to this
    }
  },
  'general:list': {
    render: function (arg) {
      var me = this;
      arg = arg || {};

      var httpType = arg.httpType || 'GET';
      me.viewUrl = arg.listView || me.viewUrl;
      me.containerToSet = arg.container;

      var tmpArg = {};


        if(!arg.specialPagination){
            arg.queryData = arg.queryData || {p:0,ps:10,tc:10};
        }


        var searchText = jQuery("#searchtext");
        var searchStart = jQuery("#startdate");
        var searchEnd = jQuery("#enddate");

     //   console.log("TRYING TO SET UP SEARCH, with elements","\nTEXT:",searchText,"\nStart:",searchStart,"\nEnd:",searchEnd);

        if(searchText && searchText.val()) arg.queryData.sk = searchText.val();
        if(searchStart && searchStart.val()) arg.queryData.sd = searchStart.val();
        if(searchEnd && searchEnd.val()) arg.queryData.ed = searchEnd.val();

        //keep track of current module and  list module;
        var route = $.param.fragment();
        var delim = '/';
        var routeUrl = route.split(delim).slice(0,3);
        var module = routeUrl.join(delim);
        console.log('routUrl',routeUrl,'module',module);
        var listModArrr = ['lbs',routeUrl[1],routeUrl[2],'list'];


        var publishingRoute = /\/workspace\/publishing\/activities\//;

        var listMod = null;


        if(publishingRoute.test(route)){

            listMod = lbs['workspace:nomenu'].publishing['activities:select:service'].serviceList;

        }
       else{
            listMod =  lbs.util.getMember(window, listModArrr);
        }



        lbs.currentListModList  =  listMod;
        lbs.currentListMod  = module;
        lbs.currentListRoute = route;
        var listquery = {};


        if(lbs.modules[ lbs.currentListMod]&&lbs.modules[ lbs.currentListMod].routeParams&&lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute]&&lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute].query){
            listquery = lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute].query;
        }


        lbs.util.merge(listquery,arg.queryData)//merge list mod query with  pagination query;

        console.log('listMod ---------',lbs.currentListModList);
        console.log('mergedquery---------',arg.queryData);


        tmpArg.withSpinning = true;
        this.rerender(tmpArg);
        //CAN I GET PARAMS FOR THE GET HERE?


      return (arg.listEndPoint ? lbs.modHelper.getMessage(arg.listEndPoint, false, arg.params, httpType,arg.queryData) : jQuery.when({
          pl: me.list
        })) //either get the endpoint or use list
        .then(function (msg) {

              //PROVISIONAL EDIT BY ED
              console.log('msg----',msg);



                  if(arg.queryData)
                  {

                      msg = receiveGetPageResponse(msg,arg.queryData.p,arg.queryData.ps);
                      me.list = msg.pl;
                      me.totalQueryResultCount = msg.mt.tc;
                  }
                  else if(!arg.specialPagination)
                  {

                      msg = receiveGetPageResponse(msg,0,10);
                      me.list = msg.pl;
                      me.totalQueryResultCount = null;
                  }


                if(msg.mt)
                {
                    me.meta = msg.mt;
                    me.meta.p = parseInt(me.meta.p);
                    me.meta.ps = parseInt(me.meta.ps);
                }




              return me.rerender(arg);
        });
    },
    rerender: function rerender(arg) {
      var me = this;


      arg = arg || {};

      me.viewUrl = arg.listView || me.viewUrl;
      return lbs.modHelper.getView(me.viewUrl)
        .then(function (view) {
          var data;
          var itemsHolder = [];

              if(arg.withPadding === false){
                  itemsHolder = me.list;
              }
              else if(arg.specialPadding){

                  itemsHolder = lbs.basemodule.fillup(me.list.slice(me.index, me.index + me.pageSize), me.pageSize,true);

              }
              else {

                  itemsHolder = lbs.basemodule.fillup(me.list.slice(me.index, me.index + me.pageSize), me.pageSize);

              }


          data = {
              items:itemsHolder ,
              date:lbs.util.renderDate,
              totalItems:me.totalQueryResultCount,
              dateTime:lbs.util.renderDateTime,
              renderActivityTypes:lbs.util.renderActivityTypes,
              renderServiceStatus:lbs.util.renderServiceStatus
          };


          if (arg && arg.extraData) {

              data.extraData = arg.extraData;
          }

          lbs.util.merge(arg, data);
          lbs.modHelper.setContainer({
            mod: me,
            html: Mustache.render(view, data),
            container: me.containerToSet
          });

          arg.noNeed = arg.noNeed||false;

          if(arg&&arg.withSpinning&&!arg.noNeed){

              console.log('with spinning-----');
              $('.spinnerPlaceHolder').addClass('spinnerContainerAbsolute');
          }
          else{
              console.log('without spinning-----',me);


              if(me.meta&&me.meta.tc > 0){
                  arg.queryData = me.meta;
                  console.log('calling pagination-----',arg.queryData);
                  if(arg.listView == "/processes/activities/activitieslist.html")
                      lbs.modules['/pagination'].create('.processes_activitieslist','.activities_container_bottom');
                  else if(arg.listView =="/workspace/publishing/servicelist.html")
                  {
                      lbs.modules['/pagination'].create('.serviceSelectionTable1');
                  }
                  else
                    lbs.modules['/pagination'].create();
                  lbs.modules['/pagination'].render(arg);
              }
            }
        });
    },
    parentRender: function (arg) {// renders the main and the the list modules subsequently;
      arg = arg || {};
      var d = arg.defer || jQuery.Deferred();
      var me = this;
      var route = jQuery.param.fragment();
      var parentRender = (this.parent && typeof this.parent.render === 'function') ? this.parent.render(arg) : jQuery.when();
      var parentContainer = me.container || arg.data.parentContainer;
      parentRender.then(function () {
          //load child (list module) and view for this module 
          return jQuery.when(
            (arg.listMod) ? lbs.modHelper.getMod(arg.listMod) : null, lbs.modHelper.getView(arg.mainView)
          );
        })
        .then(function (listMod, view) {
          var data = (me.routeParams && me.routeParams[route]) ? me.routeParams[route] : {};
          //add passed extras to data
          lbs.util.merge(arg.data, data);
          lbs.modHelper.setContainer({
            mod: me,
            html: Mustache.render(
              view, data),
            container: parentContainer
          });
          //render the list
          return (listMod) ? listMod.render(data) : null;
        }).then(function (res) {
          lbs.actionHandler({
            container: parentContainer,
            handlers: me.handlers
          });
          d.resolve();
        });
      return d.promise();
    },





    deleteEntity: function deleteEntity(arg) {
      var entity, index = lbs.util.find({
        arr: arg.listMod.list,
        key: '_id',
        val: arg._id
      });
      var container = '#platformAPIsModal';
      entity = arg.listMod.list[index];
      return lbs.modHelper.getView('/workspace/confirm.html')
        .then(function (view) {
          lbs.modHelper.setContainer({
            container: container,
            mod: {},
            html: Mustache.render(view, {
              entityName: arg.type,
              code: arg.code ? lbs.util.getMember(entity, arg.code.split('.')) : '',
              name: arg.name ? lbs.util.getMember(entity, arg.name.split('.')) : ''
            })
          });
          lbs.actionHandler({
            handlers: {
              'entity:delete:confirmed': function (e) {
                var pl = {
                  pl: {}
                };
                pl.pl[arg.entityName] = {
                  _id: arg._id,
                  ds: true
                };
                lbs.modHelper.getMessage(
                    arg.updateEndpoint, false, {}, 'PUT', {
                      json: JSON.stringify(pl)
                    })
                  .then(function () {
                    arg.listMod.removeItem(arg._id);
                    jQuery(container).modal('hide');
                  });
              }
            },
            container: container
          });
          jQuery(container).modal();
        });
    }
  },

  'general:modal:list': {
        render: function (arg) {
            var me = this;
            arg = arg || {};

            var httpType = arg.httpType || 'GET';
            me.viewUrl = arg.listView || me.viewUrl;
            me.containerToSet = arg.container;

            var tmpArg = {};

            //arg.queryData = arg.queryData || {p:0,ps:10,tc:10};

            //var searchText = jQuery("#searchtext");
            //var searchStart = jQuery("#startdate");
            //var searchEnd = jQuery("#enddate");
            //
            ////   console.log("TRYING TO SET UP SEARCH, with elements","\nTEXT:",searchText,"\nStart:",searchStart,"\nEnd:",searchEnd);
            //
            //if(searchText && searchText.val()) arg.queryData.sk = searchText.val();
            //if(searchStart && searchStart.val()) arg.queryData.sd = searchStart.val();
            //if(searchEnd && searchEnd.val()) arg.queryData.ed = searchEnd.val();
            //
            ////keep track of current module and  list module;
            //var route = $.param.fragment()
            //var delim = '/';
            //var routeUrl = route.split(delim).slice(0,3);
            //var module = routeUrl.join(delim);
            //console.log('routUrl',routeUrl,'module',module);
            //var listModArrr = ['lbs',routeUrl[1],routeUrl[2],'list'];
            //var listMod =  lbs.util.getMember(window, listModArrr);
            //
            //
            //
            //lbs.currentListModList  =  listMod;
            //lbs.currentListMod  = module;
            //lbs.currentListRoute = route;
            //var listquery = {}
            //
            //
            //if(lbs.modules[ lbs.currentListMod]&&lbs.modules[ lbs.currentListMod].routeParams&&lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute]&&lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute].query){
            //    listquery = lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute].query;
            //}


           // lbs.util.merge(listquery,arg.queryData)//merge list mod query with  pagination query;

            //console.log('listMod ---------',lbs.currentListModList);
            //console.log('mergedquery---------',arg.queryData);




            return (arg.listEndPoint ? lbs.modHelper.getMessage(arg.listEndPoint, false, arg.params, httpType,arg.queryData) : jQuery.when({
                pl: me.modalList
            })) //either get the endpoint or use list
                .then(function (msg) {

                    //PROVISIONAL EDIT BY ED
                    console.log('modal msg----',msg);


                        if(arg.queryData)
                        {
                           // msg = receiveGetPageResponse(msg,arg.queryData.p,arg.queryData.ps);
                            me.modalList = msg.pl;
                            me.modalListTotalQueryResultCount = msg.mt.tc;
                        }
                        else
                        {
                           // msg = receiveGetPageResponse(msg,0,10);
                            me.modalList = msg.pl;
                            me.modalListTotalQueryResultCount = null;
                        }

                        me.modalListMeta = msg.mt;
                        me.modalListMeta.p = parseInt(me.modalListMeta.p)
                        me.modalListMeta.ps = parseInt(me.modalListMeta.ps)

                    return me.rerender(arg);
                });
        },
        rerender: function rerender(arg) {
            var me = this;
            arg = arg || {};

            me.viewUrl = arg.listView || me.viewUrl;
            return lbs.modHelper.getView(me.viewUrl)
                .then(function (view) {
                    var data;

                    data = {
                        items: me.modalList ,
                        date:lbs.util.renderDate,
                        totalItems:me.modalListTotalQueryResultCount,
                        dateTime:lbs.util.renderDateTime,
                        renderActivityTypes:lbs.util.renderActivityTypes,
                        renderServiceStatus:lbs.util.renderServiceStatus
                    };


                    if (arg && arg.extraData) {

                        data.extraData = arg.extraData;
                    }


                    lbs.util.merge(arg, data);
                    lbs.modHelper.setContainer({
                        mod: me,
                        html: Mustache.render(view, data),
                        container: me.containerToSet
                    });

             });
        }

    },




  confirmAction: function confirmAction(arg) {

    var container = arg.container;
  return  lbs.modHelper.getView('/commons/views/confirmAction.html')
        .then(function (view) {
            lbs.modHelper.setContainer({
                container: container,
                html: Mustache.render(view, {data:arg})
            });

            jQuery(container).modal();
        })
 },

  handlers: {}

};
lbs.modules['/global:modal'] = {
  deps: [],
  createdBy: false,
  myContainer: '',
  persist: false,
  create: function create() {
    lbs.globalModal = this;
    delete this.deps;
    delete this.create;
  },
  hide: function hide() {
    jQuery(this.myContainer).off('hide.bs.modal.globalmod');
    jQuery(this.myContainer).modal('hide');
  },
  render: function render(arg) {


      console.log('modal render----');
    arg = arg || {};
    var d = arg.defer || jQuery.Deferred();
    var me = this;
    me.myContainer = arg.container;
    me.persist = arg.persist || false;
    this.createdBy = arg.createdBy;
    lbs.modHelper.getView('/commons/views/modal.html')
      .then(function (view) {
        //@todo: look what happends on remove and setcontainer again will call remove or not
        lbs.modHelper.setContainer({
          mod: me,
          html: Mustache.render(view, view),
          container: arg.container
        });
        jQuery(arg.container).modal();
        if (me.persist) {
          jQuery(me.myContainer).on('hide.bs.modal.globalmod', function (e) {
            e.preventDefault();
          });
        }
        return arg.view ? lbs.modHelper.getView(arg.view) : false;
      })
      .then(function (view) {
        if (view) {
          lbs.modHelper.setContainer({
            mod: me,
            html: Mustache.render(view, arg.templateData),
            container: arg.container
          });
        }
        //lbs.actionHandler({container:me.container,handlers:me.handlers});//@todo: pass action handlers
        d.resolve();
      });
    return d.promise();
  },
  remove: function remove() {
    if (this.createdBy && (typeof this.createdBy === 'function')) {
      this.createdBy.remove();
    }
  }
};
lbs.modules['/global:select:postal'] = (function () {
  var Postal = function () {
    var me = this;
    this.binders = [];
    this.values = [];
    this.renderIn = '';
    this.regions = '';
    this.view = '';
    this.changeListener = false;
    this.handlers = {};
    this.handlers["postal:online"] = function online(e) {
      jQuery(me.renderIn).find('.postal-pysical').addClass('hide');
    };
    this.handlers["postal:physical"] = function physical(e) {
      jQuery(me.renderIn).find('.postal-pysical').removeClass('hide');
    };
  };
  Postal.prototype.resetValues = function resetValues() {
    this.values = [];
  };
  Postal.prototype.deps = [];
  Postal.prototype.create = function create() {
    lbs.globalSelectPostal = Postal;
    delete Postal.deps;
    delete Postal.create;
  };
  Postal.prototype.setValueFromValue = function setValueFromValue(val) {
    var index, tmpVal = Object.prototype.toString.call(val).indexOf('Array') === -1 ? [val.toString()] : val,
      $province = jQuery(this.renderIn).find(this.cssSelectDropdowns[2]),
      $city, $region,$radio;
    if (!val || !tmpVal[0]) {
      return;
    }


      if (val === 'online') {

          $radio = jQuery(this.renderIn).find("[data-action-change|='postal:online']");
          $radio.prop('checked', true);
          $radio.trigger('change');
          return;
      }

    $province.val(val);
    if (!$province.val()) {
      $province.val(tmpVal[0].substr(0, 2) + '0000');
    }
    if (!$province.val()) {
      return;
    }
    $province.trigger('change');
    $city = jQuery(this.renderIn).find(this.cssSelectDropdowns[1]);
    $city.val(val);
    if (!$city.val()) {
      $city.val(tmpVal[0].substr(0, 4) + '00');
      if (!$city.val()) {
        $city.val(tmpVal[0].substr(0, 2) + '0000');
      }
    }
    if (!$city.val()) {
      return;
    }
    $city.trigger('change');
    $region = jQuery(this.renderIn).find(this.cssSelectDropdowns[0]);
    $region.val(val);
    if (!$region.val()) {
      return;
    }
    $region.trigger('change');
  };
  Postal.prototype.setValue = function setValue(val) {
    var $radio;
    var $province = jQuery(this.renderIn).find(this.cssSelectDropdowns[2]),
      $city, $region;
    if (val) {
      return this.setValueFromValue(val);
    }
    if (this.values[0]) {
      $province.val(this.values[0]);
      $province.trigger('change');
    }
    if (this.values[1]) {
      $city = jQuery(this.renderIn).find(this.cssSelectDropdowns[1]);
      $city.val(this.values[1]);
      $city.trigger('change');
    }
    if (this.values[2]) {
      $region = jQuery(this.renderIn).find(this.cssSelectDropdowns[0]);
      $region.val(this.values[2]);
      $region.trigger('change');
      jQuery(this.renderIn).find('.selectpicker').selectpicker('refresh');
    }
    //if (val === 'online') {// THIS NOT BEING EXECUTED?
    //
    //  $radio = jQuery(this.renderIn).find("[data-action-change|='postal:online']");
    //  $radio.prop('checked', true);
    //  $radio.trigger('change');
    //}
  };
  Postal.prototype.cssSelectDropdowns = ['select.regions', 'select.cities', 'select.provinces'];
  Postal.prototype.resetDropdownValues = function resetDropdownValues(index) {
    var enable = 3;
    while (--enable >= index) {
      jQuery(this.renderIn).find(this.cssSelectDropdowns[index]).prop('disabled', false);
    }
    while (--index > -1) {
      jQuery(this.renderIn).find(this.cssSelectDropdowns[index]).html('');
      jQuery(this.renderIn).find(this.cssSelectDropdowns[index]).prop('disabled', true);
    }
  };
  Postal.prototype.setProvince = function setProvince() {
    var i = -1,
      len = this.regions.length,
      $provinces = jQuery(this.renderIn).find('select.provinces'),
      options = ["<option></option>"],
      me = this;
    if ($provinces.prop('multiple')) {
      options = [];
    }
    while (++i < len) {
      options.push("<option value='");
      options.push(this.regions[i]['省及直辖市代码']);
      options.push("'>");
      options.push(this.regions[i]['省及直辖市']);
      options.push("</option>");
    }
    $provinces.html(options.join(''));
    this.resetDropdownValues(2);
    $provinces.off('change.postalwatch');
    $provinces.on('change.postalwatch', function (e) {
      me.values[0] = jQuery(e.target).val();
      me.setCity(e);
    });
  };
  Postal.prototype.setCity = function setCity(e) {
    var val = jQuery(e.target).val();
    if (val && val.length > 1 && Object.prototype.toString.call(val).indexOf('Array') !== -1) {
      this.resetDropdownValues(2);
      jQuery(this.renderIn).find('.selectpicker').selectpicker('refresh');
      return;
    }
    var index = lbs.util.find({
      key: '省及直辖市代码',
      val: e.target.value,
      arr: this.regions
    });
    var arr = [];
    if (this.regions[index]) {
      arr = this.regions[index]['市'];
    }
    var i = -1,
      len = arr.length,
      $cities = jQuery(this.renderIn).find('select.cities'),
      options = ["<option></option>"],
      me = this;
    if ($cities.prop('multiple')) {
      options = [];
    }
    while (++i < len) {
      options.push("<option value='");
      options.push(arr[i]['市代码']);
      options.push("'>");
      options.push(arr[i]['省辖市']);
      options.push("</option>");
    }
    $cities.html(options.join(''));
    this.resetDropdownValues(1);
    $cities.off('change.postalwatch');
    $cities.on('change.postalwatch', function (e) {
      me.values[1] = jQuery(e.target).val();
      me.setRegion(e, arr);
    });
    jQuery(this.renderIn).find('.selectpicker').selectpicker('refresh');
  };
  Postal.prototype.setRegion = function setRegion(e, cities) {
    var val = jQuery(e.target).val();
    if (val && val.length > 1 && Object.prototype.toString.call(val).indexOf('Array') !== -1) {
      this.resetDropdownValues(1);
      jQuery(this.renderIn).find('.selectpicker').selectpicker('refresh');
      return;
    }
    var index = lbs.util.find({
      key: '市代码',
      val: e.target.value,
      arr: cities
    });
    var arr = [];
    if (cities[index]) {
      arr = cities[index]['区县'];
    }
    var i = -1,
      len = arr.length,
      $regions = jQuery(this.renderIn).find('select.regions'),
      options = ["<option></option>"],
      me = this;
    if ($regions.prop('multiple')) {
      options = [];
    }
    while (++i < len) {
      options.push("<option value='");
      options.push(arr[i]['区县代码']);
      options.push("'>");
      options.push(arr[i]['市辖区县']);
      options.push("</option>");
    }
    this.resetDropdownValues(0);
    $regions.html(options.join(''));
    $regions.off('change.postalwatch');
    $regions.on('change.postalwatch', function (e) {
      me.values[2] = jQuery(e.target).val();
    });
    jQuery(this.renderIn).find('.selectpicker').selectpicker('refresh');
  };
  Postal.prototype.render = function render(arg) {
    var me = this;
    me.changeListener = arg.changeListener || false;
    this.renderIn = arg.container;
    return jQuery.when(
        lbs.modHelper.getView(arg.view), lbs.modHelper.getMessage('/commons/js/china_regions.js', true)
      )
      .then(function (view, regions) {
        me.view = view;
        me.regions = JSON.parse(regions);
        return me;
      })
      .then(function () {
        lbs.modHelper.setContainer({
          mod: me,
          html: Mustache.render(me.view, {
            boundKey: arg.key
          }),
          container: me.renderIn
        });
        //      jQuery('.selectpicker').selectpicker();
        me.setProvince();
        lbs.actionHandler({
          handlers: me.handlers,
          container: me.renderIn
        });
        me.setValue(arg.boundTo[arg.key]);
        me.binders = lbs.binder.bind(me.renderIn, arg.boundTo, 'postal-code-entity', [function (obj, key, root, path) {
          var val;
          if (me.changeListener && typeof me.changeListener === 'function') {
            me.changeListener(obj, key, root, path);
          }
          if (obj[key] === undefined || obj[key] === null) {
            return;
          }
          if (obj[key] === 'online') {
            return;
          }
          val = (obj[key].join) ? obj[key].join() : obj[key];
          jQuery(me.renderIn).find('.postalcode-pysical-radio').val(val);
          if (val.indexOf(',') !== -1) {
            obj[key] = val.split(',');
          }
        }]);
        lbs.binder.cancelUpdateObject(me.binders);
      });
  };
  Postal.prototype.remove = function remove() {
    lbs.binder.unbind(this.binders);
  };
  return Postal;
}());
lbs.modules['/global:photos:list'] = {
  deps : []
  ,views:{
    galleryView:'/workspace/profile/chooseProfilePicture.html'
    ,listView:'/workspace/photos/listView.html'
  }
  ,endpoints:{
    'idphoto' :'/workspace/profiles/v1/idphotos.json'
//    ,'others' :'/workspace/profiles/v1/otherphotos.json'
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
    this.handlers['profile:save:selected:photo:basic']=function(e){
//      me.saveSelectedPhoto(e,lbs['processes:activities'].application.updateJson);
    };
    lbs.globalPotosList = this;
    delete this.deps;
    delete this.create;
  }
  ,render : function render(arg){
    arg = arg || {};
//    this.remove();
    var container = jQuery('<div aria-hidden="true" role="dialog" tabindex="-1" class="modal stripped_modal" style="display: none;"></div>');
    jQuery(body).append(container);
    this.modalContainer=container;
    arg.container = container;
    arg.endPoint=arg.endPoint || this.endpoints[this.currentEndpoint]||this.endpoints.idphoto;
    lbs.basemodule['photo:list'].render.call(this,arg);
  }
  ,rerender:function rerender(){
    //@todo: maybe Rolland can check when this is used and tries to open as modal
    //  when a modal is already open (like: http://localhost/#/workspace/responses/all)
    //  hide existing modal and open this one
    var me = this;
    this.templateHelpers.isSelected=lbs.modHelper.isChecked([me.selectedPhoto],'_id');
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
      me.boundValues = lbs.binder.bind(me.modalContainer,me,'profile');
      me.forContainer.modal('show').on('hidden.bs.modal',function(){
        me.remove();
      })
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
  ,updateArrows:function updateArrows(){
    lbs.basemodule['photo:list'].updateArrows.call(this);
  }
  ,handlers:{}
  ,remove : function remove(){
    //bootstrap closing because of data-dismiss
    // would rather handle closing forms myself so the cleanup runs when it needs to
    // can't change because it may break other code so best delay cleaning up
    var me = this;
    lbs.binder.unbind(me.boundValues);
    this.forContainer && this.forContainer.remove();               
  }
};

lbs.comments = lbs.modules['/comments'] = {
  commentsEndpoint: '/workspace/notifications/comments/',
  maintemplate: '/details/comments/comments.html',
  newtemplate: '/details/comments/new.html',
  container: '#commentSectionContainer',
  newComment: '#newCommentText',
  replyComment: '.replyCommentText',
  tID: null,
  commentSubject: {},
  cguid: null,
  ln: null,
  message: {},
  commentsContainer: '#commentContainerBoxBoby',
  newCommentUri: '/workspace/notifications/comments/comment.json',
  userEnpoint: 'workspace/profiles/v1/personal.json',
  user: null,
  comments: null,
  create: function () {

    var me = this;

    this.handlers['comments:reply:to:specific:user'] = function (e) {
      me.cguid = e.target.getAttribute('data-id');
      me.ln = e.target.getAttribute('data-user');
      me.handleReplyToComment(e);

    };


    this.handlers['comments:new:submit'] = function (e) {
      me.handleNewComment(e);
    };

    this.handlers['comments:reply:to:specific:user:submit'] = function (e) {

      me.handleSubmitReplyToComment(e);
    };


      this.handlers['comments:reply:to:specific:user:cancel'] = function (e) {

           $(e.target).closest('.commentReplyBox').remove();

      };

    this.handlers['comment:like'] = function (e) {

      me.cguid = e.target.getAttribute('data-id');
      me.markAsLiked(e);
    };

    this.handlers['comment:inmail:send'] = function (e) {

      var user = e.target.getAttribute('data-user');
      var subject = e.target.getAttribute('data-subject');
      me.sendInmailFromComment({
        e: e,
        user: user,
        subject: subject
      });
    };
    this.handlers['send:inmail:message'] = function (e) {
      me.notificationSentSuccessful(e);
    };

    this.handlers['comments:detele'] = function (e) {
      var id = e.target.getAttribute('data-id');

      var domEl = jQuery(e.target).closest('.media-list');
      me.deleteComment({
        e: e,
        _id: id,
        entityName: 'comment',
        domEl: domEl
      });
    };

    lbs.comments = this;
    delete this.deps;
    delete this.create;
  },
  deps: [],
  render: function render(arg) {

    var me = this;


    me.commentSubject = arg.acid;
    me.tID = arg.acid.abd.ac;
    return jQuery.when(
      lbs.modHelper.getView(me.maintemplate),
      lbs.modHelper.getMessage(me.commentsEndpoint + me.tID + '.json', false, false, 'GET'), (lbs.user) ? lbs.modHelper.getMessage(me.userEnpoint, false, false, 'GET') : {
        pl: null
      }
    ).then(function (view, comment, user) {
      me.user = user.pl;
      me.comments = comment.pl;
      lbs.modHelper.setContainer({
        mod: me,
        html: Mustache.render(view, {
          data: me.comments,
          info: me.commentSubject,
          date: lbs.util.renderDateTime
        }),
        container: me.container
      });

      lbs.actionHandler({
        container: me.container,
        handlers: me.handlers
      });

      lbs.basemodule.pageComplete();
    });
  },
  handleNewComment: function handleNewComment(e) {
    var me = this;
    var comment = {};
    comment.cc = jQuery(me.newComment).val();



    if (comment.cc) {


      comment.tguid = me.tID;
      comment.av = me.user.basic.avatar.value;
      comment.ln = lbs.user.loginName;
      lbs.modHelper.getMessage(me.newCommentUri, false, false, 'POST', comment)
        .then(function (response) {

          if (response.pl) {
            var latest = response.pl;
            me.comments.push(latest);

            lbs.modHelper.getView(me.newtemplate)
              .then(function (view) {
                var $html = jQuery(Mustache.render(view, {
                  data: latest,
                  info: me.commentSubject,
                  date: lbs.util.renderDateTime
                }));

                jQuery(me.commentsContainer).prepend($html);

                lbs.actionHandler({
                  container: $html,
                  handlers: me.handlers
                });
              });

            jQuery(me.newComment).val('');

          } else {
            alert('操作失败！请重试');
          }
        });

    }


  },
  handleReplyToComment: function handleReplyToComment(e) {
    var me = this;

     var targetMedia = $(e.target).closest('.media-body');

      console.log('target media', targetMedia);

      lbs.modHelper.getView('details/comments/reply.html').then(function(view){




          console.log('got view');
          targetMedia.append(view);



          lbs.actionHandler({
              container: targetMedia.find('.commentReplyBox'),
              handlers: me.handlers
          });

          console.log('changing place holder');
          targetMedia.find(me.replyComment).prop('placeholder', '回复' + '@' + me.ln + '........');
      });

  },
  handleSubmitReplyToComment: function handleSubmitReplyToComment(e) {



    var me = this;


    var targetReplyBox = $(e.target).closest('.commentReplyBox');

    var comment = {};
    comment.cc = '@' + me.ln + ' ' + targetReplyBox.find(me.replyComment).val();

    if (comment.cc) {

      comment.tguid = me.tID;
      comment.av = me.user.basic.avatar.value;
      comment.ln = lbs.user.loginName;
      comment.pc = {
        pc: true,
        cguid: me.cguid,
        ln: me.ln
      };


      me.cguid = null;
      me.ln = null;
      lbs.modHelper.getMessage(me.newCommentUri, false, false, 'POST', comment)
        .then(function (response) {

          if (response.pl) {
            var latest = response.pl;
            me.comments.push(latest);

            lbs.modHelper.getView(me.newtemplate)
              .then(function (view) {
                var $html = jQuery(Mustache.render(view, {
                  data: latest,
                  date: lbs.util.renderDateTime
                }));

                jQuery(me.commentsContainer).prepend($html);

                lbs.actionHandler({
                  container: $html,
                  handlers: me.handlers
                });
              });


              targetReplyBox.remove();

          } else {
            alert('操作失败！请重试');

          }
        });

    }


  },
  markAsLiked: function markAsLiked(e) {

    var me = this;
    var el = jQuery(e.target);



    var index = lbs.util.find({
      arr: me.comments,
      key: '_id',
      val: me.cguid
    });

    me.comments[index].vc = me.comments[index].vc + 1;

    var comment = me.comments[index];
    if (comment) {

      lbs.modHelper.getMessage(me.commentsEndpoint + 'comments/' + me.cguid + '.json', false, false, 'PUT', comment)
        .then(function (response) {

          var latest = response.pl;

          if (latest) {
            el.addClass('specialBlue');
            el.next('.numberOfLikes').text(comment.vc);

          } else {

            me.comments[index].vc = me.comments[index].vc - 1;
            alert('操作失败！请重试');
          }


        });

    }


  },
  deleteComment: function deleteComment(arg) {
    var me = this;


    var entity, index = lbs.util.find({
      arr: me.comments,
      key: '_id',
      val: arg._id
    });
    var container = '#platformAPIsModal';
    entity = me.comments[index];
    return lbs.modHelper.getView('/workspace/confirm.html')
      .then(function (view) {
        lbs.modHelper.setContainer({
          container: container,
          mod: {},
          html: Mustache.render(view, {
            entityName: '评论'
          })
        });
        lbs.actionHandler({
          handlers: {
            'entity:delete:confirmed': function (e) {
              var pl = {
                pl: {}
              };
              pl.pl[arg.entityName] = {
                _id: arg._id,
                ln: entity.ln,
                ds: true
              };
              lbs.modHelper.getMessage(
                  me.commentsEndpoint + arg._id + '.json', false, {}, 'DELETE', {
                    json: JSON.stringify(pl)
                  }
                )
                .then(function () {
                  arg.domEl.remove();
                  me.comments.splice(index, 1);
                  jQuery(container).modal('hide');
                });
            }
          },
          container: container
        });
        jQuery(container).modal();
      });
  },
  sendInmailFromComment: function sendInmailFromComment(arg) {

    var me = this;

    lbs.modHelper.getView('/workspace/notifications/sendInmail.html').then(function (view) {

      lbs.modHelper.setContainer({
        container: '#platformAPIsModal',
        html: Mustache.render(view)
      });
      lbs.actionHandler({
        container: '#platformAPIsModal',
        handlers: me.handlers
      });

      jQuery('#notificationReceivers').val(arg.user);
      jQuery('#notificationSubject').val(arg.subject);
      jQuery('#notificationReceivers').prop('readonly', true);
      jQuery('#notificationSubject').prop('readonly', true);


      jQuery('#platformAPIsModal').modal().off('hide.bs.modal.sendInmail');
      jQuery('#platformAPIsModal').modal().on('hide.bs.modal.sendInmail', function () {
        lbs.modHelper.setContainer({
          container: '#plaformAPIsModal',
          html: ''
        });
      });

    });

  },
  notificationSentSuccessful: function notificationSentSuccessful(e) {
    var value;
    var me = this;

    me.message.notification = {};
    me.message.recipients = jQuery('#notificationMessageForm #notificationReceivers').val().replace(/\s+/g, '').split(';');

    me.message.notification.subject = jQuery('#notificationMessageForm #notificationSubject').val();
    me.message.notification.body = jQuery('#notificationMessageForm #notificationBody').val();
    me.message.notification.notificationType = '业务通知';
    for (value in me.message.recipients) {
      me.message.recipients[value] = {
        'to': me.message.recipients[value]
      };
    }
    lbs.modHelper.getView('/workspace/notifications/spinningStransitionPage.html')
      .then(function (view) {

        lbs.modHelper.setContainer({
          container: '#platformAPIsModal',
          html: view
        });


      });


    lbs.modHelper.getMessage('/workspace/notifications/mailling/notifications.json', null, {
        modalToHide: '#platformAPIsModal'
      }, 'POST', me.message)
      .then(function (msg) {



        lbs.modHelper.getView('/workspace/notifications/operationSuccessfull.html')
          .then(function (view) {

            lbs.modHelper.setContainer({
              container: '#platformAPIsModal',
              html: view
            });

            countDown(function () {
              jQuery('#platformAPIsModal').modal('hide');

              lbs.modHelper.setContainer({
                container: '#plaformAPIsModal',
                html: ''
              });
            });
          });
      });
  },
  handlers: {}

};

lbs.pagination = lbs.modules['/pagination'] = {

    view:'/commons/views/pagination.html',
    container:'.paginationContainer',

    create: function (target,search) {
        console.log("CREATING PAGINATIoN");
        var me = this;

        if(target === undefined) target = '.container_bottom';
        if(search === undefined) search = '.container_top';

        this.handlers['pagination:change:page']=function(e){


            var page = e.target.getAttribute('data-page');



            var route = $.param.fragment();

            var publishingRoute = /\/workspace\/publishing\/activities\//;

            if(publishingRoute.test(route)){

                lbs.currentListModList.meta.p = page;

                lbs['workspace:nomenu'].publishing['activities:select:service'].seachServices();

            }
            else{
                var endpoints = lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute]?lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute].listEndPoint:lbs.modules[ lbs.currentListMod].routeParams.listEndPoint;

                console.log('endpoints----',endpoints);

                console.log('page---',page);
                lbs.currentListModList.render({pagination:true,page:page,listEndPoint:endpoints,container:target,queryData:{p:page, ps: lbs.currentListModList.pageSize}});


            }

        };
        this.searchHandlers['pagination:search']=function(e){
            e.preventDefault();
            var page = 0
            var endpoints = lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute]?lbs.modules[ lbs.currentListMod].routeParams[lbs.currentListRoute].listEndPoint:lbs.modules[ lbs.currentListMod].routeParams.listEndPoint;
            lbs.currentListModList.render({pagination:true,page:page,listEndPoint:endpoints,container:target,queryData:{p:page, ps: lbs.currentListModList.pageSize}});
        }

        lbs.pagination = this;
        /*todo fix
        var sd = new Date();
        sd.setDate(sd.getDate()-30);
        jQuery("#startdate").val(sd.toISOString().slice(0, 10));
        jQuery("#enddate").val(new Date().toISOString().slice(0, 10));
        */
        lbs.actionHandler({container:search,handlers:me.searchHandlers,doOverride:true})
    },
    render: function render(arg) {

        var me  = this;

        var meta = arg.queryData?arg.queryData:{p:0,ps:10,tc:null};


        console.log('pagination render meta---',meta);


        var pages = calculatePaginationElements(meta.tc,meta.p,meta.ps).map(function(ele){return ele;})
        var isCurrent = calculatePaginationElements(meta.tc,meta.p,meta.ps).filter(function(ele){return ele.current});
        if(isCurrent.length == 0)
        {
            var next = 0;
            var prev = 0;
            var currentPageNumber = 0;
        }
        else
        {
            var next = isCurrent[0].p+1;
            var prev = isCurrent[0].p-1;
            var currentPageNumber = isCurrent[0].label*lbs.currentListModList.pageSize;
        }
        var totalPageNumber =  totalPageNumber  === NaN || !currentPageNumber ? null : lbs.currentListModList.totalQueryResultCount;
        var showNext = next < (meta.tc/meta.ps);
        var showPrev = prev >= 0;

           lbs.modHelper.getView(me.view)
                .then(function (view) {
                    lbs.modHelper.setContainer({
                        html: Mustache.render(view, {
                            pages:pages,
                            prevPage:prev,
                            nextPage:next,
                            showNext:showNext,
                            showPrev:showPrev,
                            current:currentPageNumber,
                            total:totalPageNumber}),
                        container: me.container
                    });

                  lbs.actionHandler({container:me.container,handlers:me.handlers})
                })
    },

    handlers: {},
    searchHandlers:{}
};


lbs.globalHandlers = {
  bbqUpdate: function bbqUpdate(e, url) {


    var script_source_url;
    if (e) {
      script_source_url = e.currentTarget.getAttribute('data-linkto');
      e.preventDefault();
    } else {
      script_source_url = url;
    }
    if (script_source_url === "/home") {
      jQuery.bbq.pushState('#');
    } else if (script_source_url === "/workspace/welcome") { //@todo rolland thinks this 'else if' part is not needed as it can handled by the 'else'. need to confirm with harm
      jQuery.bbq.pushState('#' + '/workspace/welcome');


    } else {
      jQuery.bbq.pushState('#' + script_source_url);
    }
  }
};
lbs.actionHandler = function (arg) {

  var container = arg.container,
    handlers = arg.handlers,
      doOverride = arg.doOverride,
    $container;
  if (container.constructor === jQuery) {
    $container = container;
  } else {
    $container = jQuery(container);


  }
  var handler = function (attr) {
    return function (e) {
      var action = e.currentTarget.getAttribute(attr);
      action = action || '';
      action = action.split(',');
      var i = -1,
        len = action.length;
      while (++i < len) {
        if (typeof handlers[action[i]] === 'function') {
          handlers[action[i]](e);
        }
      }
    };
  };

    if(doOverride)
    {
       // $container.find("[data-action-click]").off('click');
        $container.find("#financesearch").off('click');
    }
  $container.find("[data-action-click]").on('click', handler('data-action-click'));
  $container.find("[data-action-change]").on('change', handler('data-action-change'));
  $container.find("[data-action-hover]").hover(handler('data-action-hover'));
};

lbs.binder = {
  BoundValue: (function () {

    var BoundValue = function (arg) {
      this.element = arg.element;
      this.toMutate = arg.toMutate;
      this.objToMutate = arg.objToMutate;
      this.root = arg.root;
      this.path = arg.path;
      this.changeListeners = arg.changeListeners || [];
      this.formatters = arg.formatters || {};
      var me = this;
      jQuery(this.element).on('change', function (e) {
        me.change(e);
      });
      //if updateUI is not called within one second then its assumed you want
      //  to bind the js object to the values of the html elements
      //  if updateUI is called within one second then you want to bind the 
      //  html element to the object and this timeout is cancelled
      this.initialBind = setTimeout(function () {
        me.change({
          target: me.element
        });
      }, 250);
    };
    var BoundList = function BoundList(arg) {
      BoundValue.call(this, arg);
    };
    var PhotoUploadBoundValue = function PhotoUploadBoundValue(arg) {
      var me = this;
      var plist;//for debugging, remove later
      BoundValue.call(this, arg);
      clearTimeout(this.initialBind);
      //@todo: refactor to external functions
      // handle clicks on the links
      lbs.actionHandler({
        container : jQuery(this.element)
        ,handlers : {
          "activity:response:upload:image:platform" : function(e){
            e.preventDefault();
            //get module to choose from my platform photos
            lbs.modHelper.getMod('/global:photos:list')
            .then(function(photoList){
              // set the handler for save so we can trigger our change event
              photoList.handlers['profile:save:selected:photo:basic'] = function(e){
                var arr = photoList.list;
                //@todo: because fake data has wrong type for _id (number) we cannot find a right match
                photoList.selectedPhoto = parseInt(photoList.selectedPhoto,10);//remove this when using real data
                var index = lbs.util.find({arr:arr,key:'_id',val:photoList.selectedPhoto});
                if(index!==-1){
                  // trigger change here, passing the data and set the image url
                  me.objToMutate[me.toMutate] = photoList.list[index];
                  //@todo: using dummy data so photourl is probably not the right value
                  //  better take this value from the template (data-uri-field) and use lbs.util.getMember
                  jQuery(me.element).find('img').prop('src',photoList.list[index].photourl);
                  jQuery(me.element).trigger('change');
                }
              }
              return photoList.render({settings:{hideOther:true,action:{saveBasic:true}}})
            });
          },
          "activity:response:upload:image:local" : function(e){
            e.preventDefault();
            me.uploadPhoto(e);
          }
        }
      });
      jQuery(this.element).find('img').on('load',function(e){
        var tmp = jQuery('<img >');
        tmp.on('load',function(e){
          var orgh = e.target.height;
          var orgw = e.target.width;
          var tarh = 200;
          var tarw = 150;
          var wanth,wantw;
          if((orgw/orgh)<(tarw/tarh)){
            wanth = tarh+'px';
            wantw = Math.floor(orgw * (tarh/orgh))+'px';
          }else {
            wantw = tarw+'px';
            wanth = Math.floor(orgh * (tarw/orgw))+'px';
          }
          console.log(wanth,wantw,'strrrange')
          jQuery(me.element).find('img').css({width:wantw,height:wanth});
        })
        tmp.prop('src',e.target.src);
      })
      //activity:response:upload:image:platform      
      
      //hide "choose from my photos link if no lbs.user"
      if(!lbs.user){
        jQuery(this.element).find('div.response_form_choose_photo').hide();
      }
    };
    var InnerHtmlBinder = function InnerHtmlBinder(arg) {
      BoundValue.call(this, arg);
    };
    BoundValue.create = function (arg) {
      if (arg.element.type === 'checkbox' &&
        (Object.prototype.toString.call(arg.objToMutate[arg.toMutate]).indexOf('Array') !== -1)) {
        return new BoundList(arg);
      }
      if (arg.element.tagName.toLowerCase() === 'span') {
        return new InnerHtmlBinder(arg);
      }
      if (arg.element.tagName.toLowerCase() === 'div' && arg.element.getAttribute('data-photo-standard')){
        return new PhotoUploadBoundValue(arg);
      }
      return new BoundValue(arg);
    }; //@todo: for later use if we have other types besides objects that have value and onchange
    BoundValue.prototype.change = function (e) {
      if (e && e.target && e.target.type === 'radio') {
        if (!e.target.checked) {
          return;
        }
      }
      if (this.element.type === 'checkbox' && (Object.prototype.toString.call(this.objToMutate[this.toMutate]).indexOf('Array') === -1)) {
        this.objToMutate[this.toMutate] = this.element.checked;
      } else {
        this.objToMutate[this.toMutate] = jQuery(e.target).val();
      }
      this.emitChange();
    };
    BoundValue.prototype.emitChange = function emitChange() {
      var i = this.changeListeners.length;


      while (--i > -1) {
        this.changeListeners[i](this.objToMutate, this.toMutate, this.root, this.path,this.element);
      }
    };
    BoundValue.prototype.cancelUpdateObject = function cancelUpdateObject() {
      clearTimeout(this.initialBind);
    };
    BoundValue.prototype.updateUI = function updateUI() {
      clearTimeout(this.initialBind);
      var val = this.objToMutate[this.toMutate];
      if (this.formatters[this.path.join('.')]) {
        val = this.formatters[this.path.join('.')](val);
      }
      if (this.element.tagName === 'SELECT') {
        lbs.util.setSelect(this.element, this.objToMutate[this.toMutate]);
      }
      if (this.element.type === 'radio') {
        this.element.checked = (this.objToMutate[this.toMutate] === this.element.value);
        return;
      }
      if (this.element.type === 'checkbox' && (Object.prototype.toString.call(this.objToMutate[this.toMutate]).indexOf('Array') === -1)) {
        this.element.checked = !!this.objToMutate[this.toMutate];
        return;
      }
      jQuery(this.element).val(val);
    };
    BoundValue.prototype.destroy = function () {
      jQuery(this.element).off();
    };
    BoundList.prototype = Object.create(BoundValue.prototype);
    BoundList.prototype.constructor = BoundList;
    BoundList.prototype.change = function (e) {
      var index;
      if (e.target.checked) {
        this.objToMutate[this.toMutate].push(e.target.value);
      } else {
        index = this.objToMutate[this.toMutate].indexOf(e.target.value);
        if (index !== -1) {
          this.objToMutate[this.toMutate].splice(index, 1);
        }
      }
      this.emitChange();
    };
    PhotoUploadBoundValue.prototype = Object.create(BoundValue.prototype);
    PhotoUploadBoundValue.prototype.constructor = PhotoUploadBoundValue;
    PhotoUploadBoundValue.prototype.destroy = function destroy() {
      //@todo: unbind handlers and 
    }
    PhotoUploadBoundValue.prototype.updateUI  = function updateUI() {
      var uri = lbs.util.getMember(this.root,this.path.concat(['uri']));
      jQuery(this.element).find('img').prop('src',uri);
      //@todo: add an event listener to resize the photo 
    }
    PhotoUploadBoundValue.prototype.uploadPhoto = function uploadPhoto(e){

        var me = this;

        console.log('uploading photos-----');
        console.log('e.target.getAttribute("data-id")----',e.target.getAttribute("data-id"));
        console.log('e.target-------------',e.target);


        var targetPHotoPlaceHolder = $(e.target).closest('.imageWrapper').find('#spinnerPlaceHolder');

        console.log('targetPHotoPlaceHolder',targetPHotoPlaceHolder);
         targetPHotoPlaceHolder.addClass('spinnerContainer');

         var ac  = lbs.processes.activities.application.dbResponse.acn;
         var rc  = lbs.processes.activities.application.dbResponse.rc;
         var ow  = lbs.processes.activities.application.dbResponse.ow;
         var can = lbs.processes.activities.application.dbResponse.can;
         var cat = lbs.processes.activities.application.dbResponse.cat;
         var tpp = lbs.processes.activities.application.dbActivity.fm.fd.pt[0].pp;  //todo assume there is only one photo

         var input = jQuery(e.target),
          numFiles = input.get(0).files ? input.get(0).files.length : 1,
          label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
         if (jQuery(e.target)[0].files[0]) {


             console.log('got file!!!!!!!!');

          var reader = new FileReader();
          reader.onload = function (e){
            var oldSrc = jQuery(me.element).find('img').attr('src');


           // jQuery(me.element).find('img').attr('src', e.target.result);

            jQuery(me.element).find('form').ajaxSubmit({
              type:'POST',
              url:'/home/uploadphoto.json',
              //data: {'json': JSON.stringify({ac:ac,rc:rc,ow:ow})},
              data: {'json': JSON.stringify({ac:ac,rc:rc,ow:ow,can:can,cat:cat,tpp:tpp})},
              dataType: 'json',
              success:function(data){

                  console.log('file submitted!!!!!!!!');
                $(targetPHotoPlaceHolder).removeClass('spinnerContainer');
                jQuery(me.element).find('form').resetForm();
                jQuery(me.element).find('img').prop('src',data.pl.uri);


                  $('.imageWrapper').find('span.validationHolder.pleaseUploadImage').remove();

                  me.objToMutate[me.toMutate] = data;
                jQuery(me.element).trigger('change');
              },
              error:function(err){

                  targetPHotoPlaceHolder.removeClass('spinnerContainer');
                alert('上传失败了，请重试!');
                jQuery(me.element).find('img').attr('src', oldSrc);
                jQuery(me.element).find('form').resetForm();
               }
           });
         }
        reader.readAsDataURL($(e.target)[0].files[0]);
       }
  }
    PhotoUploadBoundValue.prototype.change   = function change(e) {
      if(e.target.getAttribute('data-bind')){
        this.emitChange();
      }
    }
    InnerHtmlBinder.prototype = Object.create(BoundValue.prototype);
    InnerHtmlBinder.prototype.constructor = InnerHtmlBinder;
    InnerHtmlBinder.prototype.change = function (e) {};
    InnerHtmlBinder.prototype.updateUI = function updateUI() {
      clearTimeout(this.initialBind);
      jQuery(this.element).text(this.objToMutate[this.toMutate]);
    };
    return BoundValue;
  }()),
  bind: function (container, object, nameSpace, changeListeners, formatters) {
    var boundVals = [];
    jQuery(container).find('[data-bind]').each(function () {

      var item = this.getAttribute('data-bind').split('.');
      var itemPath = item.slice(1, item.length - 1);
      var toMutate = item.slice(item.length - 1)[0];
      var objToMutate = lbs.util.getMember(object, itemPath);
      var i = -1;
      var o = object;
      if (nameSpace && (nameSpace !== item[0])) {
        return 1;
      }
      if (objToMutate === undefined) {
        if(!this.getAttribute('data-error-on-undefined-model')){
          throw new Error('Unable to get object to bind to.');
        }else{
          while((i+=1)<itemPath.length){
            if(o[itemPath[i]]===undefined){
              o[itemPath[i]] = {};
            }
            o = o[itemPath[i]];
          }
          objToMutate = lbs.util.getMember(object, itemPath);
        }
      }
      boundVals.push(lbs.binder.BoundValue.create({
        element: this,
        toMutate: toMutate,
        objToMutate: objToMutate,
        changeListeners: changeListeners,
        formatters: formatters,
        root: object,
        path: item.slice(1)
      }));
    });
    return boundVals;
  },
  unbind: function (boundValues) {
    var i = -1,
      len;
    len = boundValues.length || 0;
    while (++i < len) {
      boundValues[i].destroy();
    }
  },
  updateUI: function (boundValues) {
    var i = -1,
      len = boundValues.length;
    while (++i < len) {
      boundValues[i].updateUI();
    }
  },
  cancelUpdateObject: function cancelUpdateObject(boundValues) {
    var i = -1,
      len = boundValues.length;
    while (++i < len) {
      boundValues[i].cancelUpdateObject();
    }
  }
};

lbs.util = {
  getMember: function getMember(o, memberNames) {
    var i = -1,
      len = memberNames.length;
    while (++i < len) {
      o = o[memberNames[i]];
      if (o === undefined||o === null) {
        break;
      }
    }
    return o;
  },
  convertToString: function convertToString(arr) {
    var i = -1,
      len = arr.length,
      ret = [];
    while (++i < len) {
      ret.push(arr[i].toString());
    }
    return ret;
  },
  sortMethod: function (asc, key) {
    var direction = asc ? 1 : -1;
    return function (a, b) {
      return (a[key] - b[key]) * direction;
    };
  },
  merge: function (source, target) {
    //adds/overwrites source members on target
    var key;
    for (key in source) {
      if (Object.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  },
  setSelect: function setSelect(el, val) {
    if (val === undefined) {
      return;
    }
    var $el = jQuery(el);
    $el.val(val);
    if ($el.hasClass('selectpicker')) {
      $el.selectpicker('render');
    }
    return;
  },

  emptyUi:function emptyUi(container){



      console.log('in empty ui----');

      $(container).find('input[type="text"], select').each(function(){


          console.log('this----',this);

          if(this.type === 'text'){
              console.log('text type');
              $(this).val(' ');

          }
          if (this.tagName === 'SELECT') {

              console.log('select type');

              $(this).find('option:eq(0)').prop('selected', true);
              if ($(this).hasClass('selectpicker')) {
                  $(this).selectpicker('render');
              }
          }


      });


  },
  find: function (arg) {
    var arr = arg.arr,
      key = arg.key,
      val = arg.val,
      index = arg.index || 0,
      i = index - 1,
      len = arr.length,
      multiple = arg.multiple,
      ret = multiple ? [] : -1;
    while (++i < len) {
      if (arr[i][key] === val) {
        if (multiple) {
          ret.push(i);
        } else {
          return i;
        }
      }
    }
    return ret;
  },

   findDeep: function (arg) {
       if (!arg || !arg.arr || !arg.arr.length ){

           return -1;
       }
        var arr = arg.arr,
            key = arg.key.split('.'),

            val = arg.val,
            index = arg.index || 0,
            i = index - 1,
            len = arr.length,
            ret = -1;
        while (++i < len) {
                if (lbs.util.getMember(arr[i],key) === val) {
                        return i;
                }

        }
        return ret;
},


  shorter: function shorter(key, start, length) {
    return function () {
      var item = lbs.util.getMember(this, key.split('.'));
      if (item) {
        return item.substr(start, length);
      }
      return '';
    };
  },
  isArray: function isArray(obj) {
    return Object.prototype.toString.call(obj).indexOf('Array') !== -1;
  },
  hideItem: function hideItem(target) {
    if (!jQuery(target).is(':hidden')) {
      jQuery(target).addClass('hide');
    }
  },
  showItem: function showItem(target) {
    if (jQuery(target).is(':hidden')) {
      jQuery(target).removeClass('hide');
    }
  },
  renderDate: function renderDate() {
    return function (text, render) {
      return render(text).substr(0, 10);
    };
  },
  renderDateTime: function renderDateTime(){
    return function (text, render) {
      var cleantext = render(text).substr(0, 10) + ' ' + render(text).substring(11, 19);
      return cleantext;
    };
  },
  renderFileSizeInKB: function renderFileSizeInKB(){
    return function (text, render) {
        var size = render(text);
        var cleantext = '';
        if(size > 0){

             cleantext = Math.round( size/ 1024) + ' KB';
        }

        return cleantext;
    };
  },
  showFailureMessage: function showFailureMessage(arg){

      if(arg&&arg.message){
          lbs.modHelper.getView('/commons/views/faillure.html')
              .then(function(view){


                  lbs.modHelper.setContainer({
                      container: '#platformAPIsModal'
                       , html: Mustache.render(view,{message:arg.message, title:arg.title?arg.title:null})
                  });


                  $('#platformAPIsModal').modal( ).off('hide.bs.modal.globalfailure');
                  $('#platformAPIsModal').modal().on('hide.bs.modal.globalfailure', function () {
                      lbs.modHelper.setContainer({
                      container: '#platformAPIsModal'
                     , html: ''
                     });
                    });

              })
      }
      else{
          console.log('error in show failure message');
      }
  },

 canRespond: function canRespond(arg){
 //get activity response condition or limitations ( properties on the activity)
 //get usertype
 //compare if the current usertype can respond to the activity




     return $.when().then(function(){

         //Check for user registration level if there is a userlimit specified
         if (arg.activity.abd && arg.activity.abd.ul) {

             var itemNumber = parseInt(arg.activity.abd.ul),
                 loggedIn = lbs.user != undefined,
                 userType = lbs.user ? lbs.user.userType : undefined,
                 validated = lbs.profile && lbs.profile.vs == '已实名认证' ? true : false;
             if (itemNumber === 20 && (!loggedIn || !validated || userType !== 'personal')) {
                 //only allows personal validated users
                 lbs.util.showFailureMessage({message:'只允许已认证个人用户响应',title:'事务响应性质提醒'});
                 return false;
             }
             else if (itemNumber === 30 && (!loggedIn || !validated || userType !== 'corporate')) {
                 //only allows corporate validated users
                 lbs.util.showFailureMessage({message:'只允许以认证单位用户响应',title:'事务响应性质提醒'});
                 return false;
             }
             else if (itemNumber === 40 && (!loggedIn || !validated)){
                 //only allows  validated users (corporate or personal validated users)
                 lbs.util.showFailureMessage({message:'只允许已认证用户响应',title:'事务响应性质提醒'});
                 return false;
             }
             //else console.log("DEBUG: Activity permits this kind of user for itemNumber==",itemNumber,loggedIn==true,userType,validated==true);
         }//else console.log("DEBUG: No user type restriction specified");
         //Check if activity has slots left if there is a response limit
         if(arg.activity.arc && arg.activity.arc.mr > 0 && arg.activity.arc.crc !== undefined)
         {
            if(arg.activity.arc.mr <= arg.activity.arc.crc)
            {
                lbs.util.showFailureMessage({message:'响应名额已满',title:'事务响应性质提醒'});
                return false;
            }
            //else console.log("DEBUG: Activity has response slots remaining:",arg.activity.arc.crc,"/",arg.activity.arc.mr);
         }//else console.log("DEBUG: No maximum response slots specified");
         //Check if activity is current if there is a date restriction
         if(arg.activity.abd && (arg.activity.abd.asd || arg.activity.abd.acd))
         {
             var now = new Date();
             if(arg.activity.abd.asd && now < new Date(arg.activity.abd.asd))
             {
                 lbs.util.showFailureMessage({message:'事务还未开始',title:'事务响应性质提醒'});
                 return false;
             }
             else if(arg.activity.abd.acd && now > new Date(arg.activity.abd.acd))
             {
                 lbs.util.showFailureMessage({message:'事务响应已过期',title:'事务响应性质提醒'});
                 return false;
             }
             //else console.log("DEBUG: Activity is currently active");
         }//else console.log("DEBUG: Activity duration is indefinite");
         return true;
     });


    },

    showCountDownMessage: function showCountDownMessage(arg){

        jQuery.when()
            .then(function(){

                if(arg&&arg.message){
                    lbs.modHelper.getView('/workspace/firstTimeWelcomePopUp.html')
                        .then(function(view){

                            lbs.modHelper.setContainer({
                                container: '#platformAPIsModal'
                                , html: Mustache.render(view,{message:arg.message,count:arg.count||3})
                            });


                            $('#platformAPIsModal').modal().off('hide.bs.modal.globalCountDownd');
                            $('#platformAPIsModal').modal().on('hide.bs.modal.globalCountDownd', function(){
                                lbs.modHelper.setContainer({
                                    container: '#platformAPIsModal'
                                    , html:''
                                });
                            });





                            enxtendedCountDown(arg.count,'#platformAPIsModal',function(){
                                $('#platformAPIsModal').modal('hide');
                            });

                        })
                }
                else{
                    console.log('error in show countdownd message');
                }

            });
    },


  validationFileUrl: function validationFileUrl() {
        return function (text, render) {
            var val = render(text);
                val = val.slice(0, val.indexOf('#'));

                return val;
        };
    },
  renderActivityTypes:function renderActivityTypes(e){
      return function(text,render){

          var arr = lbs.settings.messages.cn.activityTypes;

          var index = lbs.util.find({arr:arr, key:'val', val:render(text)});

          var value = '';
          if(index>-1){
              value = arr[index].text;
          }
          return value
      }

  },
  renderServiceStatus:function renderServiceStatus(e){

        return function(text,render){

           var value = render(text).toString();
            var status = '';
            if(value){
                status = lbs.settings.messages.serviceStatus[value].text;
            }

            return status;
        }

    },
  validationFileName: function validationFileName() {
        return function (text, render) {
            var val = render(text);
                val = val.slice(val.indexOf('#')+1);

                return val;
        };
  },
  validateForm: function validateForm(element,status,typeofelement){

      var elem = element?$((element).parentNode):null;

      var ignoreValidation = $(element).hasClass('ignoreValidation') || element === true;
     //
     // console.log('parent node---elem',elem);
     //console.log('element $',$(element).hasClass('ignoreValidation'));
     //console.log('element',element);

        if(elem && (!ignoreValidation)) {

            if (status === 'success') {

                elem.find('span.glyphicon-remove').remove();

                elem.find('span.mustfill').remove();


                if (element.tagName === 'SELECT') {

                    if(elem.find('select').hasClass('selectpicker')){   //for bootstrap select;

                        lbs.util.overWriteSelectPickerHover(elem);
                        elem.find('.bootstrap-select').append('<span class="validationHolder lan_absolute glyphicon  glyphicon-ok" style="color:#2785c3; right:10px; top:8px;"></span>');
                        //elem.find('.bootstrap-select').find('.btn.dropdown-toggle ').css({
                        //    'border': '#2785c3 1px solid',
                        //    'border-radius': '5px'
                        //});

                    }
                    else{   //for default selects

                        elem.addClass('lan_relative');
                        elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-ok" style="color:#2785c3; right:25px; top:8px;"></span>');
                       // elem.find('select').css({'border': '#2785c3 1px solid', 'border-radius': '5px'});

                    }



                }else if(element.type === 'date'){

                    lbs.util.hideValidatorOnDateInputHover(elem);
                    elem.addClass('lan_relative');
                    elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-ok" style="color:#2785c3; right:25px; top:7px;"></span>');
                   // elem.find('input').css({'border': '#2785c3 1px solid', 'border-radius': '5px'});

                }
                else if (element.tagName === 'DIV'||element.type === 'checkbox'||element.type === 'radio') {
                    //photo upload;
                    return;
                }
                else if(elem[0].tagName === 'FORM'&&$(element).siblings('input[type="file"]')){// should not affect document upload forms
                    return;
                }
                else {

                    elem.addClass('lan_relative');
                    elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-ok" style="color:#2785c3; right:20px; top:8px;"></span>');
                   // elem.find('input, textarea').css({'border': '#2785c3 1px solid', 'border-radius': '5px'});

                }

            }
            else if (status === 'fail') {


                elem.find('span.glyphicon-ok').remove();



                if (element.tagName === 'SELECT') {


                    if(elem.find('select').hasClass('selectpicker')){   //for bootstrap select;

                        lbs.util.overWriteSelectPickerHover(elem);

                        elem.find('.bootstrap-select').append('<span class="validationHolder lan_absolute glyphicon  glyphicon-remove" style="color:red; right:10px; top:8px;"></span>');
                       // elem.find('.bootstrap-select').append('<span class="validationHolder lan_absolute mustfill" style="color:red; left:20px; top:30px; font-size:80%;"> 必须填！</span>');


                        //elem.find('.bootstrap-select').find('.btn.dropdown-toggle ').css({
                        //    'border': 'red 1px solid',
                        //    'border-radius': '5px'
                        //});


                    }
                    else{   //for default selects

                        elem.addClass('lan_relative');
                        elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-remove" style="color:red; right:25px; top:8px;"></span>');
                       // elem.append('<span class="validationHolder lan_absolute mustfill" style="color:red; left:20px; top:30px;font-size:80%;"> 必须填！</span>');
                     //   elem.find('select').css({'border': 'red 1px solid', 'border-radius': '5px'});

                    }


                }
                else if(element.type === 'date'){

                    lbs.util.hideValidatorOnDateInputHover(elem);
                    elem.addClass('lan_relative');
                    elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-remove" style="color:red; right:30px; top:10px;"></span>');
                   // elem.append('<span class="validationHolder lan_absolute mustfill" style="color:red; left:20px; top:30px;font-size:80%;"> 必须填！</span>');
                   // elem.find('input').css({'border': 'red 1px solid', 'border-radius': '5px'});

                }
                else if(element.type === 'textarea'){

                    elem.addClass('lan_relative');
                    elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-remove" data-action-click="clearInputVal" style="color:red; right:20px; top:8px;"></span>');
                   // elem.append('<span class="validationHolder lan_absolute mustfill" style="color:red; left:20px; top:75px; font-size:80%;"> 必须填！</span>');
                   // elem.find('textarea').css({'border': 'red 1px solid', 'border-radius': '5px'});



                    lbs.actionHandler({
                        container:elem,
                        handlers:{clearInputVal:function (e){
                            $(e.target).closest('.lan_relative').find('.formToolElement').val('');

                        }}
                    });


                }
                else if(typeofelement === 'image'){

                    $('.imageWrapper').addClass('lan_relative');
                    $('.imageWrapper').append('<span class="validationHolder lan_absolute pleaseUploadImage" style="color:red; right:30px; bottom:50px;">请上传照片!</span>');
                }
                else if (element.tagName === 'DIV'||element.type === 'checkbox'||element.type === 'radio') {
                    //photo upload;
                    return;
                }
                else if(elem[0].tagName === 'FORM'&&$(element).siblings('input[type="file"]')){// should not affect document upload forms
                    return;
                }
                else {
                    elem.addClass('lan_relative');
                    elem.append('<span class="validationHolder lan_absolute glyphicon  glyphicon-remove" data-action-click="clearInputVal" style="color:red; right:20px; top:8px;"></span>');
                    //elem.append('<span class="validationHolder lan_absolute mustfill" style="color:red; left:20px; top:30px; font-size:80%;"> 必须填！</span>');
                    //elem.find('input').css({'border': 'red 1px solid', 'border-radius': '5px'});

                    lbs.actionHandler({
                        container:elem,
                        handlers:{clearInputVal:function (e){
                            $(e.target).closest('.lan_relative').find('.formToolElement').val('');
                        }}
                    });


                }

            }






        }

  },
  specialValidateForm: function specialValidateForm(element, status){

        var elem = element?$((element).parentNode):null;

        if(elem) {
            if(status==='success'){
                elem.find('.lan-special-validation-indicator-span ').remove();
            }
            else{
                elem.addClass('lan_relative');
                elem.append('<span class="validationHolder lan_absolute glyphicon lan-special-validation-indicator-span  glyphicon-remove" style="color:red; right:-15px; top:0;"></span>');
            }
        }
    },
  validateRequiredFormFieds:function validateRequiredFormFieds(container,element){

      var valid = true;

      var doemElem  = $(element);
      console.log(' validateRequiredFormFieds-||||||||---');


      if(element){    //validation required element;


          console.log('PASSED ELEMENT -||||||||---',element);


          return jQuery.when()
              .then(function(){

                      var atribute = element.getAttribute('data-verification');
                      var valueBoundTo = element.getAttribute('data-bind');



                      if(atribute === 'true'){
                          if(element.type === 'text'||element.type === 'textarea'||element.tagName === 'SELECT'){

                              console.log('ELEMENT VALIDATION -||||||||---');

                              var requiredVal = $(element).val();

                              console.log('requiredVal--',requiredVal);

                              if(!requiredVal){
                                  valid =  false;
                                  lbs.util.validateForm(element,'fail');
                              }
                              else if(valueBoundTo==='entity.fields.LZSID'){// national id number validation

                                 var idValReuslt = IdentityCodeValid(requiredVal);

                                  if(!idValReuslt){
                                      console.log('FAILLING ID VALIDATION -||||||||---');

                                      valid =  false;
                                      lbs.util.validateForm(element,'fail');

                                  }

                              }

                          }
                          else if(element.tagName === 'DIV'&&$(element).hasClass('imageWrapper')){



                              console.log('checking image-----');



                              var patern = /\/commons\/images\/IDPhotoSubmitedDemo.png/;


                              if(!patern.test($(element).find('img').prop('src'))){
                                  valid =  false;
                                  lbs.util.validateForm(element,'fail','image');
                              }

                          }

                      }
                      else {
                          console.log('not required');
                      }



              }).then(function(){
                  if(valid){
                      $('#formRequiredFieldsFeedBack').addClass('hide');


                  }


                  return valid;
              });


      }
      else if(container) {



          return jQuery.when()
              .then(function(){

                  //scan for required formfields
                  $(container).find("[data-verification=true]").each(function(){

                      var valueBoundTo = this.getAttribute('data-bind');


                      if(this.type === 'text'||this.type === 'textarea'||this.tagName === 'SELECT'){

                          var requiredVal = $(this).val();

                          if(!requiredVal){

                              console.log('scanning validation', this);
                              valid =  false;
                              lbs.util.validateForm(this,'fail');
                          }
                          else if(valueBoundTo==='entity.fields.LZSID'){// national id number validation

                              var idValReuslt = IdentityCodeValid(requiredVal);

                              if(!idValReuslt){


                                  lbs.util.validateForm(this,'fail');

                                  valid =  false;

                              }

                          }

                      }
                      else if(this.tagName === 'DIV'&&$(this).hasClass('imageWrapper')){

                          console.log('checking image-----');

                          var patern = /\/commons\/images\/IDPhotoSubmitedDemo.png/;


                          if(!patern.test($(this).find('img').prop('src'))){
                              valid =  false;
                              lbs.util.validateForm(this,'fail','image');
                          }

                      }

                  });

              }).then(function(){

                  valid = valid&&lbs.util.validateRequiredSpecialFieds('.lanDynamicForm');

              })
              .then(function(){

                  if(!valid){
                      $('#formRequiredFieldsFeedBack').removeClass('hide');
                  }

                  return valid;
              })
      }
  },

  validateRequiredSpecialFieds:function  validateRequiredSpecialFieds(container,element){

        var valid = true;


      //expected from lbs.util.validateRequiredFormFieds
      if(container){
          //scan for special validations(not form fields)
          $(container).find("[data-special-verification]").each(function(){

              var validStatus = this.getAttribute('data-special-verification');

              if(validStatus === 'true'){
                  lbs.util.specialValidateForm(this,'success');
                  valid = true;
              }
              else{
                  lbs.util.specialValidateForm(this,'fail');
                  valid = false;
              }

          });

          return valid;
      }
      else if(element){
          lbs.util.specialValidateForm(element,'success');
      }

    },
  overWriteSelectPickerHover:function overWriteSelectPicketHover(elem){

    elem.find('.bootstrap-select').addClass('lan_relative lanValidating');
    elem.find('.bootstrap-select').find('.caret').addClass('hide');

    elem.find('.bootstrap-select').mouseenter(function () {

        elem.find('.bootstrap-select').find('.caret').removeClass('hide');
    });

    elem.find('.bootstrap-select').mouseleave(function () {

        if (elem.find('.bootstrap-select').hasClass('lanValidating')) {

            elem.find('.bootstrap-select').find('.caret').addClass('hide');
        }

    });
 },
  hideValidatorOnDateInputHover:function hideValidatorOnDateInputHover(elem){




      elem.mouseenter(function () {

          elem.find('.validationHolder').addClass('hide');
      });


      elem.mouseleave(function () {

          elem.find('.validationHolder').removeClass('hide');
      });


  },

  checkMobileMatch: function checkMobileMatch(elem1,elem2,notifierContainer){

          var value1 = jQuery(elem1).val();
          var value2 = jQuery(elem2).val();


        console.log('validateMobile(value1)----',validateMobile(value1));

          if (value1 !== value2) {
              jQuery(notifierContainer).css({
                  "background": "url(../../commons/images/wrong_state.png)  left center no-repeat",
                  "padding-left": "18px",
                  "font-size":"80%"
              }).html("输入内容不一致!");


              return false;
          }
          else  if(!validateMobile(value1)){

              jQuery(notifierContainer).css({
                  "background": "url(../../commons/images/wrong_state.png)  left center no-repeat",
                  "padding-left": "18px",
                  "font-size":"80%"
              }).html("手机号不合格!");


              return false;

          }
          else{
              jQuery(notifierContainer).css({
                      "background":"url(../../commons/images/right_state.png)  left center no-repeat",
                      "padding-left":"18px"
                  }).html(" ");


              return true;
          }
  },
  preventOpenningEmptyLinks: function preventOpenningEmptyLinks(container){

      $(container).find('a').each(function(){


                  $(this).click(function(e){

                      var url = $(this).prop('href');


                      if(url) {
                          var urlending = url.split('/').pop();
                          if(!urlending){
                              e.preventDefault();
                          }
                      }

                  });

      });

  }

};

lbs.modHelper.returnResolved = function returnResolved(ret) {
  var d = jQuery.Deferred();
  setTimeout(function () {
    d.resolve(ret);
  });
  return d.promise();
};
(function (loadedMods) {
  lbs.modHelper.setContainer = function setContainer(arg) {


    var currentMod = loadedMods[arg.container];
    if (currentMod && arg.mod !== currentMod && (typeof currentMod.remove === 'function')) {
      //current module occupying the container is not the module trying to set html
      //it has a remove method so call that so it can clean up
      currentMod.remove();
    }
    jQuery(arg.container).html(arg.html);
    loadedMods[arg.container] = arg.mod;
  };
}({})); //set loadedMods to an empty object

lbs.modHelper.getView = function (location, cache) {
  cache = (cache === false) ? false : true;
  var fetcher = new lbs.modHelper();
  return fetcher.fetch({
    url: location,
    cache: cache,
    type: 'view'
  });
};
lbs.modHelper.getUser = function (arg) {
  arg = arg || {};
  var recoverOptions = arg.recoverOptions || {};
  recoverOptions.message = recoverOptions.message || 'You have to log in to continue'; //@todo: this should be passed and defined in a lbs.settings.messages
  recoverOptions.persist = (recoverOptions.persist === false) ? false : true;
  var d = jQuery.Deferred();
  lbs.modHelper.getMod('/workspace')
    .then(function (mod) {
      if (typeof mod.create === 'function') {
        mod.create();
      }
      return mod.handleLogin(recoverOptions);
    }).then(function (message) {
      d.resolve();
    });
  return d.promise();
};

lbs.modHelper.recover = function recover(arg) {


  if(arg&&arg.custom){ //todo can be used to pass custom messages from the getMessage() method
        lbs.util.showFailureMessage({message:arg.custom});
    }


 else if (arg && arg.msg && arg.msg.responseJSON && arg.msg.responseJSON.er) {
        if (arg.msg.responseJSON.er.ec === 8401 || arg.msg.responseJSON.er.ec === 8404) {
          return lbs.modHelper.getUser(arg);
        }
  }
 else if (arg && arg.msg && arg.msg.readyState === 0) {
    console.log('do something for not connected', arg);

      lbs.util.showFailureMessage({message:'Not connected, please check your connection!'});

    //@todo: handle a disconnected state
  }
 else if (arg && arg.msg && arg.msg.status === 500) {

      lbs.util.showFailureMessage({message:'Server error: please try again later!'});

  }
 else if (arg && arg.msg && arg.msg.status === 404) {

    lbs.util.showFailureMessage({message:'resource not found, please try again!'});

   }
  else {
    console.log('Unkown failure:', arg);

      lbs.util.showFailureMessage({message:'Unknown failure, please try again later!'});
  }
  //@todo: should handle disconnected or not authorised
  var d = jQuery.Deferred();
  setTimeout(function () {
    console.log('rejecting');
    d.reject('Unable to recover or recover not implemented.');
  });
  return d.promise();
};



lbs.modHelper.getMessage = function (location, cache, recoverOptions, httpType, data) {
  //@todo: here is where a module specific cache can be useful so fetcher can add it for you
  var fetcher = new lbs.modHelper();
  var d = jQuery.Deferred();
  fetcher.fetch({
    url: location,
    cache: (cache === true) ? true : false //for messages the default is not to cache
      ,
    type: 'endpoint',
    httpType: httpType || 'GET',
    data: data || {}
  }).then(function success(msg) {
    d.resolve(msg);
  }, function reject(msg) {

      var obj = {
          msg: msg,
          location: location,
          recoverOptions: recoverOptions,
          custom:null
      }



    if (!recoverOptions) {
      d.reject(msg);
      return;
    }
    else if(recoverOptions.custom){
          obj.custom = recoverOptions.custom
    }

    lbs.modHelper.recover(obj)
      .then(function () {
        lbs.modHelper.getMessage(location, cache, false, httpType, data)
          .then(function resolve(msg) {
            d.resolve(msg);
          }, function reject(reason) {
            d.reject(reason);
          });
      }, function reject(reason) {
        d.reject(reason);
      });
  });
  return d.promise();
};
lbs.modHelper.getScriptFromUrl = function (arg) {
  var defer = jQuery.Deferred();
  var script;
  var version = /.*\/main\.js$/.test(arg.url) ? lbs.settings.version : '';
  script = document.createElement('script');
  script.onload = function (e) {
    defer.resolve(arg);
  };
  script.onerror = function (e) {
    defer.reject('cannot load this.');
  };
  script.src = arg.url + version;
  document.head.appendChild(script);
  return defer.promise();
};
lbs.modHelper.getCssFromUrl = function (arg) {
  var defer = jQuery.Deferred();
  var css;
  css = document.createElement('link');
  css.onload = function (e) {
    defer.resolve(arg);
  };
  css.onerror = function (e) {
    defer.reject('cannot load this.');
  };
  css.rel = 'stylesheet';
  css.href = arg.url;
  document.head.appendChild(css);
  return defer.promise();
};
lbs.modHelper.getMod = function (route) {
  //empty route defaults to /
  //  route = (route==='')?'/':route;
  var f = new lbs.modHelper();
  var mod;
  var deps;
  var i = -1,
    len;
  var d = jQuery.Deferred();
  var promises = [];
  f.fetch({
    url: route
  }).then(function (route) {
    mod = lbs.modules[route.routeurl];
    if (mod && (typeof mod === 'function')) {
      mod = new mod(); //mod is a constructor
    }
    if (!(mod && mod.deps)) {
      d.resolve(mod);
      return;
    }
    deps = mod.deps;
    len = (deps && deps.length) ? deps.length : 0;
    while (++i < len) {
      promises.push(lbs.modHelper.getMod(deps[i]));
    }
    jQuery.when.apply(jQuery, promises).then(function () {
      if (mod && (typeof mod.create === 'function')) {
        mod.create();
      }
      if (mod && (typeof mod === 'function')) {
        mod = new mod(); //mod is a constructor
      }
      d.resolve(mod);
    });
  });
  return d.promise();
};
lbs.modHelper.prototype.fetch = function (arg) {
  this.defer = jQuery.Deferred();
  var me = this;
  var cacheVal = true;
  this.start = new Date().getTime();
  this.type = arg.type || 'mod';
  this.url = this.location = arg.url; //@todo: not taking GET data into account
  this.cache = (arg.cache === false) ? false : this.cache;
  this.container = arg.container || false; //use no cache if indicated
  this.response = null;
  if (this.type === 'mod') {  // in the case we want to get a module instead of data
    return this.getScript();
  }
  if (/.html$/.test(this.url)) {
    this.url = this.url + lbs.settings.version;
    this.location = this.url;
  }



// // if ((this.cache === false) || !this.cache[this.location]) {
//    jQuery.ajax({
//      url: this.url,
//      cache:true,  //@ todo should not use browsers cache as we already have lbs cache.
//      data: arg.data || {},
//      type: arg.httpType || 'GET'
//    }).then(function (res) {
//      if (me.cache) {
//        me.cache[this.url] = me.response = res;  // chache all views unless cache has been explicitely been set to false
//      } else {
//
//
//        me.response = res;
//      }




    if ((this.cache === false)){
        cacheVal = false;
        }

        jQuery.ajax({
            url: this.url,
            cache:cacheVal,  //@ todo should not use browers cache as we already have lbs cache.
            data: arg.data || {},
            type: arg.httpType || 'GET'
        }).then(function (res) {
               me.response = res;  // chache all views unless cache has been explicitely been set to false
               me.gotResponse();

    }).fail(function (reason) {
      //@todo: what if it fails, how to handle (we can do a callback or return a failed promise)
      me.defer.reject(reason);
    });




  return this.defer.promise();
};
lbs.modHelper.prototype.getScript = function getScript() {
  //mods don't work with cache, they eiter exist or they dont
  this.route = lbs.routes[this.url];
  if (!this.route) {
    throw new Error('Unknown route:' + this.url);
  }
  var mod = lbs.modules[this.url];
  this.location = this.route.location;
  var me = this;
  if (!mod) {
    lbs.modHelper.getScriptFromUrl({
        url: this.location
      })
      .then(function () {
        me.route.routeurl = me.url;
        me.defer.resolve(me.route);
      });
  } else {
    this.route.routeurl = this.url;
    this.defer.resolve(this.route);
  }
  return this.defer.promise();
};
lbs.modHelper.prototype.gotResponse = function gotResponse() {
  this.defer.resolve(this.response);
};
lbs.modHelper.createIsSelected = function createIsSelected(val, key) {
  //depending on what val is (Object.prototype.toString.call(val))==="[object Array]" return a different function
  if (Object.prototype.toString.call(val) === "[object Array]") {
    val = lbs.util.convertToString(val);
    return function () {
      var listVal = (key) ? lbs.util.getMember(this, key.split('.')) : this;
      //val could be null or undefined, need to convert to the same type but cannot use toString() on null or undefined
      //  !!! note that the array named val has to contain strings
      listVal = ((listVal || listVal === 0 || listVal === false) && typeof listVal.toString === 'function') ? listVal.toString() : listVal;
      return val.indexOf(listVal) !== -1 ? 'selected' : '';
    };
  }
  return function () {
    var listVal = (key) ? lbs.util.getMember(this, key.split('.')) : this;
    //val could be null or undefined, need to convert to the same type but cannot use toString() on null or undefined
    listVal = ((listVal || listVal === 0 || listVal === false) && typeof listVal.toString === 'function') ? listVal.toString() : listVal;
    val = ((val || val === 0 || val === false) && typeof val.toString === 'function') ? val.toString() : val;
    return listVal === val ? 'selected' : '';
  };
};
lbs.modHelper.isChecked = function isChecked(entityList, key) {
  return function () {
    return entityList.indexOf(this[key].toString()) > -1 ? 'checked' : '';
  };
};
lbs.modHelper.isVal = function isVal(arg) {
  return function () {
    arg.obj = arg.obj || this;
    var key = (typeof arg.key === 'function') ? arg.key() : arg.key,
      val = (typeof arg.val === 'function') ? arg.val() : arg.val;
    if (arg.obj[key] === val) {
      return arg.yes;
    }
    return arg.no;
  };
};
lbs.modHelper.index = function index(arg) {
  arg = arg || {};
  var indx = arg.index || 0;
  return function () {
    return indx++;
  };
};
//get the global template for modal
lbs.modHelper.getView('/commons/views/modal.html');


lbs.validator = (function () {
  var BaseValidator = function () {

  };
  var ServiceValidator = function (arg) {
    BaseValidator.call(this, arg);
  };
  var types = {
    'service': ServiceValidator
  };
  BaseValidator.create = function (type) {
    if (typeof types[type] === 'function') {
      return new types[type]();
    }
  };
  BaseValidator.bindCss = function bindCss(arg) {
    var $elems = jQuery(arg.container).find('[data-validate]').each(function () {

    });
  };

  BaseValidator.prototype.rangeString = function rangeString(val, min, max) {
    var evals = [],
      i = -1,
      len, ret = true;
    val = val || '';
    if (min !== undefined) {
      evals.push(val.replace(/\s/igm, '').length >= min);
    }
    if (max !== undefined) {
      evals.push(val.replace(/\s/igm, '').length <= max);
    }
    len = evals.length;
    while (++i < len) {
      ret = ret && evals[i];
    }
    return ret;
  };
  BaseValidator.prototype.rangeNumber = function (val, min, max) {
    var evals = [],
      i = -1,
      len, ret = true,
      numVal;
    numVal = parseFloat(val, 10);
    evals.push(!isNaN(numVal));
    if (min !== undefined) {
      evals.push(numVal >= min);
    }
    if (max !== undefined) {
      evals.push(numVal <= max);
    }
    len = evals.length;
    while (++i < len) {
      ret = ret && evals[i];
    }
    return ret;
  };

  ServiceValidator.prototype = Object.create(BaseValidator.prototype);
  ServiceValidator.prototype.constructor = ServiceValidator;
  ServiceValidator.prototype.serviceName = function (arg) {
    arg = arg || {};
    if (arg.val && arg.val._id) {
      return true;
    }
    var name = (arg.val && (typeof arg.val.text !== 'undefined')) ? arg.val.text : arg.val;
    if (!this.rangeString(name, 1)) {
      return lbs.settings.messages.validate.service.NAME_EMPTY;
    }
    return true;
  };
  ServiceValidator.prototype.standardServicePrice = function (arg) {
    if (this.rangeString(new String(arg.val), 0, 0)) {
      //ok for the string to be empty
      return true;
    }
    if (!this.rangeNumber(arg.val)) {
      return lbs.settings.messages.validate.service.STANDARD_PRICE_NOT_NUMBER;
    }
    return true;
  };
  ServiceValidator.prototype.standardPricing = function (arg) {
    if (this.standardServicePrice(arg) !== true) {
      return lbs.settings.messages.validate.service.DISCOUNT_PRICE_NOT_NUMBER;
    }
    return true;
  };
  ServiceValidator.prototype.fields = {
    serviceName: ServiceValidator.prototype.serviceName,
    standardServicePrice: ServiceValidator.prototype.standardServicePrice,
    standardPricing: ServiceValidator.prototype.standardPricing
  };
  ServiceValidator.prototype.validate = function validate(arg) {
    arg = arg || {};
    var key, hasOwn = Object.prototype.hasOwnProperty,
      validates = [],
      i = -1,
      len, ret = [];
    var fields = arg.fields || this.fields;
    for (key in fields) {
      if (hasOwn.call(fields, key)) {
        validates.push(this[key]({
          val: arg.val[key]
        }));
      }
    }
    len = validates.length;
    while (++i < len) {
      if (validates[i] !== true) {
        ret.push(validates[i]);
      }
    }
    return (ret.length === 0) ? true : ret;
  };

  //@todo: currently not working, the validator should go on the input and this
  //  should find the closest form group parent
  //  then set the right classes when the value changes
  var CssValidator = function CssValidator(arg) {
    var path = this.
    Attribute('data-validate').split('.');
    this.entityName = path[0];
    this.valProp = path[0]; //@todo: simple check for service.something, could be service.servicePoints[nr].something
    this.entity = arg.entity;
    this.validator = BaseValidator.create();
    this.element = arg.element;
    var me = this; //@todo, assuming only a div with a textbox and a glypicon??
    jQuery(this.element).on('change', function (e) {
      me.change(e);
    });
  };
  CssValidator.prototype.change = function change(e) {

  };

  return BaseValidator;
}());




//center elements in their corresponding containers on the home page

function v_aligner() { //this function mainly take care of aligning DiVs on the center of the page


  var leftContainPositionLeft, leftContainPositionTop, rightContainPositionLeft,
    halfSeparationLine, rightContainPositionTop, otherLoginMethodsLeft,
    searchPositionRight, width, regBoxTop, regBoxLeft = 0;

  width = jQuery(window).width();

  if (width > 390) {

    if (width < 570) {
      rightContainPositionLeft = (jQuery('#home_right_container').width() - jQuery('#home_login_form').width()) / 2;
      otherLoginMethodsLeft = (jQuery('#home_right_container').width() - jQuery('#otherLoginMethods').width()) / 2 + 17;
      rightContainPositionTop = (jQuery('#home_right_container').height() - jQuery('#home_login_form').height()) / 2 - 20;


    } else {
      halfSeparationLine = jQuery('#home_separation_line') / 2;

      rightContainPositionLeft = (jQuery('#home_right_container').width() - jQuery('#home_login_form').width()) / 2 - 15;
      /*remove 20 px to push it up a litle*/
      rightContainPositionTop = (jQuery('#home_right_container').height() - jQuery('#home_login_form').height()) / 2 - 20;

      otherLoginMethodsLeft = (jQuery('#home_right_container').width() - jQuery('#otherLoginMethods').width()) / 2 - 15;

      searchPositionRight = (jQuery('#home_right_container').width() - jQuery('#home_login_form').width()) / 2 - 15;
      jQuery('#home_search').css({
        "position": "absolute",
        "top": 0,
        "left": searchPositionRight
      });
    }


    leftContainPositionLeft = (jQuery('#home_left_container').width() - jQuery('#home_left_contain').width()) / 2;
    leftContainPositionTop = (jQuery('#home_left_container').height() - jQuery('#home_left_contain').height()) / 2;

    regBoxTop = (jQuery('.notHomeMainContainer').height() - jQuery('#regBox').height()) / 2;
    regBoxLeft = (jQuery('.notHomeMainContainer').width() - jQuery('#regBox').width()) / 2;

    jQuery('#home_left_contain').css({
      "position": "absolute",
      "top": leftContainPositionTop,
      "left": leftContainPositionLeft
    });
    jQuery('#home_login_form').css({
      "position": "absolute",
      "top": rightContainPositionTop,
      "left": rightContainPositionLeft
    });
    jQuery('#otherLoginMethods').css({
      "position": "absolute",
      "bottom": "15px",
      "left": otherLoginMethodsLeft
    });

    jQuery('#regBox').css({
      "position": "absolute",
      "top": regBoxTop,
      "left": regBoxLeft
    });

  }

} /*end of v_aligner function definition*/




//run v_align on browser resize
jQuery(window).resize(function () {

  //v_aligner();

});

//end of center elements in their corresponding containers on the home page



//end of go to home
//show corresponding page when clicking on the submenu item on the side navigation

var updateWorkSpaceRightContainerOnClick = function (element_attr, script_source_url) {
  jQuery(element_attr).click(function (e) {
    if (script_source_url === "/home/master") {
      jQuery.bbq.pushState('#');
    } else if (script_source_url === "/workspace/welcome") {
      jQuery.bbq.pushState('#' + '/workspace/welcome');
    } else {
      jQuery.bbq.pushState('#' + script_source_url);
    }
    e.preventDefault();
  });
};

//bbq history script

// Be sure to bind to the "hashchange" event on document.ready, not
// before, or else it may fail in IE6/7. This limitation may be
// removed in a future revision.
var masterPageStatus = false;

jQuery(function () {



  // Override the default behavior of all `a` elements so that, when
  // clicked, their `href` value is pushed onto the history hash
  // instead of being navigated to directly.



  // Bind a callback that executes when document.location.hash changes.
  //  could improve routing, check lbs.routes where a module/controller would
  //  registration for a url
  jQuery(window).bind("hashchange", function (e) {
    var url = jQuery.param.fragment();

    // In jQuery 1.4, use e.getState( "url" );
    var regexpRouters = [
      {
        mod: 'lbs.workspace.smm.detail',
        location: '/workspace/services/main.js',
        uid: '/workspace/services/detail',
        regExp: /^\/workspace\/services\/(myservicepoints|myservices)\/(LZS|LZP).*$/
      }
      , {
        mod: 'lbs.workspace.inspection:folder',
        location: '/workspace/inspection/main.js',
        uid: '/workspace/inspection:folder',
        regExp: /^\/workspace\/inspection\/.*\/folder\/.*$/
      }

      ,{
            mod: 'lbs.workspace.corrections:folder',
            location: '/workspace/corrections/main.js',
            uid: '/workspace/corrections:folder',
            regExp: /^\/workspace\/corrections\/.*\/folder\/.*$/
       }

      ,{
         mod: 'lbs.home:search',
         location: '/home/detailPages/main.js',
         uid: '/home/detailPages/search',
         regExp: /^\/home\/detailPages\/search\/.*$/
       }

        //,{mod:'lbs.workspace:nomenu.publishing.activities',location:'/workspace/publishing/main.js'
      //  ,uid:'/workspace/publishing/activities',regExp:/\/details\/edit\/activity.*$/}
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/workspace/publishing/main.js',
        uid: '/workspace/publishing/activities',
        regExp: /\/workspace\/publishing\/activities.*$/
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/details/activities/main.js',
        uid: '/details/edit/activitydetail',
        regExp: /\/details\/activitydetail.*$/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/details/activities/main.js',
        uid: '/details/edit/activitydetail',
        regExp: /\/details\/.*\/activitydetail.*$/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/details/corporate/main.js',
        uid: '/details/corporate/corporatedetail',
        regExp: /\/details\/.*\/corporatedetail.*$/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/details/servicepoint/main.js',
        uid: '/details/servicepointdetail',
        regExp: /\/details\/.*\/servicepoint\/(\S+).*$/i
      }

      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/photoservice/main.js',
        uid: '/processes/photoservice/photoServices',
        regExp: /\/processes\/photoservice.*$/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/photoservice/main.js',
        uid: '/processes/photoservice/photoShooting',
        regExp: /\/processes\/photoservice\/photoShooting/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/photoservice/main.js',
        uid: '/processes/photoservice/photoPrinting',
        regExp: /\/processes\/photoservice\/photoPrinting/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/photoservice/main.js',
        uid: '/processes/photoservice/payment',
        regExp: /\/processes\/photoservice\/payment/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/photoservice/main.js',
        uid: '/processes/photoservice/done',
        regExp: /\/processes\/photoservice\/done/i
      }


      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/verifications/main.js',
        uid: '/processes/verifications/verificationServices',
        regExp: /\/processes\/verifications\/verificationServices/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/verifications/main.js',
        uid: '/processes/verifications/groupIDForm',
        regExp: /\/processes\/verifications\/groupIDForm/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/verifications/main.js',
        uid: '/processes/verifications/singleIDForm',
        regExp: /\/processes\/verifications\/singleIDForm/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/verifications/main.js',
        uid: '/processes/verifications/checkIDForm',
        regExp: /\/processes\/verifications\/checkIDForm/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/verifications/main.js',
        uid: '/processes/verifications/payment',
        regExp: /\/processes\/verifications\/(\S+).*\/payment/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/verifications/main.js',
        uid: '/processes/verifications/done',
        regExp: /\/processes\/verifications\/(\S+).*\/done/i
      }


      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/activities/main.js',
        uid: '/processes/activities/activities',
        regExp: /\/processes\/activities\/activities/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/activities/main.js',
        uid: '/processes/activities/application',
        regExp: /\/processes\/activities\/application/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/activities/main.js',
        uid: '/processes/activities/done',
        regExp: /\/processes\/activities\/done/i
      }
      , {
        mod: 'lbs.workspace:nomenu.publishing.activities',
        location: '/processes/activities/main.js',
        uid: '/processes/activities/payment',
        regExp: /\/processes\/activities\/payment/i
      }

    , {
        mod: 'lbs.workspace.profile',
        location: '/workspace/profile/main.js',
        uid: '/workspace/profile/personalprofile',
        regExp: /\/workspace\/profile\/personalprofile\/?/i
     }

    ];

    function isRegexRouted(url) {
      var i = regexpRouters.length;
      while (--i > -1) {
        if (regexpRouters[i].regExp.test(url)) {
          return regexpRouters[i];
        }
      }
      return false;
    }

    var routeMod = function (url) {
      //save when the url was requested (user clicked)
      var start = new Date().getTime();
      return lbs.modHelper.getMod(url).then(function (mod) {
        mod = lbs.util.getMember(window, lbs.routes[url].mod.split('.'));
        //there maybe other mods competing to render in this container, see if current is the latest
        if (mod && (mod.container)) {
          lbs.loadingMods[mod.container] = lbs.loadingMods[mod.container] || [];
          lbs.loadingMods[mod.container].push({
            start: start
          });
          lbs.loadingMods[mod.container].sort(lbs.util.sortMethod(false, 'start'));
          if (lbs.loadingMods[mod.container][0].start === start) {
            mod.render().then(function () {
              lbs.basemodule.pageComplete();
            });
          }
        }
      });
    };
    var oldMethod = function () {
      if (urlsplit.length > 3) {
        jQuery.getScript(url + '.js');
      } else if (url === '') {
        jQuery.getScript('/home/master.js');
      } else if (url === '/workspace/welcome') {

        jQuery.getScript('/workspace/welcome/master.js');
      } else if (url === '/home/userRegistration') {
        jQuery.getScript('/home/userRegistration.js');
      } else if (urlsplit[1] === 'publishing') {
        // $.getScript('/publishing/publishing.js')
      }
    };

    var route, mod;
    //empty route defaults to /home
    url = (url === '') ? '/home' : url;
    var urlsplit = url.split('/');
    if (lbs.routes[url]) {
      routeMod(url);
      return;
    } else if (isRegexRouted(url)) {
      route = isRegexRouted(url);
      mod = lbs.modules[route.uid] ||
        lbs.modHelper.getScriptFromUrl({
          url: route.location,
          location: route.uid
        });
      jQuery.when(mod)
        .then(function resolve(msg) {
          routeMod(route.uid);
        }, function reject() {
          oldMethod();
        });
      return;
    } else {
      lbs.modHelper.getScriptFromUrl({
        url: urlsplit.slice(0, urlsplit.length - 1).join('/') + '/main.js',
        location: url
      }).then(function resolve(msg) {
        routeMod(msg.location);
      }, function reject() {
        console.log('using old method for url:', url);
        oldMethod();
      });
      return;
    }
  });
  // Since the event is only triggered when the hash changes, we need
  // to trigger the event now, to handle the hash the page may have
  // loaded with.
  jQuery(window).trigger("hashchange");
}); // JavaScript Document




//end of bbq history script



//end of show corresponding page when clicking on the submenu item on the side navigation

//Slide the menu items/subitems up and down

function slideEffectsHandler(arg) {
  detailPageSlideHandler(arg);
  leftNavMenuItemSlideHandler();
}

function detailPageSlideHandler(arg) {

  //var secondLoad = arg ? arg.secondLoad : false;
  //
  //
  //if (!secondLoad) {
  //  jQuery('.detailPageSlideDownBoxes .detailPageUserIntroBox:not(:first)').find('.detailPageUserIntroBoxBody').slideUp('fast');
  //}

  jQuery(".detailPageUserIntroBoxHeader .detailPageDropDownIcon").click(function (e) {

    e.preventDefault();

    var $target = jQuery(this).closest('.detailPageUserIntroBoxHeader').next();


    //if (!$(this).parents().hasClass('personalHomeTables')) {
    //    $(this).parent().siblings().find('.detailPageUserIntroBoxBody').slideUp('fast');
    //}

    if ($target.is(":hidden")) {

      jQuery(this).removeClass('glyphicon-menu-down');
      jQuery(this).addClass('glyphicon-menu-up');

      $target.slideDown("fast");
    } else {

      jQuery(this).addClass('glyphicon-menu-down');
      jQuery(this).removeClass('glyphicon-menu-up');
      $target.slideUp('fast');
    }
  });


  jQuery('.editDetailPageBtn').click(function (e) {

    var $targetbtn = jQuery(this).prev().find('.detailPageUserIntroBoxHeader .detailPageDropDownIcon');
    var $targetContainer = jQuery(this).prev().find('.detailPageUserIntroBoxBody');

    if ($targetContainer.is(':hidden')) {
      $targetbtn.removeClass('glyphicon-menu-down');
      $targetbtn.addClass('glyphicon-menu-up');
      $targetContainer.slideDown("fast");
    }

  });

}

function leftNavMenuItemSlideHandler() {
  console.log('old slide handler');
  return;
  //
  //    jQuery(".service_name").click(function () {
  //
  //
  //        menuClickedID = jQuery(this).attr("id");
  //        //alert(menuClickedID);
  //        jQuery(".nav-menu").find('.detail_frame').css("display", "none");
  //        jQuery(".nav-menu").find('.nav_list_bg').css("background", "none");
  //        jQuery(".nav-menu").find('.service_name').css("border-bottom", "1px dashed #ebebeb");
  //        if (jQuery("#left_nav_mini").is(':hidden'))/*to avoid sliding on the small nav*/
  //        {
  //            if (jQuery(this).next().is(":hidden")) {
  //
  //                jQuery(this).next().slideDown("fast");
  //                jQuery(this).parent(this).css({
  //                    "background": "url(../commons/images/task_bg_03.jpg) no-repeat left top",
  //                    "background-color": "#FFFFFF"
  //                });
  //                jQuery(this).css("border-bottom", "none");
  //            } else {
  //
  //                jQuery(this).next().hide('fast');
  //                jQuery(this).parent(this).css("background", "none");
  //                jQuery(this).css("border-bottom", "1px dashed #ebebeb");
  //                // e.preventDefault();
  //            }
  //        }
  //
  //    });
  //    jQuery(".details").click(highLightSelectedSubmunuItem);
}


//hight selected submenu
var highLightSelectedSubmunuItem = function (e) {
  console.log('old highlight, do nothing');
  return;
  //
  //    jQuery(".nav-menu").find(".details a").css({"color": "#B5B5B5", "font-weight": "100"});
  //    jQuery(".nav-menu").find('.details img').css("visibility", "hidden");
  //    jQuery(this).find('img').css("visibility", "visible");
  //    jQuery(this).find("a").css({"color": "#136FD3", "font-weight": "bold"});
  //    jQuery(".navbar-toggle").trigger('click');
  //    e.preventDefault();
};


// end of Slide the menu items/subitems up and down


//handles effects on the table across all personal workspaces
function table_effects() {

  paddingEffecfts();
  /* swap backgroug for the table header on selection and sorting*/
  jQuery('.table .row:first-child .cell:nth-child(3)').addClass('swapBg');
  jQuery('.Swap').click(function () {

    if (jQuery(this).hasClass('swapBg') || jQuery(this).hasClass('swapBg2')) {
      jQuery(this).toggleClass('swapBg swapBg2');
    } else {
      jQuery(this).addClass('swapBg');
      jQuery(this).siblings().removeClass('swapBg');
      jQuery(this).siblings().removeClass('swapBg2');
    }


  });







  jQuery('.lan_table_more').off('tap');

  jQuery('.lan_table_more').on('tap', function (e) {
    e.preventDefault();

    jQuery(this).find('ul').css('display', 'block');

    jQuery(document).on('tap', function (e) {
      var container = jQuery(".lan_table_more");

      if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
      {
        container.find('ul').css('display', 'none');
      }
    });

  });
}


// end of handles effects on the table across all personal workspaces	


function paddingEffecfts() {

    jQuery("#pagging button:nth-child(2)>a").addClass('activeClick');
    /*hover effect for table pagging*/

    jQuery("#pagging button a").hover(
      function (e) {

        /*$(this).css({"color":"white","background":"gray"});*/
        jQuery(this).addClass('activeHover');
        e.preventDefault();
      },
      function (e) {

        jQuery(this).removeClass('activeHover');
        e.preventDefault();
      }
    );
    jQuery("#pagging button a").click(function (e) {

      jQuery(this).addClass('activeClick');
      /*just adding class isn't working , so i apply effect using css and use addClass for the if on hover*/
      jQuery(this).parent().siblings().find('a').removeClass('activeClick');
      e.preventDefault();
    });
  }
  //end of pagging effects


//  handles the width of the right container of the personal work space
//as well as hidding and/or showing the large or small navigation bar on when you click on the 
//hide me button or when the size of the screen is less than 960px 


function sidebar() {

  var right_container_width, right_container_width_for_mini = 0;
  var width = jQuery(window).width();
  //left nav display
  jQuery(".clickMe").click(function () {

    if (width > 768) {
      right_container_width = (jQuery(".wrapper").width() - jQuery("#left_nav").width()) + 25;
      jQuery(".leftNavigations #left_nav_mini").css("display", "none");
      jQuery(".leftNavigations #left_nav").css("display", "block");
      jQuery(".leftNavigations #left_nav").find('.nav_list_bg').css("display", "block");
      jQuery('#right_container').css({
        "width": right_container_width,
        "": ""
      });
    }

    jQuery('#right_container').addClass('menu-expand');
  });
  //left nav mini display
  jQuery(".clickMeHide").click(function () {
    right_container_width_for_mini = (jQuery(".wrapper").width() - jQuery("#left_nav_mini").width()) + 25;
    jQuery(".leftNavigations #left_nav_mini").css("display", "block");
    jQuery(".leftNavigations #left_nav").css("display", "none");
    jQuery('.leftNavigations .nav_list_bg').css({
      "display": "none",
      "": ""
    });
    jQuery('#right_container').css({
      "width": right_container_width_for_mini,
      "": ""
    });
    showSideFrame();
    jQuery('#right_container').removeClass('menu-expand');
  });
  sidebarSwaper();
  //ajust width on window resize
  jQuery(window).resize(function () {

    sidebarSwaper();
  });
  // profile hide and show
  jQuery("#Profile_arrow_up").click(function () {


    jQuery("#profile").css("display", "none");
    jQuery(this).css("display", "none");
    jQuery("#Profile_arrow_down").css("display", "block");
  });
  jQuery("#Profile_arrow_down").click(function () {
    jQuery("#profile").css("display", "block");
    jQuery(this).css("display", "none");
    jQuery("#Profile_arrow_up").css("display", "block");
  });
}


//display side frame on the small navigation
function showSideFrame() {
  jQuery(".service_icon").hover(function () {

      jQuery(this).find(".leftNavigations .nav_list_bg").css("display", "block");
      jQuery(this).find(".leftNavigations .nav_list_bg").find('.detail_frame').css("display", "block");
      /*	$(this).find(".nav_list_bg").addClass('miniHoverBg');*/

      //hide frames when one is selected
      jQuery(this).siblings().find(".leftNavigations .nav_list_bg").css("display", "none");
    },
    function () {

      jQuery(this).find(".leftNavigations .nav_list_bg").css("display", "none");
    });
}


function sidebarSwaper() {


  var width = jQuery(window).width();
  showSideFrame();
  if (width >= 991) {
    jQuery(".leftNavigations #left_nav").css("display", "block");
    jQuery(".leftNavigations #left_nav_mini").css("display", "none");
  }
  if (width < 991) {


    if (jQuery(".leftNavigations #left_nav_mini").is(':hidden')) {

      jQuery(".leftNavigations #left_nav_mini").css("display", "block");
      jQuery('.leftNavigations .nav_list_bg').css({
        "display": "none",
        "": ""
      });
      jQuery(".leftNavigations #left_nav").css("display", "none");
      jQuery('.leftNavigations .nav_list_bg').hover(function (e) {
        jQuery(this).css({
          "display": "block",
          "position": "absolute",
          "left": jQuery("#left_nav_mini").width(),
          "top": "0"
        });
      });
    }

    if (width < 760) {
      jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery("#left_nav_mini").width() + 25);
    } else if (width < 560) {
      jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery("#left_nav_mini").width() + 20);
    } else {
      jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery("#left_nav_mini").width() + 20);
    }


  } else {
    if (jQuery("#left_nav").is(':hidden')) {

      jQuery("#left_nav").css("display", "block");
      jQuery('.nav_list_bg').css({
        "display": "block",
        "": ""
      });
      jQuery("#left_nav_mini").css("display", "none");
    }
    jQuery('#right_container').width(jQuery(".wrapper").width() - jQuery("#left_nav").width() + 25);
  }


}


//end of  handles the width of the right container of the personla work space 
//as well as hidding and/or showing the large or small navigation bar on when you click on the 
//hide me button or when the size of the screen is less than 960px 


//highlight the corresponding part on the operation procedure indication bar: enter user name, password reset email, reset password form and reset complete

var ShiftOperationIndicatorBar = function (element) {
  jQuery(element).addClass("forgotPwProcedureIndicator");
  jQuery(element).siblings().removeClass("forgotPwProcedureIndicator");
};


//highlight the corresponding part on the operation procedure indication bar: enter user name, password reset email, reset password form and reset complete


//galery slider


var idphotoGalerySlider = function () {

  jQuery('.right').addClass('idphotoGaleryClickRight');

  jQuery('#idphotoGaleryContainNext').addClass('displayNone');

  jQuery('.idPhotoGalery .left').click(function (e) {
    if (jQuery('#idphotoGaleryContain').is(':hidden')) {


      jQuery('#idphotoGaleryContainNext').css('display', 'none');
      jQuery('#idphotoGaleryContain').css('display', 'block');
      jQuery('.right').addClass('idphotoGaleryClickRight');
      jQuery('.left').removeClass('idphotoGaleryClickLeft');
    }

  });

  jQuery('.idPhotoGalery .right').click(function (e) {


    if (jQuery('#idphotoGaleryContainNext').is(':hidden')) {


      jQuery('#idphotoGaleryContainNext').css('display', 'block');


      jQuery('#idphotoGaleryContain').css('display', 'none');

      jQuery('.left').addClass('idphotoGaleryClickLeft');

      jQuery('.right').removeClass('idphotoGaleryClickRight');

    }

  });

};

// end of galery slider
//counter
var countDown = function (callback) {

  var cnt;
    clearInterval(cnt);
  var doCountUpdate = function () {
    jQuery('em.countDown').each(function () {
      var count = parseInt(jQuery(this).html(), 10);
      if (count !== 1) {
        jQuery(this).html(count - 1);

      } else {
        if (callback && (typeof callback === 'function')){
          callback();
          clearInterval(cnt);
        }
      }
    });
  };
  // Schedule the update to happen once every second
  cnt = setInterval(doCountUpdate, 1000);
};

var enxtendedCountDown = function (start,container,callback) {

    var counter;

    var count = start||3;

    clearInterval(counter);

    var target =  container||'';

    var enxtendedDoCountUpdate = function () {
         var countElem = jQuery(target+ ' em.countDown');

            if (count !== 0) {
                countElem.html(count);

                count = count-1;

            } else {
                if (callback && (typeof callback === 'function')){
                    callback();
                    clearInterval(counter);
                }
            }
    };
    // Schedule the update to happen once every second
    counter = setInterval(enxtendedDoCountUpdate, 1000);
};

//indicates  how stong a password is, when typing it on the form	
var passWordStrengh = function passWordStrengh() {
  console.log('checking pw strengh-----');



  jQuery("ul.strength").css("display", "none");
  jQuery("#password, #modalRegUserPassWord").keyup(function () {
    var i;
    jQuery("ul.strength").css("display", "block");

    var input = jQuery(this).val();
    var res = strongCheck(input);
    if (res <= 0) {
      jQuery('#pwStrengthComment').html("密码太短了!");
      jQuery("ul.strength li").css("background-color", "#ddd");
    } else if (res == 1) {
      jQuery('#pwStrengthComment').html("弱!");
      jQuery("ul.strength li").css("background-color", "#ddd");
      jQuery("ul.strength li").css("background-color", "#F22");
    } else if (res == 2) {
      jQuery('#pwStrengthComment').html("中!");
      jQuery("ul.strength li").css("background-color", "#ddd");
      for (i = 1; i <= res; i++) {
        jQuery("ul.strength li." + i).css("background-color", "#FF6922");
      }
    } else if (res == 3) {
      jQuery('#pwStrengthComment').html("强!");
      jQuery("ul.strength li").css("background-color", "#ddd");
      for (i = 1; i <= res; i++) {
        jQuery("ul.strength li." + i).css("background-color", "#FFE422");
      }
    } else if (res == 4) {
      jQuery("ul.strength li").css("background-color", "#ddd");
      jQuery('#pwStrengthComment').html("强!");
      for (i = 1; i <= res; i++) {
        jQuery("ul.strength li." + i).css("background-color", "#A7E623");
      }
    }


  });
}

var clearErrorMessage = function clearErrorMessage(e){

    $( "#lanzhengCodeForResponse" ).keydown(function() {
        $('#errorMessageHolder').text('')
    });

}
// end of indicates  how stong a password is, when typing it on the form

// end of email validation		

function strongCheck(password) {

  var strength = 0;
  //if the password length is less than 6, return message.
  if (password.length < 6) {
    return 0;
  } else {
    strength += 1;
    //if password contains both lower and uppercase characters, increase strength value
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      strength += 1;
    }

    //if it has numbers and characters, increase strength value
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
      strength += 1;
    }

    //if it has one special character, increase strength value
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
      strength += 1
    };

    //if it has two special characters, increase strength value
    if (password.match(/(.*[!,%,&,@,#,$,\^,*,?,_,~].*[!,%,&,@,#,$,\^,*,?,_,~])/)) {
      strength += 1;
    }
    return strength;
  }

}
var checkPasswordMatch = function checkPasswordMatch() {

    console.log('password match');
  var password = jQuery("#password").val();
  var confirmPassword = jQuery("#conformPassword").val();
  if (password !== confirmPassword) {
    jQuery("#conformPassword").next().css({
      "background": "url(../../commons/images/wrong_state.png)  left center no-repeat",
      "padding-left": "18px"
    }).html(" 密码不一致!");
  } else {
    jQuery("#conformPassword").next().css("background", "url(../../commons/images/right_state.png)  left center no-repeat").html(" ");
  }





   var modalpassword = jQuery("#modalRegUserPassWord").val();
   var modalconfirmPassword = jQuery("#modalRegUserConfirmPassWord").val();



   if (modalpassword !== modalconfirmPassword) {
        jQuery("#pwMatchingComment").css({
            "background": "url(../../commons/images/wrong_state.png)  left   center no-repeat",
            "padding-left": "18px"
        }).html(" 密码不一致!");
   } else {
        jQuery("#pwMatchingComment").before().css("background", "url(../../commons/images/right_state.png)  left  center no-repeat").html("密码一致 ");
   }


};

function checkEmptyPassword() {
  var password = jQuery("#password").val();
  if (password !== confirmPassword) {
    jQuery("#conformPassword").next().html(" 密码不一致!");
  } else {
    jQuery("#conformPassword").next().html(" match!");
  }
}

//Funtions that that are used across many pages
//loggin captcha function
function makeRandomString() {
  var i;
  var chars = "ABCDEFGHIJKLMNPQRSTUVWXTZ";
  /* var string_length = Math.floor((Math.random() * 5) + 1);*/
  var randomstring = '';
  /* for (var i = 0; i < string_length; i++)*/
  for (i = 0; i < 4; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

function randomString() {
  //var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  randomstring = makeRandomString();
  jQuery("#antiBotValue").val(randomstring);
  jQuery('.home_check').html(randomstring);
}

 $.fn.serializeObject = function() //rolland added this on march 18.2015
 {
     var o = {};
     var a = this.serializeArray();
     $.each(a, function() {
         if (o[this.name]) {
             if (!o[this.name].push) {
                 o[this.name] = [o[this.name]];
             }
             o[this.name].push(this.value || '');
         } else {
             o[this.name] = this.value || '';
         }
     });
     return o;
 };

//todo funcition to get to request param
function getParameterByName(name,url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
       // results = regex.exec(location.search);

        results = regex.exec(url);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

randomString();
window.onload = randomString;
//end of loggin captcha function

//jScroll init;

//$(function()
//{
//    $('.scroll-pane').jScrollPane();
//});


//todo: prevent click of disabled lan_button, this should go to the base module


 var preventDisabledClick = function(){

       $('.blueButton, .grayButton').each(function(){

                if($(this).find('span.disabled')){

                    $(this).off().on('click', function() {

                        console.log('disabled button clicked');
                        return;

                    });
                }
       });

    }

/*
 根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
 地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
 出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
 顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
 校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。

 出生日期计算方法。
 15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
 2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
 下面是正则表达式:
 出生日期1800-2099  (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])
 身份证正则表达式 /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i
 15位校验规则 6位地址编码+6位出生日期+3位顺序号
 18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位

 校验位规则     公式:∑(ai×Wi)(mod 11)……………………………………(1)
 公式(1)中：
 i----表示号码字符从由至左包括校验码在内的位置序号；
 ai----表示第i位置上的号码字符值；
 Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。
 i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
 Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1

 */
//身份证号合法性验证
//支持15位和18位身份证号
//支持地址编码、出生日期、校验位验证

//function IdentityCodeValid(code) {
//    var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
//    var tip = "";
//    var pass= true;
//
//    if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
//        tip = "身份证号格式错误";
//        pass = false;
//    }
//
//    else if(!city[code.substr(0,2)]){
//        tip = "地址编码错误";
//        pass = false;
//    }
//    else{
//        //18位身份证需要验证最后一位校验位
//        if(code.length == 18){
//            code = code.split('');
//            //∑(ai×Wi)(mod 11)
//            //加权因子
//            var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
//            //校验位
//            var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
//            var sum = 0;
//            var ai = 0;
//            var wi = 0;
//            for (var i = 0; i < 17; i++)
//            {
//                ai = code[i];
//                wi = factor[i];
//                sum += ai * wi;
//            }
//            var last = parity[sum % 11];
//            if(parity[sum % 11] != code[17]){
//                tip = "校验位错误";
//                pass =false;
//            }
//        }
//    }
//    return {valid:pass,err:tip};
//}
//var c = '130981199312253466';
//var res= IdentityCodeValid(c);




function IdentityCodeValid(num) {

    var factorArr = new Array(7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1);
    var error;
    var varArray = new Array();
    var intValue;
    var lngProduct = 0;
    var intCheckDigit;
    var intStrLen = num.length;
    var idNumber = num;
    // initialize
    if ((intStrLen != 15) && (intStrLen != 18)) {
        //error = "输入身份证号码长度不对！";
        //alert(error);
        //frmAddUser.txtIDCard.focus();
        return false;
    }
    // check and set value
    for(i=0;i<intStrLen;i++) {
        varArray[i] = idNumber.charAt(i);
        if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
            //error = "错误的身份证号码！.";
            //alert(error);
            //frmAddUser.txtIDCard.focus();
            return false;
        } else if (i < 17) {
            varArray[i] = varArray[i]*factorArr[i];
        }
    }
    if (intStrLen == 18) {
        //check date
        var date8 = idNumber.substring(6,14);
        if (checkDate(date8) == false) {
            //error = "身份证中日期信息不正确！.";
            //alert(error);
            return false;
        }
        // calculate the sum of the products
        for(i=0;i<17;i++) {
            lngProduct = lngProduct + varArray[i];
        }
        // calculate the check digit
        intCheckDigit = 12 - lngProduct % 11;
        switch (intCheckDigit) {
            case 10:
                intCheckDigit = 'X';
                break;
            case 11:
                intCheckDigit = 0;
                break;
            case 12:
                intCheckDigit = 1;
                break;
        }
        // check last digit
        if (varArray[17].toUpperCase() != intCheckDigit) {
            //error = "身份证效验位错误!...正确为： " + intCheckDigit + ".";
            //alert(error);
            return false;
        }
    }
    else{        //length is 15
        //check date
        var date6 = idNumber.substring(6,12);
        if (checkDate(date6) == false) {
            //alert("身份证日期信息有误！.");
            return false;
        }
    }
    //alert ("Correct.");
    return true;
}

function checkDate(date)
{
    return true;
}

function validateMobile(str) {
    var
        re = /^1\d{10}$/
    if (re.test(str)) {
       return true;
    } else {
        return false;
    }
}

/*notes

 do not user document ready on a script that is load after the page has alrady been loaded.
 otherwise the script will keep waiting for the document to load and will never run because the document will not load again.


 */





