/**
 * /home/activities client module
 * written by Harm and Rolland
 */

console.log('precesses is loaded...');
lbs.routes['/basemodule'] = {
  mod: 'lbs.basemodule',
  location: '/basemodule.js'
};
lbs.routes['/details:nomenu'] = {
  mod: 'lbs.details:nomenu',
  location: '/details/main.js'
};
lbs.routes['/processes/activities'] = {
  mod: 'lbs.processes.activities',
  location: '/home/activities/main.js'
};
lbs.routes['/processes/activities/activities'] = {
  mod: 'lbs.processes.activities.activities',
  location: '/processes/activities/main.js'
};
lbs.routes['/processes/activities/activitieslist'] = {
  mod: 'lbs.processes.activities.list',
  location: '/processes/activities/main.js'
};

lbs.routes['/processes/activities/application'] = {
  mod: 'lbs.processes.activities.application',
  location: '/processes/activities/main.js'
};
lbs.routes['/processes/activities/payment'] = {
  mod: 'lbs.processes.activities.payment',
  location: '/processes/activities/main.js'
};
lbs.routes['/processes/activities/payment'] = {
  mod: 'lbs.processes.activities.payment',
  location: '/processes/activities/main.js'
};

lbs.routes['/processes/activities/done'] = {
  mod: 'lbs.processes.activities.done',
  location: '/processes/activities/main.js'
};

lbs.routes['/processes/activities/responses:details'] = {mod: 'lbs.processes.activities.responses:details', location: '/processes/activities/main.js'};

lbs.routes['/home/registration/user'] = {mod: 'lbs.home:registration', location: '/home/registration/main.js'};








lbs.modules['/processes/activities'] = { //add routes and activities specific stuff here
  endPoints: {},
  create: function () {

    this.parent = lbs['details:nomenu'];

    this.routeParams = {

      '/processes/activities/activities':{
        listEndPoint:'/home/act.json'
      }
    }

    lbs.processes = {}
    lbs.processes.activities = this;
    delete this.deps;
    delete this.create;
  },
  basePath: '/details',
  deps: ['/details:nomenu'],
  render: function render(arg) {
    return this.parent.render(arg);
  }
};

lbs.modules['/processes/activities/activities'] = {
  container: '#main_container',
  endPoints: {},
  handlers: {},
  currentView: null,
  parent: null,
 // endPoint:'/workspace/activities/activitieslist.json'  todo:this endpoint not being used?
  endPoint: null,
  mainView: "/processes/activities/activities.html",
  currentPage: '事务详情',
  root: '事务管理',
  otherHandlers: false,
  index: 0,
  boundValueHolder: [],
  totalRecords: null,
  pageSize: 8,
  selectedPhoto: null,
  currentEndpoint: null,
  templateHelpers: {},
  create: function () {
    var me = this;
    this.parent = lbs.processes.activities;

    this.handlers['processes:activities:findbycode'] = function(e){

        me.getActivityCodeModal(e);
    }

    this.handlers['processes:seach:by:code'] = function(e){

      me.findActivityByActivityCode(e);
    }

    lbs.processes.activities.activities = this;
    delete this.deps;
    delete this.create;
  },
  render: function render(arg) {
    var me = this;
    return me.parent.render(arg)
      .then(function () {
        return jQuery.when(
          lbs.modHelper.getView(me.mainView), lbs.modHelper.getMod('/processes/activities/activitieslist')
        );
      })
      .then(function (view, listMod) {
        lbs.modHelper.setContainer({
          container: me.container,
          html: Mustache.render(view)
        });
        return listMod.render({
          container: '.processes_activitieslist'
        });
      })
      .then(function (view, listMod) {
        jQuery('#main_container').addClass('notHomeMainContainer ');
        jQuery('#wrapperSelector').addClass('no_menu_public');
        lbs.actionHandler({
          container: me.container,
          handlers: me.handlers
        });
      });
  },

  getActivityCodeModal:function getActivityCodeModal(e){

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


          $('#platformAPIsModal').modal( ).off('hide.bs.modal.enterCode');

        })
  },

  findActivityByActivityCode:function findActivityByActivityCode(e){

    var me = this;

      console.log("FOFOFO");
    var code = jQuery('#lanzhengCodeForResponse').val();

    console.log('code------',code);

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

  },
  remove: function remove(arg) {
    this.postalMod.remove(arg);
  },
  deps: ['/processes/activities']

};

lbs.modules['/processes/activities/activitieslist'] = {
  view: '',
  pageSize: 10,
  index: 0,
  list: [],
  endPoint: null,
  render: function render(arg) {
    var me = this;
    this.endPoint = lbs.modules['/processes/activities'].routeParams['/processes/activities/activities'].listEndPoint;


    arg.listView = arg.viewUrl || "/processes/activities/activitieslist.html";
    arg.listEndPoint = this.endPoint; //@todo: this should be defined in basemod endpoints
    return lbs.basemodule['general:list'].render.call(this, arg)
  },
  rerender: function rerender(arg) {
    var me = this;
    arg = arg || {};
    arg.shorterStart = lbs.util.shorter('abd.asd', 0, 10);
    arg.shorterEnd = lbs.util.shorter('abd.acd', 0, 10);

    return lbs.basemodule["general:list"].rerender.call(this, arg)
      .then(function () {
        lbs.actionHandler({
          container: me.containerToSet,
          handlers: me.handlers
        });
      });
  },
  create: function () {
    var me = this;
    lbs.processes.activities.list = this;


    this.handlers['take:user:to:response'] = function(e){

      console.log('checking click---');

      var code = e.target.getAttribute('data-code');



      var arr = lbs.processes.activities.list.list;
      var index = lbs.util.find({arr:arr,key:'_id',val:code});

      if(index>-1){

        var activity = arr[index];
        console.log('activity---',activity);

        var arg = {activity:activity};

        lbs.util.canRespond(arg)
            .then(function(status){

              if(status){

                $.bbq.pushState('#/processes/activities/application/'+activity.abd.ac);
              }

            })
      }



    }
    delete this.deps;
    delete this.create;
  },
  handlers: {},
  deps: ['/processes/activities/activities']
};



lbs.modules['/processes/activities/application'] = {
  container: '#main_container',
  handlers: {},
  boundValues: [],
  parent: null,
  mainView: "/processes/activities/application.html",
  mainViewVal:null,
  dbResponse: null,
  dbActivity: null,
  totalRecords: null,
  pageSize: 8,
  serviceLists: [],
  bookedServices: [],
  userResponse: {},
  templateHelpers: {},
  create: function () {
    var me = this;

    this.handlers['response:go:to:list'] = lbs.globalHandlers.bbqUpdate;


    this.handlers.clearInputVal = this.clearInput;

    this.handlers['general:toggle:show:on:checked'] = function(e){
      me.generalToggoleShowOnChecked(e);

    };

    this.handlers['corporate:validation:upload:document'] = function(e){
      me.uploadDocument(e);

    };
    me.handlers['activity:response:select:service'] = function (e) {
      me.selectService(e);
    };

    this.parent = lbs.processes.activities;
    lbs.processes.activities.application = this;
    me.handlers['response:submit']=function(e){
        me.responseClick(e);
    };

    delete this.deps;
    delete this.create;
  },
  render: function render(arg) {
    var me = this;

    var code = jQuery.param.fragment().split('/').pop();

    console.log('code---',code);

    if (code.toLowerCase().indexOf('lzb') === 0) {

      return this.createResponse(code);
    }

    lbs.modHelper.getView(me.mainView)
        .then(function(view){
          me.mainViewVal = view;

          lbs.modHelper.setContainer({
            container: me.container,
            html: Mustache.render(view)
          });
        })

    var lMod, me = this; //resolve handler needs a reference to this
    return jQuery.when(
        lbs.modHelper.getMod('/global:modal'), this.parent.render()
    ).then(function (loadMod){
          jQuery(me.container).css('visibility', 'hidden');
          lMod = loadMod;
          return loadMod.render({
            container: '#platformAPIsModal',
            persist: true
          });
        })
        .then(function () {
          var code = jQuery.param.fragment().split('/').pop();
          return lbs.modHelper.getMessage('/home/response.json', false, {}, 'GET', {
            code: code
          }); //@todo: url should be from basemod.endPoints
        })
        .then(function (msg) {
          me.dbResponse = msg.pl;
          me.dbActivity = me.dbResponse.dp.ac;
          return lbs.modHelper.getMessage('/home/services.json', false, {}, 'POST', {
            json: JSON.stringify({
              query: me.dbActivity.sqc
            })
          }); //@todo: url should be from basemod.endPoints
        })
        .then(function (msg) {
          me.serviceLists = msg.pl.results;

          me.servicesResult =   msg.pl;

          return lbs.modHelper.getView(me.dbActivity.fm.fd.uri);
        })
        .then(function (form) {

          var view = me.mainViewVal;
          var data = {};
          var increment = lbs.modHelper.index();
          var sortedServices = [];
          data.services = me.serviceLists;
          //PARANOID ENSURE SERVICE ORDER
            for(var i = 0; i < data.services.length; i ++)
            {
                var first = data.services[i][0];
                if(!first) continue;

                //Find sn in activity sqc
                var sn = first.serviceName._id;
                var sq = undefined;
                for(var s = 0; s < me.dbActivity.sqc.length; s++){
                    if(me.dbActivity.sqc[s].sn == sn){
                        sq = me.dbActivity.sqc[s].sq || s; break;
                    }
                }
                if(sq !== undefined)
                {
                    data.services[i].sq = sq;
                }
            }
            data.services = data.services.sort(function(a,b){return a.sq - b.sq});
          //END PARANOID ENSURE SERVICE ORDER
          data.i  =  function(i) {
                  return function(){
                      return ++i;
                  }
          }(-1);

          console.log('services------',data.services);

          data.increment = function () {
            data.increment.index = increment();
          };
          data.rc = me.dbResponse?me.dbResponse.rc:null;
          var formFields = me.dbResponse&&me.dbResponse.fd&&me.dbResponse.fd.fields?me.dbResponse.fd.fields:null;
          data.acInfo = me.dbActivity.abd;
          data.hsf = me.dbActivity.hsf;
          data.responseComplete = me.dbResponse.rs >= 30;  //todo return true or false
          jQuery(me.container).css('visibility', 'visible');
            data.convertpay = function(){
                return function(val,render){
                    var val = render(val);
                    if(!val) return ""
                    for(var i = 0; i < lbs.settings.messages.standardPayment.length; i++)
                    {
                        var tgt = lbs.settings.messages.standardPayment[i];
                        if(parseInt(tgt.val) == parseInt(val)){
                            return tgt.text;
                        }
                    }
                    return render(val)
                }
            },
          lMod.hide();
          lbs.modHelper.setContainer({
            container: me.container,
            html: Mustache.render(view, data)
          });


            me.getCustomServicePrices();//this is to get the prices for the marathon form

            var singlePay = lbs.processes.activities.application.singlePayPrice;// this is only for the custom form marathon pay. the value is set in the jquery number plugin
            var couplePay = lbs.processes.activities.application.couplePayPrice;// this is only for the custom form marathon pay. the value is set in the jquery number plugin

            console.log('singlePay couplePay',singlePay,couplePay);

          lbs.modHelper.setContainer({
            container: '.lanDynamicForm',
            html: Mustache.render(form,{formFields:formFields,validationFileUrl:lbs.util.validationFileUrl,validationFileName:lbs.util.validationFileName,singlePay:singlePay,couplePay:couplePay})
          });

          //lbs.util.preventOpenningEmptyLinks('.lanDynamicForm');

          if (!(me.dbResponse&&me.dbResponse.fd && me.dbResponse.fd.fields)) { //see if response has user data
            me.userResponse = {fields:{}}; //no data, use default values in form meta of activity
            me.setUserFieldsFromActivity();
            me.putChanges( //save default values
                {
                  "fields": me.userResponse.fields
                }, "fields", {
                  fd: {
                    "fields": me.userResponse.fields
                  }
                }, ['fd', 'fields']
            );



          } else {
            me.userResponse = me.dbResponse.fd; //set form values to what user specified
          }
          if(me.dbResponse&&me.dbResponse.fd && me.dbResponse.fd.pt){
            me.userResponse.pt = me.dbResponse.fd.pt;
          }
          me.setSelectedServices();
          me.boundValues = lbs.binder.bind('.lanDynamicForm', me.userResponse, 'entity', [
            function (obj, key, root, path,element) {

              me.putChanges(obj, key, root, path,element);
            }
          ]);
          lbs.binder.updateUI(me.boundValues);
          jQuery('#main_container').addClass('notHomeMainContainer ');
          jQuery('#wrapperSelector').addClass('no_menu_public');
          lbs.actionHandler({
            container: me.container,
            handlers: me.handlers
          });


          $('.lanDynamicForm').find('div').each(function(){

              var formtoolelem = $(this).find('.formToolElement');



            if (formtoolelem.length == 1){
              if(formtoolelem[0].type  !== 'textarea'){
                $(this).css({'max-width':'300px'});
              }
            }
          });


            $(".hideFromResponseForm").addClass('hide');

            return data;
        })
        .then(function(data){


            console.log('services---',data.services);


                if(data.services) {

                    var servicesBuffer = {};

                    var promiseArray = [];
                    var promiseChain = $().promise();
                    $('.responseFormFillingPageTable').find('input[type="radio"].availableService').each(function (){

                        var serviceName = this.getAttribute('name');
                        var firstItem = null;
                        if (!servicesBuffer[serviceName]) {


                            servicesBuffer[serviceName] = serviceName;

                            var serviceIndex = $(this).closest('.detailPageUserIntroBox').find("[data-service]")[0].getAttribute('data-service');
                            var priceListid = this.getAttribute('data-id');
                            var serviceCode = this.getAttribute('data-serviceCode');


                            var index = lbs.util.findDeep({arr:me.dbResponse.sb,key:'serviceCode',val:serviceCode});



                            if(index<0){

                                this.checked = true;

                                promiseChain =  promiseChain.then(function () {

                                    return me.selectService(this, {serviceIndex: serviceIndex, priceListid: priceListid});

                                });

                            }

                        }
                    });



                    promiseChain.then(function(){

                        return $.when.apply($);

                    });

                }


          $('.lanDynamicForm ').find("[data-toggle-checked-main]").each(function(){  //expand divs that where previously expanded by the user via the generalToggoleShowOnChecked function

              if(this.checked === true){
                me.generalToggoleShowOnChecked(this,true);
              }
          });


            })
        .then(function(){


       lbs.modHelper.getMod('/global:select:postal')
        .then(function(pmod){

             console.log('got postal code module-----',pmod);

             me.dbResponse.fd.fields =  me.dbResponse.fd.fields||{};
             me.dbResponse.fd.fields.postalCode = me.dbResponse.fd.fields.postalCode||'';

             return pmod.render({
            boundTo:me.dbResponse.fd.fields
            ,key:'postalCode'
            ,container:'.pysicalAddressBox'
            ,view:"/commons/customViews/customSelectPostal.html"
          })
        });
        })
        .then(function(){
          var timeOuID = setTimeout(function(){
            lbs.modules['/basemodule'].pageComplete();
            me.initPriceForMarathonSpecialActivity();
            window.clearTimeout(timeOuID)},500);
        });
  },
  remove: function remove(arg) {
    this.postalMod.remove(arg);
  },
  putChanges: function putChanges(obj, key, root, path, element,ignoreValidate) {
        var me = this;


        return  $.when(!ignoreValidate?lbs.util.validateRequiredFormFieds(null, element):true).then(function (valid) {




                if (valid) {
                    var o = {},
                        i = -1,
                        len = path.length - 1,
                        current = o;
                    var tmp;
                    if (key === 'pp') {
                        tmp = {fd: {pt: {}}};
                        tmp._id = me.dbResponse._id;
                        console.log('obj----', obj);
                        if (obj.pp && obj.pp.pl) {
                            tmp.fd.pt[path[1]] = {
                                pp: {
                                    uri: obj.pp.pl.uri,
                                    urll: obj.pp.pl.urll,
                                    urlm: obj.pp.pl.urlm,
                                    urls: obj.pp.pl.urls
                                }
                            };
                            return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
                                json: JSON.stringify({
                                    pl: {
                                        response: tmp
                                    }
                                })
                            }).then(function (response) {
                                if (response && response.pl) {
                                    lbs.util.validateForm(element, 'success');
                                }
                                else {
                                    lbs.util.validateForm(element, 'fail');
                                }
                            });
                        }
                        tmp.fd.pt[path[1]] = {pp: {uri: obj.pp.photourl}};
                        return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
                            json: JSON.stringify({
                                pl: {
                                    response: tmp
                                }
                            })
                        })
                            .then(function (response) {
                                if (response && response.pl) {
                                    lbs.util.validateForm(element, 'success');
                                }
                                else {
                                    lbs.util.validateForm(element, 'fail');
                                }
                            });
                    }
                    if (root === me.userResponse) {
                        o = {
                            pl: {
                                response: {
                                    fd: {
                                        fields: {}
                                    },
                                    _id: me.dbResponse._id
                                }
                            }
                        };
                        o.pl.response.fd.fields[key] = obj[key];
                        console.log("PUSHING KEY\n",JSON.stringify(o))
                        return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
                            json: JSON.stringify(o)
                        })
                            .then(function (response) {
                                if (response && response.pl) {
                                    lbs.util.validateForm(element, 'success');
                                }
                                else {
                                    lbs.util.validateForm(element, 'fail');
                                }
                            });
                    }
                    while (++i < len) {
                        o[path[i]] = {};
                        current = o[path[i]];
                    }
                    current[path[i]] = obj[key];
                    o._id = me.dbResponse._id;
                    console.log("PUSHING OBJ\n",JSON.stringify({pl: {response: o}}))
                    return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {json: JSON.stringify({pl: {response: o}})})
                        .then(function (response) {

                            if (response && response.pl) {
                                lbs.util.validateForm(element, 'success');
                            }
                            else {
                                lbs.util.validateForm(element, 'fail');
                            }
                        });
                }
            });
    },
  responseClick: function responseClick(e) {

        lbs.util.validateRequiredFormFieds('.lanDynamicForm')
            .then(function (valid) {
              console.log(' valid----', valid);
              if (valid) {
                $('#holdSpinnerContainer').addClass('spinnerContainerAbsolute');
                console.log('response  valid-----', lbs.user);
                return jQuery.when(
                    (lbs.user) ? {pl: lbs.user} : lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo, false, {})
                ).then(function perhapsAssociateResponse(user) {

                      console.log('lbs.user-----', user);
                      console.log("TO ASSOCIATE?", user);
                      if (user.pl) {

                        $('#holdSpinnerContainer').addClass('spinnerContainerAbsolute');

                        return jQuery.when(
                            (lbs.user) ? {pl: lbs.user} : lbs.modHelper.getMessage(lbs.basemodule.endPoints.userInfo, false, {})
                        ).then(function perhapsAssociateResponse(user) {
                              console.log("TO ASSOCIATE?", user);
                              if (user.pl) {

                                return lbs.modHelper.getMessage('/home/associateResponse/' + lbs.modules['/processes/activities/application'].dbResponse.rc + '.json', false, {}, 'POST', {});
                              }
                              return;
                            })
                            .then(function () {
                              if (lbs.modules['/processes/activities/application'].dbResponse.acn == "LZB104" ||
                                    lbs.modules['/processes/activities/application'].dbResponse.acn == "LZB109")
                                return lbs.modHelper.getMessage('/workspace/finance/setServicePointPriceInResponse.json', false, {}, 'POST', {
                                  rc: lbs.modules['/processes/activities/application'].dbResponse.rc,
                                  idx: 0
                                })
                              else return false;
                            })
                            .then(function (res) {
                              console.log("continue on", (lbs.modules['/processes/activities/application'].dbResponse.acn == "LZB104" ? res : ""));
                              var code = jQuery.param.fragment().split('/').pop();
                              lbs.hasEnoughInternalCredit = true;


                              if (lbs.browsers.weixin) {

                                var siteUrl = window.location.origin+"/#/processes/activities/payment/" + code;

                                window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5a85d57385f32302&redirect_uri=' + encodeURIComponent(siteUrl) + '&response_type=code&scope=snsapi_base&state=77#wechat_redirect';

                              }
                              else {


                                window.location = "/#/processes/activities/payment/" + code;
                              }

                            });

                      }
                    })

                var timerIdForSlowProcessing = setTimeout(function(){ //remove spinner and refresh page after 10 seconds.


                  $('#holdSpinnerContainer').removeClass('spinnerContainerAbsolute');

                  var currentUrl = window.location.href;

                  window.location = currentUrl;

                  window.clearTimeout(timerIdForSlowProcessing);



                },10000);

              }
         });
   },
  selectService: function selectService(e,arg) {


      if(arg){

          var serviceIndex = arg.serviceIndex;
          var priceListid = arg.priceListid;



      }
      else{

          if (!e.target.checked) {
              return;
          }

          var serviceIndex = $(e.target).closest('.detailPageUserIntroBox').find("[data-service]")[0].getAttribute('data-service');

          var priceListid = e.target.getAttribute('data-id');

      }



      console.log('serviceIndex-----',serviceIndex);

      console.log("Selecting service",e,"(sidx:",serviceIndex,")");
    var index = lbs.util.find({
      arr: this.serviceLists[serviceIndex],
      key: "_id",
      val: priceListid
    });

    var priceList = this.serviceLists[serviceIndex][index];
    var objToSend;
      console.log("PRICE LIST IS",priceList);
    this.bookedServices[serviceIndex] = {
      plid: priceList._id,
      svid: priceList.service._id,
      svn: priceList.serviceName.text,
      snid: priceList.serviceName._id,
      svp: priceList.servicePrices,
      sdp: priceList.discountedPrice,
      spn: priceList.servicePoint.servicePointName,
      spid: priceList.servicePoint._id,
      spc: priceList.servicePoint.ct.oID,
      serviceCode : priceList.service.serviceCode,
      sq : serviceIndex,
      spm : priceList.paymentMethod[0]
    };
    objToSend = {
      sb: this.bookedServices[serviceIndex]
    };
    console.log("PUTTING CHANGES",objToSend);
    return this.putChanges(objToSend, 'sb', objToSend, ['sb'],null,true);

  },
  createResponse: function (activityCode) {
    var me = this,
      lMod;
    return jQuery.when(
        lbs.modHelper.getMod('/global:modal'), this.parent.render()
      )
      .then(function (loadMod) {
        jQuery(me.container).css('visibility', 'hidden');
        lMod = loadMod;
        loadMod.render({
          container: '#platformAPIsModal',
          persist: true
        });
            var code = jQuery.param.fragment().split('/').pop();
        return lbs.modHelper.getMessage(
          '/home/response.json' //@todo: maybe put this url in lbs.basemodule endpoints or lbs.settigns
          , false, {}, 'POST', {
            json: JSON.stringify({
              pl: {
                response: {},
                activityCode:code
              }
            })
          }
        );
      })
      .then(function (response) {
        me.dbResponse = response.pl;
            console.log("created response");
        lMod.hide();
        //window.location.replace(window.location.origin + window.location.pathname + '#/processes/activities/application/' + me.dbResponse.rc);
          $.bbq.pushState('#/processes/activities/application/' + me.dbResponse.rc);
      });
  },
  setSelectedServices: function setSelectedServices() {
    var i = this.dbResponse.sb.length;
    while (--i > -1) {
      jQuery("input[data-id|='" + this.dbResponse.sb[i].plid + "'][type|='radio']").prop('checked', true);
    }
  },
  setUserFieldsFromActivity: function setUserFieldsFromActivity() {
    var me = this;
    var fields = [];

    if(me.dbActivity && me.dbActivity.fm && me.dbActivity.fm.fd && me.dbActivity.fm.fd.fields){
      fields = me.dbActivity.fm.fd.fields;
    }
    var i = fields.length;
    var htmlInputs, container = jQuery('.lanDynamicForm');
    while (--i > -1) {
      htmlInputs = container.find("[data-bind='entity.fields." + fields[i].nm + "']");
      if (htmlInputs.length) {
        if ((htmlInputs.prop('type') && (htmlInputs.prop('type').toLowerCase() === 'checkbox')) || htmlInputs.prop('multiple')) {
          me.userResponse.fields[fields[i].nm] = me.userResponse.fields[fields[i].nm] || [];
          if (fields[i].dv !== undefined) {
            me.userResponse.fields[fields[i].nm].push(fields[i].dv);
          }
        } else if (fields[i].dv !== undefined) {
          me.userResponse.fields[fields[i].nm] = fields[i].dv;
        }
      }
    }

  },
  uploadDocument: function uploadDocument(e){

    var me = this;

    var input = $(e.target),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),
        ext = label.split('.').pop();
    ext = ext.toLowerCase();

    var targetValueHolder = e.target.getAttribute('data-doc');
    var labelHolder  = null;
    var targetForm  = null;

    if(targetValueHolder){

      targetForm = targetForm = $('#'+targetValueHolder+'Form');

      targetValueHolder = jQuery('input#'+targetValueHolder);

      //console.log('targetValueHolder ---', targetValueHolder);

     // console.log('target form---', targetForm);

      labelHolder = input.closest('.form-group').find('.outterUploadedFileName');
    }

    if ($(e.target)[0]&&$(e.target)[0].files) {
      var reader = new FileReader();

      reader.onload = function (e){
              labelHolder.addClass('lan_relative');
              labelHolder.append('<span class="spinnerContainerAbsoluteSmall"></span>');

      }
      reader.readAsDataURL($(e.target)[0].files[0]);



      targetForm.ajaxSubmit({
        type:'POST',
        url:'workspace/responses/document/upload.json',
        dataType: 'json',
        success:function(data){


          var returnUrl = data.pl.uri;

          //todo the best way would be to save the uri and the name separeately rather than dividing then by a '#'
          targetValueHolder.val(returnUrl+'#'+label);
          console.log('new value---', targetValueHolder.val());
          //me.objToMutate[me.toMutate] = data;
          targetValueHolder.change();
          labelHolder.html(label);

          labelHolder.closest('a').attr('href',returnUrl);

          //targetForm.resetForm();
        },
        error:function(err){
          labelHolder.text('');
          alert('上传失败了，请重试!');
          console.log('error------', err);
          //targetForm.resetForm();
        }
      });
    }



  },
  getCustomServicePrices: function getCustomServicePrices(){

      var arrayGroup = lbs.processes.activities.application.serviceLists;
      console.log('arrayGroup===',arrayGroup);
      var index = null;

      var i  = 0;
      for(var i = 0; i < arrayGroup.length; i++)
      {


          var innerArray = arrayGroup[i];

          console.log('innerArray===',innerArray);

          index = lbs.util.findDeep({arr:innerArray, key:'service.serviceCode',val:'LZS109'});


          if(index>-1){
            var targetArray = arrayGroup[i];
            lbs.processes.activities.application.singlePayPrice = targetArray[1].discountedPrice;
            lbs.processes.activities.application.couplePayPrice = targetArray[2].discountedPrice;

              break;
          }

      }



  },
  initPriceForMarathonSpecialActivity:function initPriceForMarathonSpecialActivity(){

//todo this is not the best solution, all this coded should have handled in the response click function(before going to payment

    var singleInitPayTemp = parseInt($('#singlePaymentInput').val());
    var coupleInitPayTemp = parseInt($('#couplePaymentInput').val());


    var singleInitFlag = false;
    var coupleInitFlag = false;

      if(singleInitPayTemp===0||isNaN(singleInitPayTemp)){
        console.log('single not set',singleInitPayTemp);
        singleInitFlag = true;
        $('#singlePaymentInput').val(0);
        $('#singlePaymentInput').change();
      }



    var coupleInitTimer = setTimeout(function(){

      if(coupleInitPayTemp===0||isNaN(coupleInitPayTemp)){
        console.log('couple not set',coupleInitPayTemp);
        coupleInitFlag = true;
        $('#couplePaymentInput').val(0);
        $('#couplePaymentInput').change();
      }

      window.clearTimeout(coupleInitTimer);

    },150);



    var totalInputTimer = setTimeout(function(){

      if(singleInitFlag&&coupleInitFlag){
        console.log('total not set');
        $('#totalPaymentFee').find('input').val(0);
        $('#totalPaymentFee').find('input').change();
      }
      window.clearTimeout(totalInputTimer);

    },300);



  },

  generalToggoleShowOnChecked: function generalToggoleShowOnChecked(e,scriptCall){

    var element = null;

    if(scriptCall){
      element = e;
    }
    else{
      element = e.target;
    }

    if(element.type === 'radio'){
     // console.log('ration button');

      var getMain = element.getAttribute('data-toggle-checked-main');
      var getTargetElement = $(element.getAttribute('data-toggle-checked-target'));


        if(getMain === 'true'){

          if(getTargetElement.hasClass('hide')){
             getTargetElement.removeClass('hide');

          }


          getTargetElement.find("[data-verification]").each(function(){
            this.setAttribute('data-verification','true');
          });

        }
      else if(getMain === 'false'){


          getTargetElement.find("[data-verification]").each(function(){

            this.setAttribute('data-verification','false');

          });

          if(!getTargetElement.hasClass('hide')){
         var timeOutId =   setTimeout(function(){getTargetElement.addClass('hide');  window.clearTimeout(timeOutId);},200);
 }
        }


    }

  },

deps: ['/processes/activities']
};

lbs.modules['/processes/activities/payment'] = {
  container: '#main_container',
  handlers: {},
  mainView: "/processes/activities/payment.html",
  boundValues: [],
  weixinCode:null,
  weixinPaymentReturnUrl:null,
  jsonResponse:{sp:{},ow:{}},
  parent: null,


  create: function () {

    var me = this;
      if(lbs.user && lbs.user.mobile && me.jsonResponse.ow)
        me.jsonResponse.ow.sc = lbs.user.mobile;
    me.handlers['response:payment:pay']=function(e){
      me.paymentClick(e);
    };

    this.parent = lbs.processes.activities;
    lbs.processes.activities.payment = this;

    me.handlers['response:payment:ali-pay']=function(e){
      me.alipayConfirmClick();
    }
    me.handlers['response:payment:ali-cancel']=function(e){
      me.alipayCancelClick();
    }

    delete this.deps;
    delete this.create;
  },
  render: function render(arg) {
    arg = arg || {};
    var lMod, me = this; //resolve handler needs a reference to this

    console.log('rendering payment------');

    return jQuery.when(
        lbs.modHelper.getMod('/global:modal'), this.parent.render()
       ).then(function (loadMod) {
          jQuery(me.container).css('visibility', 'hidden');
          lMod = loadMod;
          return loadMod.render({
            container: '#platformAPIsModal',
            persist: true
          });
        })
        .then(function () {



          var urlarray = window.location.href.split('?');

          var   urlsearch  = '?'+urlarray[1];

          var weixinCode = getParameterByName('code',urlsearch);



          if(weixinCode&&lbs.browsers.weixin){

            me.weixinCode = weixinCode;
          }


             var code = jQuery.param.fragment().split('/').pop();


              code = code.split('?')[0];  //todo add this in case the url is being redirected from wechat with the user code as query parameter;

          return jQuery.when(
              lbs.modHelper.getMessage('/home/response.json', false, {}, 'GET', {
                code: code
              }) //@todo: url should be from basemod.endPoints
              , lbs.modHelper.getView(me.mainView)
              , lbs.modHelper.getView('/processes/activities/paymentservicelist.html')
              , me.parent.render(arg)
          );
        })
        .then(function (msg, view, serviceListView) {
          me.dbResponse = msg.pl;
          me.dbActivity = me.dbResponse.dp.ac;
          if(me.dbResponse.sp){
            me.jsonResponse.sp=me.dbResponse.sp;
            me.jsonResponse.needInvoice=true;
          }
          if(me.dbResponse.ow&&me.dbResponse.ow.sc){
            me.jsonResponse.ow=me.dbResponse.ow;
          }
          var i = me.dbResponse.sb.length,
              total = 0;
          while (--i > -1) {
            total += me.dbResponse.sb[i].spm == 1 ? me.dbResponse.sb[i].sdp : 0;
          }

          var data = {
            data: me.dbResponse,
            user:lbs.user,
            services:me.dbActivity.sqc.length,
            total: total,
            weixin:lbs.browsers.weixin,
            showAlipay : total && me.dbActivity.abd.apm != '预付款统一结算' && me.dbActivity.abd.apm != '后付款统一结算',//me.dbActivity.apm == '响应用户付款',
            hasEnoughInternalMoney : lbs.hasEnoughInternalCredit
          };

            var isMobile = parseInt(data.user.mobile) && data.user.mobile.length == 11;
            if(!isMobile) {
                console.log("isn't a mobile")
                data.user.mobile = undefined;
                data.data.ow.sc = undefined;
                me.dbResponse.ow.sc = undefined;
                me.jsonResponse.ow.sc = undefined;
            }
            if(me.dbActivity.abd.apm == '预付款统一结算' || me.dbActivity.abd.apm == '后付款统一结算')//prepaid or postpaid
            {
                console.log("Not paid by me");
                data.notPaidByMe = true;
            }
            data.data.sb = data.data.sb ? data.data.sb.map(function(val,idx){
                if(val.spm == 2)
                    val.offline = true;
                else
                    val.offline = false;
                if(val.serviceCode == "LZS109")
                {
                    console.log("Marathon extra info is",me.dbResponse.fd);
                    val.marathon = true;
                    val.singlePayment = me.dbResponse.fd.fields.singlePayment;
                    val.couplePayment = me.dbResponse.fd.fields.couplePayment;
                }
                return val;
            }) : data.data.sb

          lbs.modHelper.setContainer({
            container: me.container,
            html: Mustache.render(view, data),
            mod: me
          });
          me.boundValues=lbs.binder.bind(me.container,me.jsonResponse,'payment',[
            function(){
              me.hideShow();
            },
            function (obj, key, root, path,element) {

              me.putChanges(obj, key, root, path,element);
            }
          ]);
          me.hideShow();
          lbs.binder.updateUI(me.boundValues);
          lbs.modHelper.setContainer({
            container: '.payment_service_list',
            html: Mustache.render(serviceListView, data),
            mod: {}
          });

          jQuery('#main_container').addClass('notHomeMainContainer ');
          jQuery('#wrapperSelector').addClass('no_menu_public');

          lbs.actionHandler({
            container: me.container,
            handlers: me.handlers
          });

          $("#confirmPaymentPhoneNumber").keyup(function(){
            lbs.util.checkMobileMatch('#paymentPhoneNumber','#confirmPaymentPhoneNumber','.matchingStatusContainer');
          });
          $("#paymentPhoneNumber").keyup(function(){
                if($('#confirmPaymentPhoneNumber').val()){
                  lbs.util.checkMobileMatch('#paymentPhoneNumber','#confirmPaymentPhoneNumber','.matchingStatusContainer');
                }
          });


          jQuery('#paymentStatusModal').on('hidden.bs.modal', function () {
            jQuery.bbq.pushState('#/processes/activities/done');
          });
          jQuery(me.container).css('visibility', 'visible');
          lMod.hide();
        })
  },
  paymentClick:function paymentClick(e){
      e.preventDefault();


    var loadMod = false,
        me = this,
        procResp = null;

    lbs.util.validateRequiredFormFieds('.payment_form')
        .then(function(valid) {
          console.log('valid----', valid);


          if (valid) {

            if( lbs.util.checkMobileMatch('#paymentPhoneNumber','#confirmPaymentPhoneNumber','.matchingStatusContainer'))
                        {

                          if($('.termsAndConditions').prop('checked')){
                            $('#holdSpinnerContainer').addClass('spinnerContainerAbsolute');

                            if(!me.dbActivity.sqc.length){
                              return me.goToDone();
                            }

                              var currentUrl = window.location.href;

                            return   lbs.modHelper.getMessage(
                                "/workspace/finance/responsepayment.json"
                                , false, {},'POST',{json:
                                    JSON.stringify(
                                        {"pl":
                                        {
                                          code:me.dbResponse.rc,
                                          phone:me.jsonResponse.ow && me.jsonResponse.ow.sc,
                                          weixinCode:me.weixinCode,
                                          url:currentUrl
                                        }
                                      }
                                    )
                                })
                                .then(function(res){

                                  //me.goToDone();

                                  console.log('res----',res);
                                  procResp = res;


                                  //todo: is this sufficient check? // handle non alipay or non weixin
                                  if(!procResp || !procResp.pl || !(procResp.pl.url || procResp.pl.returnurl))
                                  {
                                     me.goToDone(procResp);
                                  }

                                  //handles alipay
                                  else if (procResp && procResp.pl && procResp.pl.url){


                                      window.location=procResp.pl.url;
                                      me.alipaymentInfo = procResp;
                                  }

                                  //handle weixin
                                  else if (procResp && procResp.pl && procResp.pl.paypackage && procResp.pl.returnurl) {

                                      var weixinPaymentOptions = procResp.pl.paypackage;

                                      var weinConfigObj = procResp.pl.wxconfig;

                                   //   alert('weiconfigObj---'+JSON.stringify(weinConfigObj));

                                      me.weixinPaymentReturnUrl = procResp.pl.returnurl;

                                      me.handDleWeChatPay(weixinPaymentOptions,weinConfigObj);

                                  }
                                  //else {
                                  //  //window.open(procResp.pl.url);
                                  //
                                  //  window.location=procResp.pl.url;
                                  //  me.alipaymentInfo = procResp;
                                  //  //    loadMod.hide();
                                  //  //    lbs.modHelper.getView('/processes/activities/paymentConfirm.html')
                                  //  //        .then(function(view){
                                  //  //            lbs.modHelper.setContainer({
                                  //  //                container:'#platformAPIsModal'
                                  //  //                ,html:Mustache.render(view)
                                  //  //            });
                                  //  //
                                  //  //            $('#platformAPIsModal').modal();
                                  //  //            lbs.actionHandler({container:'#platformAPIsModal',
                                  //  //                handlers:me.handlers
                                  //  //            })
                                  //  //
                                  //  //        })
                                  //}
                                },function(err){


                                  if(lbs.browsers.weixin){//wechat pay handler code

                                    alert('error-----'+JSON.stringify(err));

                                  }
                                    //  me.goToDone();
                                })


                          }
                          else{


                            $('.termsAndConditionsNotSelected').removeClass('hide');

                          }


                        }


          }

        });
  },

  handDleWeChatPay:function handDleWeChatPay(weixinPaymentOptions, weinConfigObj){

    var me = this;


      wx.config({
          debug: false,
          appId: weinConfigObj.pl.appId,
          timestamp: weinConfigObj.pl.timestamp,
          nonceStr: weinConfigObj.pl.nonceStr,
          signature: weinConfigObj.pl.signature,
          jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });





      wx.error(function(res) {

          $.scojs_message(res.errMsg, $.scojs_message.TYPE_ERROR);

      });



      wx.ready(function () {

          wx.chooseWXPay({
              timestamp: weixinPaymentOptions.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
              nonceStr: weixinPaymentOptions.nonceStr, // 支付签名随机串，不长于 32 位
              package:weixinPaymentOptions.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
              signType: weixinPaymentOptions.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
              paySign: weixinPaymentOptions.paySign, // 支付签名
              success: function (res) {

                  window.location = me.weixinPaymentReturnUrl;

                  // 支付成功后的回调函数
              }
          });


      });


  },
  alipayConfirmClick: function(){
        var me = this;
        var alitransact = ""
        lbs.modHelper.getMessage("/workspace/finance/confirmAlipay.json",false,{},
            "POST",{
                pl:{
                    transactionId:alitransact,
                    info : me.alipaymentInfo
                }
            })
            .then(function(post){
                me.goToDone();
                $('#platformAPIsModal').modal('hide');
            }  ,  function(post){
                alert("Verification failed: Please confirm your payment has completed before continuing.");
            })
    },
  alipayCancelClick: function(){
        console.log("CANCEL!");
    },
  goToDone: function (procResp){
        var me = this;
        return jQuery.when()
        .then(function(){
            return lbs.modHelper.getMod('/processes/activities/done');
        })
        .then(function(doneMod){
            var phone = me.jsonResponse.ow && me.jsonResponse.ow.sc;
            var activityName = me.jsonResponse.can;
            var customExitMsg;

            if(procResp && procResp.pl)
            {
                var myr = procResp.pl;
                phone = myr.ow && myr.ow.sc;
                activityName = myr.can ? myr.can : activityName;
                console.log("PROC RESP IS ",procResp);
                customExitMsg = myr.acn == "LZB101" || myr.acn == "LZB102" ? myr.fd.fields.heyanjieguo : undefined;
            }

            return doneMod.render({phone:phone,anonymous:!lbs.user,customExitMsg:customExitMsg,acname:activityName,fromGetDone:true});
        });
    },
  putChanges: function putChanges(obj, key, root, path,element) {


    var me = this;


    //console.log('element-----',element);
   // console.log('element.type-----',element.type);


    if(element&&element.type === 'checkbox'){

      if($(element).hasClass('termsAndConditions')){
        $('.termsAndConditionsNotSelected').addClass('hide');
      }

    }

    lbs.util.validateRequiredFormFieds(null,element)
        .then(function(valid){

          if(valid) {




            var o = {},
                i = -1,
                len = path.length - 1,
                current = o;
            if (root === me.userResponse) {
              o = {
                pl: {
                  response: {
                    fd: {
                      fields: {}
                    },
                    _id: me.dbResponse._id
                  }
                }
              };
              o.pl.response.fd.fields[key] = obj[key];
              return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
                json: JSON.stringify(o)
              });
            }
            while (++i < len) {
              o[path[i]] = {};
              current = o[path[i]];
            }
            current[path[i]] = obj[key];
            o._id = me.dbResponse._id;
            console.log('putting',o);
            return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
              json: JSON.stringify({
                pl: {
                  response: o
                }
              })
            })
                .then(function(response){


                  if(response&&response.pl){


                    //lbs.util.validateForm(element, 'success');


                  }
                  else{

                    lbs.util.validateForm(element, 'fail');

                  }


                });



          }
        });


  },
  hideShow:function hideShow(){
    var hsfn = (this.jsonResponse.needInvoice)?'show':'hide';
    jQuery('#response_payment_invoice_data')[hsfn]();
    hsfn = (this.jsonResponse.sp.ic==='send')?'show':'hide';
    jQuery('.response_payment_invoice_sending_info')[hsfn]();
    hsfn = (this.jsonResponse.sp.provider==='ali')?'show':'hide';
    jQuery('#response_next_alipay')[hsfn]();
    hsfn = (this.jsonResponse.sp.provider==='ali')?'hide':'show';
    jQuery('#response_next_lz')[hsfn]();
  },
  remove: function remove(arg) {
    lbs.binder.unbind(this.boundValues);
  },
  deps: ['/processes/activities']
};

lbs.modules['/processes/activities/done'] = {
  container: '#main_container',
  endPoints: {},
  handlers: {},
  boundValues: [],
  currentView: null,
  parent: null,
  endPoint: '/workspace/activities/activitieslist.json',
  mainView: "/processes/activities/done.html",
  currentPage: '事务详情',
  root: '事务管理',
  otherHandlers: false,
  index: 0,
  boundValueHolder: [],
  totalRecords: null,
  pageSize: 8,
  currentEndpoint: null,
  templateHelpers: {},
    registerSubmit:function(e){
        e.preventDefault();

      $('#holdSpinnerContainer').addClass('spinnerContainerAbsolute');
        lbs.modHelper.getMod('/home/registration/user')
        .then(function(mod){
              var responseCode = $.param.fragment().split("/").pop()
            mod.submitUserRegistration(e,'/home/registrationandassociate/'+responseCode+'.json');
        });
    },
  create: function () {
    var me = this;
    this.handlers['response:go:to:list'] = lbs.globalHandlers.bbqUpdate;
      this.handlers['activities:register:submit'] = function(e){
          me.registerSubmit(e);
      }
    this.parent = lbs.processes.activities;

    lbs.processes.activities.done = this;
    delete this.deps;
    delete this.create;
  },

  render: function render(arg) {
    var me = this; //resolve handler needs a reference to this
    return jQuery.when(
        lbs.modHelper.getView(me.mainView), me.parent.render(arg)
      )
      .then(function getStuff(view){
        if(arg && arg.fromGetDone)
        {
            console.log("FROM GET DONE:",JSON.stringify(arg));
            return view;
        }

        var code = jQuery.param.fragment().split('/').pop();
        return lbs.modHelper.getMessage('home/response.json',false,{},'GET',{code:code})
            .then(function(res){
                if(arg === undefined) arg = {};
                if(res && res.pl) {
                    arg.phone = res.pl.ow && res.pl.ow.sc;
                    arg.acname = res.pl.can;
                    arg.customExitMsg = res.pl.acn == "LZB101" || res.pl.acn == "LZB102" ? res.pl.fd.fields.heyanjieguo : undefined;
                }
                return view;
            })
      })
      .then(function (view) {
        lbs.modHelper.setContainer({
          container: me.container,
          html: Mustache.render(view,arg)
        });

        jQuery('#main_container').addClass('notHomeMainContainer ');
        jQuery('#wrapperSelector').addClass('no_menu_public');
        lbs.actionHandler({
          container: me.container,
          handlers: me.handlers
        });
      });
  },
  remove: function remove(arg) {
    this.postalMod.remove(arg);
  },
  deps: ['/processes/activities']
};

lbs.modules['/processes/activities/responses:details'] = {
  container: '#platformAPIsModal'
  , handlers: {}
  , boundValues: []
  , parent: null
  , mainView:'/processes/activities/responseDetails.html'
  , dbResponse:null
  , dbActivity:null
  , totalRecords: null
  , pageSize: 8
  , serviceLists:[]
  , bookedServices:[]
  , userResponse:{}
  , validLandId:true
  , templateHelpers: {}
  ,putChanges: function putChanges(obj, key, root, path,element) {
    var o = {},
        i = -1,
        len = path.length - 1,
        current = o,
        me = this;
    var tmp;
    if(key==='pp'){
      tmp = {fd:{pt:{}}};
      tmp._id=this.dbResponse._id;
      if(obj.pp && obj.pp.pl){
        tmp.fd.pt[path[1]]={pp:{uri:'/photos/'+obj.pp.pl.uuid+'.'+obj.pp.pl.pfm.toLowerCase()}};
        return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
          json: JSON.stringify({
            pl: {
              response: tmp
            }
          })
        });
      }
      tmp.fd.pt[path[1]]={pp:{uri:obj.pp.photourl}};
      return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
        json: JSON.stringify({
          pl: {
            response: tmp
          }
        })
      });
    }
    if (root === this.userResponse) {
      o = {
        pl: {
          response: {
            fd: {
              fields: {}
            },
            _id: this.dbResponse._id
          },
          code : me.code
        }
      };
      o.pl.response.fd.fields[key] = obj[key];
      return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
        json: JSON.stringify(o)
      });
    }
    while (++i < len) {
      o[path[i]] = {};
      current = o[path[i]];
    }
    current[path[i]] = obj[key];
    o._id = this.dbResponse._id;
    return lbs.modHelper.getMessage('/home/response.json', false, {}, 'PUT', {
      json: JSON.stringify({
        pl: {
          response: o,
          code : me.code
        }
      })
    })
        .then(function(response){


          if(response&&response.pl){


            lbs.util.validateForm(element, 'success');


          }
          else{

            lbs.util.validateForm(element, 'fail');

          }


        });
  }
  ,create: function () {
    var me = this;
    this.handlers['response:list:details:edit'] = function(e){
      me.editResponseDetails(e);
    }
    this.handlers['response:list:details:edit:done'] = function(e){
      me.editResponseDetailsDone(e);
    };
    lbs.processes.activities['responses:details'] = this;
    delete this.deps;
    delete this.create;
  }
  ,editResponseDetails: function editResponseDetails(e){
    var me = this;
    jQuery('.lanDynamicForm').find('input').prop('disabled','');
    jQuery('.lanDynamicForm').find('select').prop('disabled','');
    jQuery('.editFormInfo').addClass('hide');
    jQuery('.editFormInfoDone').removeClass('hide');
  }
  ,editResponseDetailsDone: function editResponseDetailsDone(e){
    var me = this;
    jQuery('.lanDynamicForm').find('input').prop('disabled','true');
    jQuery('.lanDynamicForm').find('select').prop('disabled','true');
    jQuery('.editFormInfo').removeClass('hide');
    jQuery('.editFormInfoDone').addClass('hide');
  }
  ,setUserFieldsFromActivity: function setUserFieldsFromActivity() {
    var me = this;
    var fields = (me.dbActivity && me.dbActivity.fm && me.dbActivity.fm.fd && me.dbActivity.fm.fd.fields) || [];
    var i = fields.length;
    var htmlInputs, container = jQuery('.lanDynamicForm');
    while (--i > -1) {
      htmlInputs = container.find("[data-bind='entity.fields." + fields[i].nm + "']");
      if (htmlInputs.length) {
        if ((htmlInputs.prop('type') && (htmlInputs.prop('type').toLowerCase() === 'checkbox')) || htmlInputs.prop('multiple')) {
          me.userResponse.fields[fields[i].nm] = me.userResponse.fields[fields[i].nm] || [];
          if (fields[i].dv !== undefined) {
            me.userResponse.fields[fields[i].nm].push(fields[i].dv);
          }
        } else if (fields[i].dv !== undefined) {
          me.userResponse.fields[fields[i].nm] = fields[i].dv;
        }
      }
    }

  }
  ,render: function render(arg) {
    var code = arg.code
        , me = this;//resolve handler needs a reference to this
        me.code = code;
    return jQuery.when(
        lbs.modHelper.getMessage('/home/response.json', false, {}, 'GET', {code: code})//@todo: url should be from basemod.endPoints
    ).then(function (msg) {

          console.log('msg----',msg);

          $('#spinning_icon_sm').addClass('hide');

          if(msg&&msg.pl){
            me.dbResponse = msg.pl;
            me.dbActivity = me.dbResponse.dp.ac;
            console.log('activities from response---',me.dbActivity);
            return jQuery.when(
                lbs.modHelper.getView(me.mainView),
                lbs.modHelper.getView(me.dbActivity.fm.fd.uri)
            );
          }
          else{


           // $('#platformAPIsModal').modal('hide');
            //alert('该事务响应不存在，请重试!');

            $('.errorMessageHolder').text('该事务响应不存在，请重试!');
            me.validLandId = false;

          }

        })
        .then(function (view,form){


          if(me.validLandId){


            var data = {},
                formContainer='.lanDynamicForm';
            data = me.dbResponse;//@todo: set values from me.dbResponse and me.dbActivity you need
            lbs.modHelper.setContainer({
              container: me.container
              , html: Mustache.render(
                  view
                  ,{data:data,activity:me.dbActivity,date:lbs.util.renderDate,status:me.renderStatus}
              )
            });
            lbs.modHelper.setContainer({
              container: formContainer
              , html: Mustache.render(form)
            });



            jQuery(me.container).modal('show');
            if (!(me.dbResponse&&me.dbResponse.fd && me.dbResponse.fd.fields)) { //see if response has user data
              me.userResponse = {fields:{}}; //no data, use default values in form meta of activity
              me.setUserFieldsFromActivity();
              me.putChanges( //save default values
                  {
                    "fields": me.userResponse.fields
                  }, "fields", {
                    fd: {
                      "fields": me.userResponse.fields
                    }
                  }, ['fd', 'fields']
              );
            } else {
              me.userResponse = me.dbResponse.fd; //set form values to what user specified
            }
            if(me.dbResponse.fd && me.dbResponse.fd.pt){
              me.userResponse.pt = me.dbResponse.fd.pt;
            }
            me.boundValues = lbs.binder.bind('.lanDynamicForm', me.userResponse, 'entity', [
              function (obj, key, root, path,element) {

                me.putChanges(obj, key, root, path,element);
              }
            ]);
            lbs.binder.updateUI(me.boundValues);
            lbs.actionHandler({
              container: me.container
              ,handlers: me.handlers
            });



          }


        }).then(function(){
          jQuery('.lanDynamicForm').find('input').prop('disabled','true');
          jQuery('.lanDynamicForm').find('select').prop('disabled','true');
        });
  }

  ,renderStatus: function(){

    return function(text, render) {

      var index;
      index = lbs.util.find({
        arr:lbs.settings.messages[lbs.settings.lang].responseStatus
        ,key:'val'
        ,val:render(text)
      });

      console.log('index from mustache-----',index);

      if(index!=-1)
      {
        return lbs.settings.messages[lbs.settings.lang].responseStatus[index].text;
      }

    }

  }
  ,remove: function remove(arg) {
  }
  ,deps: ['/processes/activities']
};