/** * Created by rollandsafort on 3/10/15. */console.log('precesses is loaded...');lbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};lbs.routes['/details:nomenu'] = {mod: 'lbs.details:nomenu', location: '/details/main.js'};lbs.routes['/processes/verifications'] = {mod: 'lbs.processes:verifications', location: '/processes/verifications/main.js'};lbs.routes['/processes/verifications/verificationServices'] = {mod: 'lbs.processes:verifications.verificationServices', location: '/processes/verifications/main.js'};lbs.routes['/processes/verifications/singleIDForm'] = {mod: 'lbs.processes:verifications.singleIDForm', location: '/processes/verifications/main.js'};lbs.routes['/processes/verifications/groupIDForm'] = {mod: 'lbs.processes:verifications.groupIDForm', location: '/processes/verifications/main.js'};lbs.routes['/processes/verifications/checkIDForm'] = {mod: 'lbs.processes:verifications.checkIDForm', location: '/processes/verifications/main.js'};lbs.routes['/processes/verifications/payment'] = {mod: 'lbs.processes:verifications.payment', location: '/processes/verifications/main.js'};lbs.routes['/processes/verifications/done'] = {mod: 'lbs.processes:verifications.done', location: '/processes/verifications/main.js'};lbs.modules['/processes/verifications'] = {//add routes and activities specific stuff here    endPoints:{}    ,create:function(){        this.parent = lbs['details:nomenu'];        lbs['processes:verifications']  = this;        delete this.deps;        delete this.create;    }    ,basePath:'/details'    ,deps:['/details:nomenu']    ,render : function render(arg){        console.log('rendering parent-----');        return this.parent.render(arg);    }};lbs.modules['/processes/verifications/verificationServices'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/activities/activitieslist.json'    ,mainView:"/processes/verifications/verificationServices.html"    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,totalRecords:null    ,pageSize:8    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,create : function(){        var me = this;        this.parent =  lbs['processes:verifications'];        lbs['processes:verifications'].verificationServices = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){        var me = this;//resolve handler needs a reference to this        return me.parent.render(arg)            .then(function(){                console.log('parent render done --------');                lbs.modHelper.getView(me.mainView)                    .then(function(view){                        lbs.modHelper.setContainer({                            container:me.container                            ,html:Mustache.render(view)                        });                        jQuery('#main_container').addClass('notHomeMainContainer ');                        jQuery('#wrapperSelector').addClass('no_menu_public');                        lbs.actionHandler({                            container:me.container                            ,handlers:me.handlers                        });                        lbs.basemodule.pageComplete();                    })            });    }    ,handlers:{    }    ,remove : function remove(arg){        this.postalMod.remove(arg);    }    ,deps : ['/processes/verifications']};lbs.modules['/processes/verifications/singleIDForm'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/activities/activitieslist.json'    ,mainView:"/processes/verifications/singleIDForm.html"    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,totalRecords:null    ,pageSize:8    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,create : function(){        var me = this;        this.parent =  lbs['processes:verifications'];        lbs['processes:verifications'].singleIDForm = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){        var me = this;//resolve handler needs a reference to this        return me.parent.render(arg)            .then(function(){                console.log('parent render done --------');                lbs.modHelper.getView(me.mainView)                    .then(function(view){                        lbs.modHelper.setContainer({                            container:me.container                            ,html:Mustache.render(view)                        });                        jQuery('#main_container').addClass('notHomeMainContainer ');                        jQuery('#wrapperSelector').addClass('no_menu_public');                        lbs.actionHandler({                            container:me.container                            ,handlers:me.handlers                        });                        lbs.basemodule.pageComplete();                    })            });    }    ,handlers:{    }    ,remove : function remove(arg){        this.postalMod.remove(arg);    }    ,deps : ['/processes/verifications']};lbs.modules['/processes/verifications/groupIDForm'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/activities/activitieslist.json'    ,mainView:"/processes/verifications/groupIDForm.html"    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,totalRecords:null    ,pageSize:8    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,create : function(){        var me = this;        this.parent =  lbs['processes:verifications'];        lbs['processes:verifications'].groupIDForm = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){        var me = this;//resolve handler needs a reference to this        return me.parent.render(arg)            .then(function(){                console.log('parent render done for photo printing --------');                lbs.modHelper.getView(me.mainView)                    .then(function(view){                        lbs.modHelper.setContainer({                            container:me.container                            ,html:Mustache.render(view)                        });                        jQuery('#main_container').addClass('notHomeMainContainer ');                        jQuery('#wrapperSelector').addClass('no_menu_public');                        lbs.actionHandler({                            container:me.container                            ,handlers:me.handlers                        });                        lbs.basemodule.pageComplete();                    })            });    }    ,handlers:{    }    ,remove : function remove(arg){        this.postalMod.remove(arg);    }    ,deps : ['/processes/verifications']};lbs.modules['/processes/verifications/checkIDForm'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/activities/activitieslist.json'    ,mainView:"/processes/verifications/checkIDForm.html"    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,totalRecords:null    ,pageSize:8    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,create : function(){        var me = this;        this.parent =  lbs['processes:verifications'];        lbs['processes:verifications'].checkIDForm = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){        var me = this;//resolve handler needs a reference to this        return me.parent.render(arg)            .then(function(){                console.log('parent render done for photo printing --------');                lbs.modHelper.getView(me.mainView)                    .then(function(view){                        lbs.modHelper.setContainer({                            container:me.container                            ,html:Mustache.render(view)                        });                        jQuery('#main_container').addClass('notHomeMainContainer ');                        jQuery('#wrapperSelector').addClass('no_menu_public');                        lbs.actionHandler({                            container:me.container                            ,handlers:me.handlers                        });                        lbs.basemodule.pageComplete();                    })            });    }    ,handlers:{    }    ,remove : function remove(arg){        this.postalMod.remove(arg);    }    ,deps : ['/processes/verifications']};lbs.modules['/processes/verifications/payment'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/activities/activitieslist.json'    ,mainView:"/processes/verifications/payment.html"    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,totalRecords:null    ,pageSize:8    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,create : function(){        var me = this;        this.parent =  lbs['processes:verifications'];        lbs['processes:verifications'].payment = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){        var me = this;//resolve handler needs a reference to this        return me.parent.render(arg)            .then(function(){                console.log('parent render done --------');                lbs.modHelper.getView(me.mainView)                    .then(function(view){                        lbs.modHelper.setContainer({                            container:me.container                            ,html:Mustache.render(view)                        });                        jQuery('#main_container').addClass('notHomeMainContainer ');                        jQuery('#wrapperSelector').addClass('no_menu_public');                        lbs.actionHandler({                            container:me.container                            ,handlers:me.handlers                        });                        var url = jQuery.param.fragment().split('/');                        url.pop();                        url = url.join('/')+'/done';                        $('#paymentStatusModal').on('hidden.bs.modal', function (){                            $.bbq.pushState('#' + url);                            console.log('payment bbq url-----',url);                        });                    })            });    }    ,handlers:{        //'payment:bbqUpdate': function(e){        //        //            //var url = jQuery.param.fragment().split('/');            //    url.pop();            //            //    url = url.join('/')+'/done';            //            //    $.bbq.pushState('#' + url);            //   console.log('payment bbq url-----',url);        //        //        //}    }    ,remove : function remove(arg){        this.postalMod.remove(arg);    }    ,deps : ['/processes/verifications']};lbs.modules['/processes/verifications/done'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/activities/activitieslist.json'    ,mainView:null    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,totalRecords:null    ,pageSize:8    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,create : function(){        var me = this;        this.parent =  lbs['processes:verifications'];        lbs['processes:verifications'].done = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){          var param = jQuery.param.fragment().split('/');             param.pop();            param = param.pop();        var me = this;//resolve handler needs a reference to this        return me.parent.render(arg)            .then(function(){                console.log('parent render done -------param-',param);                me.mainView = '/processes/verifications/'+ param+'FormDone.html';                lbs.modHelper.getView(me.mainView)                    .then(function(view){                        lbs.modHelper.setContainer({                            container:me.container                            ,html:Mustache.render(view)                        });                        jQuery('#main_container').addClass('notHomeMainContainer ');                        jQuery('#wrapperSelector').addClass('no_menu_public');                        lbs.actionHandler({                            container:me.container                            ,handlers:me.handlers                        });                    })            });    }    ,handlers:{    }    ,remove : function remove(arg){        this.postalMod.remove(arg);    }    ,deps : ['/processes/verifications']};