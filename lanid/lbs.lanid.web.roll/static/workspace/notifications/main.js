/**
 * notifications client module
 * 
 * written by and Harm Meijer: harmmeiier@gmail.com
 */
console.log('notifications is loaded...');
//registration routers/modules of smm if not already registered
lbs.routes['/workspace'] = lbs.routes['/workspace'] || {mod: 'lbs.workspace', location: '/workspace/main.js'};
lbs.routes['/workspace/notifications'] =
        lbs.routes['/workspace/notifications/all'] =
        lbs.routes['/workspace/notifications/unread'] =
        lbs.routes['/workspace/notifications/sent'] =
        {mod: 'lbs.workspace.notifications', location: '/workspace/notifications/main.js'};
lbs.routes['/workspace/notifications:list'] = {mod: 'lbs.workspace.notifications.list', location: '/workspace/notifications/main.js'};

lbs.modules['/workspace/notifications'] =
        lbs.modules['/workspace/notifications/all'] =
        lbs.modules['/workspace/notifications/unread'] =
        lbs.modules['/workspace/notifications/sent'] = {
  create: function () {
    var me = this;
    this.parent = lbs.workspace;
    this.endPoints = {};
    this.handlers['notifications:send:inmail'] = function (e) {
      me.sendInmail(e);
    }
    this.handlers['notification:send:cancel'] = function (e) {
      me.handlers.showBackGroundModal(e);

      console.log('----------cancel send---------');
    }
    this.handlers['send:inmail:message'] = function (e) {
      me.sendMessage(e);
      ;
    }
    this.handlers['notification:send:successful'] = function (e) {
      me.notificationSentSuccessful(e);
    }
    this.endPoints.all = this.basePath + '/all.json';
    this.endPoints.unread = this.basePath + '/unread.json';
    this.endPoints.read = this.basePath + '/sent.json';
    this.endPoints.notification = this.basePath + '/notification.json';
    this.endPoints.archive = this.basePath + '/archive/';
    this.routeParams = {//@todo: in the end there will be one endpoint and we can just pass the filter arguements to it
      '/workspace/notifications/all': {
//          listEndPoint:this.endPoints.all
        listEndPoint: '/workspace/notifications/all.json'

        ,currentPage: '所有通知'
      }
      , '/workspace/notifications/unread': {
//          listEndPoint:this.endPoints.unread
        listEndPoint: '/workspace/notifications/unread.json'

        , currentPage: '未读通知'
      }
      , '/workspace/notifications/sent': {
//          listEndPoint:this.endPoints.read
        listEndPoint: '/workspace/notifications/sent.json'

        , currentPage: '已读通知'
      }
    };
    lbs.workspace.notifications = this;
    delete this.deps;
    delete this.create;
  }

  , message: {}
  , basePath: '/workspace/notifications'
  , deps: ['/workspace']
  , container: '#right_container'
  , routeParams: null
  , viewdMessage: null
  , rerender: function rerender(arg){
                console.log("reRENDERING MESSAGES",arg);
                this.render(arg);
  }
  , render: function render(arg) {
                console.log("RENDERING MESSAGES",arg);
    var data = {
      container: '.container_bottom'
      , limitLengthDate: function () {
        return function (text, render) {
          var cleantext = render(text).substr(0, 10) + ' ' + render(text).substring(11, 19);
            console.log("CLEANTEXTING",text,"TO",cleantext);
          return cleantext;
        }
      }
      , dumpData: function dumpData() {
        console.log('data passed to mustache-----', this);
      }

    };
    return lbs.basemodule['general:list'].parentRender.call(this, {
      listMod: '/workspace/notifications:list'
      , mainView: '/workspace/notifications/main.html'
      , data: data

    });
  }
  ,sendInmail: function sendInmail(arg) {
    var me = this;

    lbs.modHelper.getView('/workspace/notifications/sendInmail.html').then(function (view) {

      lbs.modHelper.setContainer({
        container: '#platformAPIsModal'
        , html: Mustache.render(view,{receiver:arg&&arg.receiver?arg.receiver:'',subject:arg&&arg.subject?arg.subject:''})
      });
      lbs.actionHandler({
        container: '#platformAPIsModal'
        , handlers: me.handlers
      });

      $('#platformAPIsModal').modal().off('hide.bs.modal.sendInmail');
      $('#platformAPIsModal').modal().on('hide.bs.modal.sendInmail', function () {
        lbs.modHelper.setContainer({
          container: '#plaformAPIsModal'
          , html: ''
        });
      });

    });


  }

  , sendMessage: function sendMessage(e) {

    var me = this;
    var toValidate = {};
    toValidate.users = [];


    me.message.notification = {};
    me.message.recipients = $('#notificationMessageForm #notificationReceivers').val().replace(/\s+/g, '').split(';');

    me.message.notification.subject = $('#notificationMessageForm #notificationSubject').val();
    me.message.notification.body = $('#notificationMessageForm #notificationBody').val();
    me.message.notification.notificationType = '业务通知';
    for (value in    me.message.recipients) {

      toValidate.users.push({'account': me.message.recipients[value], 'valid': false});
      me.message.recipients[value] = {'to': me.message.recipients[value]};
    }
    console.log('-----------form receivers:   \n', me.message.recipients);


    var getNotificationView = lbs.modHelper.getView('/workspace/notifications/confirmSend.html');
    var getNotificationPoint = lbs.modHelper.getMessage('/workspace/notifications/mailling/contacts.json'
            , null
            , {modalToHide: '#platformAPIsModal'}, 'POST', toValidate);

    $.when(getNotificationView, getNotificationPoint).then(function (view, endPoint) {

      console.log('endPoint from server--------', endPoint.pl.users);
      lbs.modHelper.setContainer({
        container: '#platformAPIsModal2'
        , html: Mustache.render(view, {items: endPoint.pl.users})
      });
      lbs.actionHandler({
        container: '#platformAPIsModal2'
        , handlers: me.handlers
      })

      me.handlers.hideBackGroundModal(e);

      $('#platformAPIsModal2').modal().off('hide.bs.modal.sendMessage');
      $('#platformAPIsModal2').modal().on('hide.bs.modal.sendMessage', function () {
        lbs.modHelper.setContainer({
          container: '#plaformAPIsModal2'
          , html: ''
        });
      });
    });

  }
  ,notificationSentSuccessful: function notificationSentSuccessful(e) {

    var me = this;

    lbs.modHelper.getView('/workspace/notifications/spinningStransitionPage.html')
            .then(function (view) {

              $('#platformAPIsModal').modal('hide');
              lbs.modHelper.setContainer({
                container: '#plaformAPIsModal'
                , html: ''
              });

              lbs.modHelper.setContainer({
                container: '#platformAPIsModal2'
                , html: view
              });

              $('#platformAPIsModal2').modal();

            });


    lbs.modHelper.getMessage('/workspace/notifications/mailling/notifications.json', null
            , {modalToHide: '#platformAPIsModal'}, 'POST', me.message)
            .then(function (msg) {

              //  if(msg.status ==='success'){
              console.log('-------inmailled sent ------', msg);
              //  }


              lbs.modHelper.getView('/workspace/notifications/operationSuccessfull.html')
                      .then(function (view) {

                        lbs.modHelper.setContainer({
                          container: '#platformAPIsModal2'
                          , html: view
                        });

                        $('#platformAPIsModal2').modal();
                        countDown(function () {
                          $('#platformAPIsModal2').modal('hide');

                          lbs.modHelper.setContainer({
                            container: '#plaformAPIsModal2'
                            , html: ''
                          });
                        });
                      });
            });
  }
  , handlers: {
    hideBackGroundModal: function hideBackGroundModal(e) {

      $('#platformAPIsModal').fadeOut(50);

    }
    , showBackGroundModal: function showBackGroundModal(e) {

      $('#platformAPIsModal').fadeIn(80);
      $('#platformAPIsModal2').modal('hide');

    }
  }
};

lbs.modules['/workspace/notifications:list'] = {
  view: ''
  , list: []
  , pageSize: 10
  ,meta:null
  , index: 0
  ,container:'.container_bottom'
  ,render: function render(arg) {
        var me = this;
    arg.listView = arg.listView || '/workspace/notifications/list.html';
    return lbs.basemodule['general:list'].render.call(this, arg);
  }
  ,rerender: function (arg){
    var me =  this;

       var  arg = arg||{};
/////
        /*
        var data = {
            container: '.container_bottom'
            , limitLengthDate:
            , dumpData: function dumpData() {
                console.log('data passed to mustache-----', this);
            }

        };
        return lbs.basemodule['general:list'].parentRender.call(this, {
            listMod: '/workspace/notifications:list'
            , mainView: '/workspace/notifications/main.html'
            , data: data

        });*/
        function limitLength() {
            return function (text, render) {
                var cleantext = render(text).substr(0, 10) + ' ' + render(text).substring(11, 19);
                console.log("CLEANTEXTING",text,"TO",cleantext);
                return cleantext;
            }
        }
        arg.limitLengthDate = limitLength;
        //////
    return lbs.basemodule['general:list'].rerender.call(this, arg)
    .then(function(){
          lbs.actionHandler({container:me.containerToSet,handlers:me.handlers});
    });
  }
  ,create: function (){
    var me = this;


    this.handlers['notification:delete']=function(e){
      var varMessageType = lbs.workspace.notifications.list.list[0].notification.messageType;
      var guid = e.target.getAttribute('data-id');

      lbs.basemodule["general:list"].deleteEntity({
        type:'通知'
        ,code:'notification.subject'
        ,entityName:'notification'
        ,listMod:me
        ,updateEndpoint:lbs.workspace.notifications.endPoints.archive + varMessageType + '/' + guid + '.json'
        ,_id:guid
      });
    };

    this.handlers['notification:details:show'] = function (e) {
      me.showNotificationDetails(e);
    }

    lbs.workspace.notifications.list = this;
    delete this.deps;
    delete this.create;
  }
  ,removeItem:function removeItem(id){
    var index = lbs.util.find({arr:this.list,val:id,key:'_id'});
    if(index!==-1){
      this.list.splice(index,1);
      this.rerender();
    }
  }


  ,showNotificationDetails: function showNotificationDetails(e) {
    var me = this;
    var clickedMessage = null, clickedmsgID = null;

    clickedmsgID = $(e.target).find('span').text();
    me.viewdMessage = $(e.target).closest('.lan_row');

    console.log('me.viewdMessage  ----', me.viewdMessage);
    lbs.workspace.notifications.list.list.forEach(function (obj) {
      if (obj._id === clickedmsgID) {
        clickedMessage = obj;
        return;
      }
    });


    console.log('clickedMessage-----------', clickedMessage);

    var data = {
      clickedMessage: clickedMessage,
      limitLengthDate:lbs.util.renderDateTime

    };
    lbs.modHelper.getView('/workspace/notifications/showDetails.html')
        .then(function (view) {

          lbs.modHelper.setContainer({
            container: '#platformAPIsModal'
            , html: Mustache.render(view, data)
          });

          $('#platformAPIsModal').modal().off('hide.bs.modal.showNotificationDetails');
          $('#platformAPIsModal').modal().on('hide.bs.modal.showNotificationDetails', function () {
            lbs.modHelper.setContainer({
              container: '#platformAPIsModal'
              , html: ''
            });

            me.viewdMessage.find('.lan_cell').removeClass('unread');
            var varMessageType = clickedMessage.notification.messageType;

            lbs.modHelper.getMessage('/workspace/notifications/' + varMessageType + '/' + clickedmsgID + '.json', null
                , {}, 'PUT', {'messageID': clickedmsgID, viewState:true, messageType: varMessageType })
                .then(function(){


                  if($.param.fragment()==='/workspace/welcome'){

                    lbs.workspacewelcome.render();
                  }
                  else if($.param.fragment() === "/workspace/notifications/unread"){

                    var arr = lbs.workspace.notifications.list.list;

                    var index = lbs.util.find({arr:arr,key:'_id',val:clickedmsgID});

                    if(index>-1){
                      arr.splice(index,1);
                    }

                    me.rerender();
                  }
                });

          });
        })
  }

  ,handlers:{}
  , deps: []
};
