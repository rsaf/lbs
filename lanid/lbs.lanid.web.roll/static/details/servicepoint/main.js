/** * Created by rollandsafort on 3/23/15. */console.log('details servicepoint is loaded...');//registration routers/modules of publishing if not already registeredlbs.routes['/basemodule'] = {mod: 'lbs.basemodule', location: '/basemodule.js'};lbs.routes['/details:nomenu'] = {mod: 'lbs.details:nomenu', location: '/details/main.js'};lbs.routes['/details/servicepoint'] = {mod: 'lbs.details:nomenu.servicepoint', location: '/details/servicepoint/main.js'};lbs.routes['/details/servicepointdetail'] = {mod: 'lbs.details:nomenu.servicepointdetail', location: '/details/servicepoint/main.js'};lbs.routes['/workspace/notifications'] = {mod: 'lbs.workspace.notifications', location: '/workspace/notifications/main.js'};lbs.modules['/details/servicepoint'] = {//add routes and servicepointspecific stuff here    endPoints:{}    ,create:function(){        this.parent = lbs['details:nomenu'];        lbs['details:nomenu'].servicepoint = this;        delete this.deps;        delete this.create;    }    ,basePath:'/details'    ,deps:['/details:nomenu']    ,render : function render(arg){        return this.parent.render(arg);    }};lbs.modules['/details/servicepointdetail'] = {    container : '#main_container'    ,endPoints:{}    ,handlers:{}    ,boundValues:[]    ,currentView:null    ,parent:null    ,endPoint:'/workspace/servicepoint/activitieslist.json'    //,mainView:"/home/detailPages/kodakDetailPage.html"    ,mainView:"/details/servicepoint/servicepointDetails.html"    ,currentPage:'事务详情'    ,root:'事务管理'    ,otherHandlers:false    ,index:0    ,boundValueHolder:[]    ,DetailsJson:null    ,totalRecords:null    ,pageSize:8    ,servicepoint_ID:null    ,boundValues:[]    ,selectedPhoto:null    ,currentEndpoint:null    ,templateHelpers:{}    ,newFaqAdder: null    ,create : function(){        var me = this;        this.parent = lbs['details:nomenu'].servicepoint;        this.handlers['servicepoint:details:general:edit']=function(e){            me.editGeneralInfo(e);        };        this.handlers['servicepoint:details:general:save']=function(e){            me.saveGeneralInfo(e);        };        this.handlers['servicepoint:details:logo:upload']=function(e){            me.uploadServicepointDetailsLogo(e);        };        this.handlers['servicepoint:details:description:edit']=function(e){            me.editDescriptionInfo(e);        };        this.handlers['servicepoint:details:description:save']=function(e){            me.saveDescriptionInfo(e);        };        this.handlers['servicepoint:details:attachment:upload']=function(e){            me.uploadServicepointDetailAttachements(e);        };        this.handlers['servicepoint:details:attachement:delete']=function(e){            me.deleteServicepointDetailAttachements(e);        };        this.handlers['servicepoint:details:image:edit']=function(e){            console.log('edit images');            me.editServicepointDetailImage(e);        };        this.handlers['servicepoint:details:image:delete']=function(e){            console.log('delete images');            me.deleteServicepointDetailImage(e);        };        this.handlers['servicepoint:details:image:save']=function(e){            console.log('save images');            me.saveServicepointDetailImage(e);        };        this.handlers['servicepoint:details:image:upload']=function(e){            console.log('upload images');            me.uploadServicepointDetailImage(e);        };        this.handlers['servicepoint:details:faq:edit']=function(e){            me.editServicepointDetailFaq(e);        };        this.handlers['servicepoint:details:faq:save']=function(e){            me.saveServicepointDetailFaq(e);        };        this.handlers['servicepoint:details:faq:new:save']=function(e){            me.saveNewServicepointDetailFaq(e);        };        this.handlers['servicepoint:details:faq:delete:single']=function(e){            me.deleteSingleServicepointDetailFaq(e);        };        this.handlers['servicepoint:details:faq:edit:single']=function(e){            me.editSingleServicepointDetailFaq(e);        };        this.handlers['servicepoint:details:faq:save:single']=function(e){            me.saveSingleServicepointDetailFaq(e);        };        this.handlers['servicepoint:details:audio:edit']=function(e){            me.editServicepointDetailAudio(e);        };        this.handlers['servicepoint:details:audio:save']=function(e){            me.saveServicepointDetailAudio(e);        };        this.handlers['servicepoint:details:audio:new']=function(e){            me.addnewServicepointDetailAudio(e);        };        this.handlers['servicepoint:details:video:save']=function(e){            me.saveServicepointDetailVideo(e);        };        this.handlers['servicepoint:details:video:edit']=function(e){            me.editServicepointDetailVideo(e);        };        this.handlers['servicepoint:details:video:new']=function(e){            me.addnewServicepointDetailVideo(e);        };        this.handlers['servicepoint:details:video:delete']=function(e){            me.deleteServicepointDetailVideo(e);        };        this.handlers['servicepoint:details:audio:delete']=function(e){            me.deleteServicepointDetailAudio(e);        };        this.handlers['servicepoint:details:map:edit']=function(e){            me.editServicepointDetailMap(e);        };        this.handlers['servicepoint:details:map:save']=function(e){            me.saveServicepointDetailMap(e);        };        this.handlers['send:notification:from:detailpage'] = function(e){            if(!$(e.target).hasClass('disabled')){                var user = e.target.getAttribute('data-user');                var subject = e.target.getAttribute('data-subject');                lbs.modHelper.getMod('/comments')                    .then(function(mod){                        mod.sendInmailFromComment({                            e: e,                            user: user,                            subject: subject                        });                    });            }        }        lbs['details:nomenu'].servicepointdetail = this;        delete this.deps;        delete this.create;    }    ,render : function render(arg){        var me = this;//resolve handler needs a reference to this        var urlArr = jQuery.param.fragment().split("/");        var previousPage = jQuery.param.fragment().split("/")[2];        var previousUrl = '';        var previousPageName = '';        console.log('previousPage page-----',previousPage);      if(previousPage==='workspace'){//todo here i assume only the owner of the service point or the admin will be able to access from workspace;            previousUrl = '#/workspace/services/myservicepoints';            previousPageName = '我的网点';        }        else if(previousPage==='search'){            previousUrl = '/#/home/detailPages/search/all';            previousPageName = '搜索页';        }        me.servicepoint_ID =  urlArr.pop();                return me.parent.render(arg)                    .then(function(){                        jQuery.when(  lbs.modHelper.getView(me.mainView)                            , lbs.modHelper.getMessage('/details/search/servicepointDetails/'+me.servicepoint_ID+'.json',false,null,'GET')                            , (lbs.user&& lbs.basemodule.endPoints["profile:"+lbs.user.userType])?lbs.modHelper.getMessage(lbs.basemodule.endPoints["profile:"+lbs.user.userType],false,{}):{pl:null}                        ).then(function(view,data,userprofile){                                // var  code = data.pl.adc;                                var  code = null;                                var config ={currentPage:me.currentPage,root:me.root};                                config.previousUrl = previousUrl;                                config.previousPageName = previousPageName;                                me.DetailsJson = data.pl;                                var user = null;                                var profile = userprofile.pl;                                if(me.DetailsJson&&me.DetailsJson.ct&&me.DetailsJson.ct.oID&&profile&&profile.ow&&profile.ow.oID){                                    if(me.DetailsJson.ct.oID === profile.ow.oID){                                        user = true;                                    }                                }                                if(me.DetailsJson.map&&me.DetailsJson.map.coordinates){                                    lbs.servicePointMap.latitude =  me.DetailsJson.map.coordinates.latitude;                                    lbs.servicePointMap.longitude =  me.DetailsJson.map.coordinates.longitude;                                }                                console.log('rendering servicepoint details------',me.DetailsJson);                                //lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{data:me.DetailsJson ,config:config, user:lbs.user,info:me.DetailsJson.acid}),container:me.container});                                lbs.modHelper.setContainer({mod:me,html:Mustache.render(view,{data:me.DetailsJson ,config:config,loggedIn:lbs.user, user:user,info:null}),container:me.container});                                lbs.actionHandler({                                    container:me.container                                    ,handlers:me.handlers                                });                            })                            .then(function(){                                lbs.basemodule.pageComplete();                                //return lbs.modHelper.getMod('/comments')                                //    .then(function(){                                //                                //        return lbs.comments.render({acid:me.DetailsJson.acid})                                //            .then(function(){                                //                console.log('comment rendered----------');                                //                                //            })                                //                                //    })                            })                    });    }    ,editGeneralInfo: function editGeneralInfo(e){        var me = this;        lbs.modHelper.getView('/details/servicepoint/editServicepointGeneralDetails.html')            .then(function(view1){                lbs.modHelper.setContainer({                    container:'#corporateDetailsGeneralInfo'                    ,html:Mustache.render(view1,{data:me.DetailsJson})                });            })            .then(function(){                lbs.modHelper.getView('/details/servicepoint/editServicepointContactDetails.html')                    .then(function(view2){                        lbs.modHelper.setContainer({                            container:'#corporateDetailsContacts'                            ,html:Mustache.render(view2,{data:me.DetailsJson})                        });                    })                    .then(function(){                        lbs.binder.unbind(me.boundValueHolder);                        me.boundValueHolder = lbs.binder.bind('.detailPageTopTable',me.DetailsJson,'general');                        var i = -1,len=me.boundValueHolder.length;                        while(++i<len){                            me.boundValueHolder[i].updateUI();                        }                    })            })        jQuery('#saveGeneralINfoBtn').removeClass('hide');        jQuery('#editGeneralINfoBtn').addClass('hide');    }    ,saveGeneralInfo: function editGeneralInfo(e){        var me = this;        lbs.modHelper.getView('/details/servicepoint/saveServicepointGeneralDetails.html')            .then(function(view1){                lbs.modHelper.setContainer({                    container:'#corporateDetailsGeneralInfo'                    ,html:Mustache.render(view1,{data:me.DetailsJson})                });            })            .then(function(){                lbs.modHelper.getView('/details/servicepoint/saveServicepointContactDetails.html')                    .then(function(view2){                        lbs.modHelper.setContainer({                            container:'#corporateDetailsContacts'                            ,html:Mustache.render(view2,{data:me.DetailsJson})                        });                    })                    .then(function(){                        lbs.basemodule.pageComplete();                    });            })        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/'+me.DetailsJson._id+'.json',null,null,'PUT', me.DetailsJson)            .then(function(response){                console.log(response);            });        jQuery('#saveGeneralINfoBtn').addClass('hide');        jQuery('#editGeneralINfoBtn').removeClass('hide');    }    ,uploadServicepointDetailsLogo: function uploadServicepointDetailsLogo(e){        var me = this;        var input = $(e.target),            numFiles = input.get(0).files ? input.get(0).files.length : 1,            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');        if ($(e.target)[0].files[0]) {            var reader = new FileReader();            reader.onload = function (e){                var oldImage = $('.corporateDetailsLogo img').attr('src');                console.log('oldImage',oldImage)                $('.corporateDetailsLogo img').attr('src', e.target.result);                $('#uploadForm').ajaxSubmit({                    type:'POST',                    url:'/workspace/services/servicepointDetails/upload.json',                    data:{"json":JSON.stringify(me.DetailsJson)},                    dataType: 'json',                    success:function(data){                        console.log('avatar updated successfully-----');                        $('#uploadForm').resetForm();                    },                    error:function(err){                        alert('上传失败了，请重试!');                        $('.corporateDetailsLogo img').attr('src', oldImage);                        console.log('error------', err);                        $('#uploadForm').resetForm();                    }                });            }            reader.readAsDataURL($(e.target)[0].files[0]);        }    }    ,editDescriptionInfo: function editDescriptionInfo(e){        var me = this;        lbs.modHelper.getView('/details/servicepoint/editServicepointDescriptionDetails.html')            .then(function(view){                lbs.modHelper.setContainer({                    container:'.corporateDetailsDescriptionContainer'                    ,html:Mustache.render(view,{data:me.DetailsJson})                });            })            .then(function(){                lbs.binder.unbind(me.boundValueHolder);                me.boundValueHolder = lbs.binder.bind('#corporateDetailsDescription',me.DetailsJson.description,'description');                var i = -1,len=me.boundValueHolder.length;                while(++i<len){                    me.boundValueHolder[i].updateUI();                }                lbs.actionHandler({                    container:'#corporateDetailsDescription'                    ,handlers:me.handlers                });            })        jQuery('#saveDescINfoBtn').removeClass('hide');        jQuery('#editDescINfoBtn').addClass('hide');    }    ,saveDescriptionInfo: function saveDescriptionInfo(e){        var me = this;        jQuery('#saveDescINfoBtn').addClass('hide');        jQuery('#editDescINfoBtn').removeClass('hide');        lbs.modHelper.getView('/details/servicepoint/saveServicepointDescriptionDetails.html')            .then(function(view){                lbs.modHelper.setContainer({                    container: '.corporateDetailsDescriptionContainer'                    ,html:Mustache.render(view,{data:me.DetailsJson})                });            });        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/description/'+me.DetailsJson._id+'.json',null,null,'PUT', me.DetailsJson)            .then(function(response){                console.log('saved----');            });    }    ,uploadServicepointDetailAttachements: function uploadServicepointDetailAttachements(e){        var me = this;        console.log('uploading new file-----');        var input = $(e.target),            numFiles = input.get(0).files ? input.get(0).files.length : 1,            label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),            ext = label.split('.').pop();        ext = ext.toLowerCase();        if ($(e.target)[0].files[0]) {            var reader = new FileReader();            reader.onload = function (e){                input.closest('.uploadFileContainer').find('.uploadedFileName').text(label);            }            reader.readAsDataURL($(e.target)[0].files[0]);        }        input.closest('.attachmentFileUploaderUploader').addClass('uploadDingAttachment');        $('#uploadAttachmentForm').ajaxSubmit({            type:'POST',            url:'/workspace/services/servicepointDetails/description/attachment.json',            data:{"json":JSON.stringify({_id:me.DetailsJson._id, description:{attachment:[]}})},            dataType: 'json',            success:function(response){                console.log('saved----');                var latest = response.pl;                console.log('latest',latest);                var $el = jQuery('<li> <img class="fileTypeIcon"  src="../commons/images/attachment'+latest.fm+'.jpg"><a href="'+latest.url+'">'+latest.nm+'</a><strong class=" glyphicon glyphicon-trash pull-right" data-id="'+latest.uuid+ '" data-action-click="servicepoint:details:attachement:delete" data-toggle="toolpit" title="删除"></strong></li>')                jQuery('.detailPageAttatchmentLine').append($el);                lbs.actionHandler({                    container:$el                    ,handlers:me.handlers                });                me.DetailsJson.description.attachment.push(latest);                input.closest('.uploadFileContainer').find('.uploadedFileName').text('');                input.closest('.attachmentFileUploaderUploader').removeClass('uploadDingAttachment');                console.log('attachments updated successfully-----');                $('#uploadAttachmentForm').resetForm();            },            error:function(err){                alert('上传失败了，请重试!');                console.log('error------', err);                $('#uploadAttachmentForm').resetForm();            }        });    }    ,deleteServicepointDetailAttachements:function deleteServicepointDetailAttachements(e){        console.log('deleting----');        var me = this;        var uuid = e.target.getAttribute('data-id');        var targetDomel = $(e.target).closest('li');        var index =  lbs.util.find({arr:me.DetailsJson.description.attachment,key:'uuid',val:uuid});        console.log('deleting id',uuid);        jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/description/attachment/'+me.DetailsJson._id+'/'+uuid+'.json',null,null,'DELETE')            .then(function(response){                targetDomel.remove();                console.log('delete successful');                me.DetailsJson.description.attachment.splice(index,1);                jQuery('.newfaqspinner .spinnerContainer').addClass('hide');            })    }    ,editServicepointDetailImage: function editServicepointDetailImage(e){        jQuery('#editImageINfoBtn').addClass('hide');        jQuery('#saveImageINfoBtn').removeClass('hide');        jQuery('.deleteCorporatedetailsImage').removeClass('hide');        jQuery('.imageUploaderContainer').removeClass('hide');    }    ,uploadServicepointDetailImage: function uploadServicepointDetailImage(e){        var me = this;        var input = $(e.target),            numFiles = input.get(0).files ? input.get(0).files.length : 1,            label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),            ext = label.split('.').pop();        ext = ext.toLowerCase();        if ($(e.target)[0].files[0]) {            var reader = new FileReader();            reader.onload = function (e){                input.closest('.uploadFileContainer').find('.uploadedFileName').text(label);            }            reader.readAsDataURL($(e.target)[0].files[0]);        }        input.closest('.attachmentFileUploaderUploader').addClass('uploadDingAttachment');        $('#uploadCorporateDetailsImageForm').ajaxSubmit({            type:'POST',            url:'/workspace/services/servicepointDetails/images.json',            data:{"json":JSON.stringify({_id:me.DetailsJson._id})},            dataType: 'json',            success:function(response){                console.log('saved----');                var latest = response.pl;                var $el = jQuery('  <div class="lan_margin_10 singleCorporateDetailsImage">   <span data-id="'+latest.uuid+'" data-action-click="servicepoint:details:image:delete" class="glyphicon glyphicon-trash deleteCorporatedetailsImage"></span>  <img src="'+latest.url+'" alt="image"> </div>');                jQuery('.corporateDetailsImageContainer').append($el);                lbs.actionHandler({                    container:$el                    ,handlers:me.handlers                });                me.DetailsJson.images.push(latest);                input.closest('.attachmentFileUploaderUploader').removeClass('uploadDingAttachment');                input.closest('.uploadFileContainer').find('.uploadedFileName').text('');                $('#uploadCorporateDetailsImageForm').resetForm();            },            error:function(err){                alert('上传失败了，请重试!');                console.log('error------', err);                $('#uploadCorporateDetailsImageForm').resetForm();            }        });    }    ,saveServicepointDetailImage: function saveServicepointDetailImage(e){        var me = this;        jQuery('#editImageINfoBtn').removeClass('hide');        jQuery('#saveImageINfoBtn').addClass('hide');        jQuery('.imageUploaderContainer').addClass('hide');        jQuery('.deleteCorporatedetailsImage').addClass('hide');    }    ,deleteServicepointDetailImage: function deleteServicepointDetailImage(e){        console.log('deleting----');        var me = this;        var uuid = e.target.getAttribute('data-id');        var targetDomel = $(e.target).closest('.singleCorporateDetailsImage');        console.log('deleting id',uuid);        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/images/'+me.DetailsJson._id+'/'+uuid+'.json',null,null,'DELETE')            .then(function(response){                var latest = response.pl;                if(latest.status ===true)                {                    targetDomel.remove();                    console.log('delete successful');                }                else  if(latest.status ===false)                {                    console.log('delete failed');                    alert('删除失败，请重试');                }            })    }    ,editServicepointDetailAudio:function editServicepointDetailAudio(e) {        var me = this;        jQuery('#editAudioINfoBtn').addClass('hide');        jQuery('#saveAudioINfoBtn').removeClass('hide');        jQuery('.audioUploaderContainer').removeClass('hide');        jQuery('.deleteCorporatedetailsAudio').removeClass('hide');    }    ,addnewServicepointDetailAudio:function addnewServicepointDetailAudio(e){        var me = this;        var _id =   me.DetailsJson._id;        var url =  jQuery('#audioLinkToEmbed').val();        var newaudio = {url:url ,_id:_id};        console.log('newaudio----',newaudio);        if(newaudio.url){            lbs.modHelper.getMessage('/workspace/services/servicepointDetails/audios.json',null,null,'POST', newaudio)                .then(function(response){                    console.log('saved----');                    var latest = response.pl;                    me.DetailsJson.audios.push(latest);                    var addaudio = '<div class="audioContainer added lan_padding_20">    <span data-id="'+latest.uuid+'" data-action-click="servicepoint:details:audio:delete" class="glyphicon glyphicon-trash   deleteCorporatedetailsAudio"></span><audio controls="">  <source src="'+latest.url+'" type="audio/mp4">  </audio></div>'                    jQuery('.corporateDetailsAudioContainer').append(addaudio);                    jQuery('#audioLinkToEmbed').val('');                    var $el = jQuery('.audioContainer.added:last-child');                    lbs.actionHandler({                        container:$el                        ,handlers:me.handlers                    });                });        }    }    ,deleteServicepointDetailAudio:function deleteServicepointDetailAudio(e){        console.log('deleting----');        var me = this;        var uuid = e.target.getAttribute('data-id');        var targetDomel = $(e.target).closest('.audioContainer');        console.log('deleting id:--',uuid);        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/audios/'+me.DetailsJson._id+'/'+uuid+'.json',null,null,'DELETE')            .then(function(response){                var latest = response.pl;                if(latest.status ===true)                {                    targetDomel.remove();                    console.log('delete successful');                }                else  if(latest.status ===false)                {                    console.log('delete failed');                    alert('删除失败，请重试');                }            })    }    ,saveServicepointDetailAudio:function saveServicepointDetailAudio(e) {        var me = this;        jQuery('#saveAudioINfoBtn').addClass('hide');        jQuery('#editAudioINfoBtn').removeClass('hide');        jQuery('.audioUploaderContainer').addClass('hide');        jQuery('.deleteCorporatedetailsAudio').addClass('hide');    }    ,editServicepointDetailVideo:function editServicepointDetailVideo(e) {        var me = this;        jQuery('#editVideoINfoBtn').addClass('hide');        jQuery('#saveVideoINfoBtn').removeClass('hide');        jQuery('.videoUploaderContainer').removeClass('hide');        jQuery('.deleteCorporatedetailsVideo').removeClass('hide');    }    ,addnewServicepointDetailVideo:function addnewServicepointDetailVideo(e){        var me = this;        var _id =   me.DetailsJson._id;        var url =   jQuery('#videoLinkToEmbed').val();        var newvid = {url:url ,_id:_id};        console.log('inputLink----',newvid);        if(newvid.url){            lbs.modHelper.getMessage('/workspace/services/servicepointDetails/videos.json',null,null,'POST', newvid)                .then(function(response){                    console.log('saved----');                    var latest = response.pl;                    me.DetailsJson.videos.push(latest);                    var addvideo = '<div class="videoContainer added lan_padding_20">  <span data-id="'+latest.uuid+ '" data-action-click="servicepoint:details:video:delete" class="glyphicon glyphicon-trash   deleteCorporatedetailsVideo"></span>  <embed src="'+latest.url+'"  allowFullScreen="true" quality="high" width="100%" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed></div>'                    jQuery('.corporateDetailsVideoContainer').append(addvideo);                    jQuery('#videoLinkToEmbed').val('');                    var $el = jQuery('.videoContainer.added:last-child');                    lbs.actionHandler({                        container:$el                        ,handlers:me.handlers                    });                });        }    }    ,saveServicepointDetailVideo:function saveServicepointDetailVideo(e) {        var me = this;        jQuery('#saveVideoINfoBtn').addClass('hide');        jQuery('#editVideoINfoBtn').removeClass('hide');        jQuery('.videoUploaderContainer').addClass('hide');        jQuery('.deleteCorporatedetailsVideo').addClass('hide');    }    ,deleteServicepointDetailVideo:function deleteServicepointDetailVideo(e){        console.log('deleting----');        var me = this;        var uuid = e.target.getAttribute('data-id');        var targetDomel = $(e.target).closest('.videoContainer');        console.log('deleting id',uuid);        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/videos/'+me.DetailsJson._id+'/'+uuid+'.json',null,null,'DELETE')            .then(function(response){                var latest = response.pl;                if(latest.status ===true)                {                    targetDomel.remove();                    console.log('delete successful');                }                else  if(latest.status ===false)                {                    console.log('delete failed');                    alert('删除失败，请重试');                }            })    }    ,deleteSingleServicepointDetailFaq:function deleteSingleServicepointDetailFaq(e){        console.log('deleting----');        var me = this;        var uuid = e.target.getAttribute('data-id');        var faqDomelem = $(e.target).closest('.questionAnswerPairs');        var index =  lbs.util.find({arr:me.DetailsJson.faq,key:'uuid',val:uuid});        jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/faq/'+me.DetailsJson._id+'/'+uuid+'.json',null,null,'DELETE')            .then(function(response){                var latest = response.pl;                if(latest.status ===true)                {                    faqDomelem.remove();                    console.log('delete successful');                    me.DetailsJson.faq.splice(index, 1);                }                else  if(latest.status ===false)                {                    console.log('delete failed');                    alert('删除失败，请重试');                }                jQuery('.newfaqspinner .spinnerContainer').addClass('hide');            })    }    ,editSingleServicepointDetailFaq:function editSingleServicepointDetailFaq(e){        console.log('editing single----');        var me = this;        jQuery('.corporateDetailsFaqEdit').addClass('hide');        jQuery('.corporateDetailsFaqSave').removeClass('hide');        var q = $(e.target).closest('.questionAnswerPairs').find('.questionText').text();        var a = $(e.target).closest('.questionAnswerPairs').find('.answerText').text();        $(e.target).closest('.questionAnswerPairs').find('.questionText').parent().html('<textarea  class="form-control" id="EditedQuestionField" placeholder="请输入问题..." rows="1"></textarea>');        $(e.target).closest('.questionAnswerPairs').find('.answerText').parent().html('  <textarea   class="form-control" id="EdtitedAnswerField"  placeholder="请输入解答..." rows="3"></textarea>');        $('#EditedQuestionField').val(q);        $('#EdtitedAnswerField').val(a);    }    ,saveSingleServicepointDetailFaq:function saveSingleServicepointDetailFaq(e){        var me = this;        var q =  $('#EditedQuestionField').val();        var a =  $('#EdtitedAnswerField').val();        console.log('daving single----');        var uuid = e.target.getAttribute('data-id');        var newValues = {q:q,a:a,uuid:uuid,_id:me.DetailsJson._id};        console.log('uuid',uuid);        var index =  lbs.util.find({arr:me.DetailsJson.faq,key:'uuid',val:uuid});        console.log('index-----',index);        console.log(me.DetailsJson.faq[index]);        jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');        console.log('deleting id',uuid);        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/faq/'+newValues._id+'/'+newValues.uuid+'.json',null,null,'PUT',newValues)            .then(function(response){                var latest = response.pl;                if(latest.status === true){                    me.DetailsJson.faq[index].q = newValues.q;                    me.DetailsJson.faq[index].a = newValues.a;                    $(e.target).closest('.questionAnswerPairs').find('#EditedQuestionField').parent().html('  <div class="questionText">'+newValues.q+'</div>');                    $(e.target).closest('.questionAnswerPairs').find('#EdtitedAnswerField').parent().html('<div class="answerText">'+newValues.a+'</div>');                    console.log('update successful');                }                else if(latest.status === false){                    alert('编辑保存失败！');                    console.log('update failed');                }                jQuery('.corporateDetailsFaqEdit').removeClass('hide');                jQuery('.corporateDetailsFaqSave').addClass('hide');                jQuery('.newfaqspinner .spinnerContainer').addClass('hide');            });    }    ,editServicepointDetailFaq: function editServicepointDetailFaq(e){        var me = this;        lbs.modHelper.getView('/details/servicepoint/editServicepointFAQDetails.html')            .then(function(view){                lbs.modHelper.setContainer({                    container:'.corporateDetailsFAQContainer'                    ,html:Mustache.render(view,{data:me.DetailsJson})                });            })            .then(function(){                lbs.binder.unbind(me.boundValueHolder);                me.boundValueHolder = lbs.binder.bind('.corporateDetailsFAQContainer',me.DetailsJson,'faq');                var i = -1,len=me.boundValueHolder.length;                while(++i<len){                    me.boundValueHolder[i].updateUI();                }                lbs.actionHandler({                    container:'.corporateDetailsFAQContainer'                    ,handlers:me.handlers                });            })        jQuery('#editFaqINfoBtn').addClass('hide');        jQuery('#saveFaqINfoBtn').removeClass('hide');    }    ,saveServicepointDetailFaq: function saveServicepointDetailFaq(e){        var me = this;        lbs.modHelper.getView('/details/servicepoint/saveServicepointFAQDetails.html')            .then(function(view){                lbs.modHelper.setContainer({                    container:'.corporateDetailsFAQContainer'                    ,html:Mustache.render(view,{data:me.DetailsJson})                });            })            .then(function(){                lbs.basemodule.pageComplete({secondLoad:true});            });        jQuery('#saveFaqINfoBtn').addClass('hide');        jQuery('#editFaqINfoBtn').removeClass('hide');    }    ,saveNewServicepointDetailFaq: function saveNewServicepointDetailFaq(e){        var me = this;        var newq =  jQuery('#newQuestionField').val();        var newa =  jQuery('#newAnswerField').val();        if(newq&&newa)        {            var _id =   me.DetailsJson._id;            var newfaq = {q:newq, a:newa,_id:_id};            // me.DetailsJson.faq.push(newfaq);            jQuery('.newfaqspinner .spinnerContainer').removeClass('hide');            lbs.modHelper.getMessage('/workspace/services/servicepointDetails/faq.json',null,null,'POST',newfaq)                .then(function(response){                    console.log(response);                    var latest = response.pl;                    console.log('added');                    me.DetailsJson.faq.push(latest);                    jQuery('.newfaqspinner .spinnerContainer').addClass('hide');                    lbs.modHelper.getView('/details/servicepoint/saveNewServicepointDetailsFaq.html')                        .then(function(view){                            var newfaqTemplate = Mustache.to_html(view,latest);                            jQuery('.questionAnswerPairsContainer').append(newfaqTemplate);                            var $el = jQuery('.questionAnswerPairs.added:last-child');                            lbs.actionHandler({                                container:$el                                ,handlers:me.handlers                            });                        });                    jQuery('#newfaqAdder').find('textarea').val('');                    jQuery('.newfaqspinner .spinnerContainer').addClass('hide');                });        }        else{            alert('请输入常见问题与解答！');        }    }    ,saveServicepointDetailMap:function saveServicepointDetailMap(e) {        var me = this;        jQuery('#saveMapBtn').addClass('hide');        jQuery('#editMapBtn').removeClass('hide');        jQuery('#editServicePointMapBox').addClass('hide');        var coords =  jQuery('#mapCoordinates').val().split(',');        var itinerary = jQuery('#mapItinerary').val();        var lat = coords[0];        var lon = coords[1];        me.DetailsJson.map.coordinates.latitude = lat;        me.DetailsJson.map.coordinates.longitude = lon;        me.DetailsJson.map.itinerary = itinerary;        lbs.modHelper.getMessage('/workspace/services/servicepointDetails/map/'+me.DetailsJson._id+'.json',null,null,'PUT', me.DetailsJson)            .then(function(response){                console.log('map saved----');                jQuery('#mapCoordinates').val('');                jQuery('#mapItinerary').val('');            });    }    ,editServicepointDetailMap:function editServicepointDetailMap(e) {        var me = this;        jQuery('#editMapBtn').addClass('hide');        jQuery('#saveMapBtn').removeClass('hide');        jQuery('#editServicePointMapBox').removeClass('hide');    }    ,handlers:{    }    ,remove : function remove(arg){    }    ,deps : ['/details/servicepoint']};