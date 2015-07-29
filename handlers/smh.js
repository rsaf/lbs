/**
 * Created by LBS006 on 12/3/14.
 */

// workspace/services


var q = require('q');
var oHelpers = require('../utilities/helpers.js');
var formidable = require('formidable');
var fs = require('fs');
var lib = require('lib');

function _initRequestMessage(paramRequest, type, code, adminOrg,orgName) {
    var col, mod = 'smm',
        message, url;
    if (type === 'Service') {
        col = 'services';
        url = '/workspace/services/myservices/view/service';
        message = "服务"
    }
    if (type === 'ServicePoint') {
        col = 'servicepoints';
        url = '/workspace/services/myservicepoints/view/servicepoint';
        message = "网点";
    }
    return {
//    rdu: paramRequest.user.id//@todo: this should be set correctly
        rdo: adminOrg
        , rc: 'code'
        , rt: message + '申请 ' + code
        , rsu: paramRequest.user.lanzheng.loginName
        , rso: paramRequest.user.currentOrganization
        , rs: 10
        , ric:orgName||''
        , rb: '请审核'+message+'申请，拼同意或者拒绝 '
        , rtr: type
        , ei: [{
            col: col
            , mod: mod
            , ei: code
        }]
        , url: url

    };
}


module.exports = function (paramService, esbMessage) {
    function _commitTransaction(m) {
        m.pl.transaction = {
            _id: m.pl.transactionid
        }
        m.op = 'commitTransaction';
        return esbMessage(m);
    }

    function _rollBackTransaction2(m) {
        return q()
            .then(function () {
                return q.all([
                    esbMessage({op: 'smm_rollback', pl: {transaction: {_id: m.pl.transactionid}}})
                    , esbMessage({op: 'bmm_rollback', pl: {transactionid: m.pl.transactionid}})
                ]);
            })
            .then(function () {
                return q.resolve('ok');
            })
            .then(null, function reject(err) {
                return q.reject('in smh _rollBackTransaction2:', err);
            });
    }

    function _rollBackTransaction(m) {
        m.pl.transaction = {
            _id: m.pl.transactionid
        }
        m.op = 'wmm_rollBackTransaction';
        return esbMessage(m);
    }

    var workflowManager = new lib.WorkflowManager({
        esbMessage: esbMessage,
        commitTransaction: _commitTransaction,
        rollbackTransaction: _rollBackTransaction2}
    );

    function _patchLanzhengInfo(){
        var lzACT = require('../data/lanzheng_activities.json'),
            lzSRV = require('../data/lanzheng_services.json'),
            lzSVP = require('../data/lanzheng_servicepoints.json'),
            lzFRM = require('../data/lanzheng_forms.json'),
            serviceTypeMap = {},
            serviceCodeMap = {},
            servicePointTypeMap = {},
            servicesExtant = [],
            autoUser = "sa",
            autoOrg = "200000000000000000000000"
        return q().then(function getInfo(){
            return q.all([
                esbMessage({
                    "ns" : "smm",
                    "op" : "servicePointTypes",
                    "pl" : {}
                }),
                esbMessage({
                    "ns" : "smm",
                    "op" : "serviceTypes",
                    "pl" : {}
                })
            ])
        })
        .then(function loadUnlinkedServicePoints(types) {
            types[0].pl.forEach(function (type) {
                servicePointTypeMap[type.text] = type._id;
            });
            types[1].pl.forEach(function (type) {
                serviceTypeMap[type.text] = type._id;
            })

            lzSVP.forEach(function (ele, idx) {
                if (ele.links) {
                    ele.links.forEach(function (link) {
                        if (link.method == "map") {
                            lzSVP[idx].payload.servicePoint[link.path] = servicePointTypeMap[link.value];
                        }
                    })
                }
            });
            return q.allSettled(
                lzSVP.map(function(ele){
                    var obj = JSON.parse(JSON.stringify(ele.payload));
                    obj.transactionid = "200000000000000000000000";
                    obj.override = true;
                    obj.loginName = autoUser;
                    obj.currentOrganization = autoOrg;
                    return esbMessage({
                        "ns":"smm",
                        "op":"persistServicePoint",
                        "pl":obj
                    })
                })
            ).then(function(results){
                    var out = [];
                    for(var i = 0; i < results.length; i++)
                    {
                        if(results[i].state === 'fulfilled')
                        {
                            //console.log("INIT MODE ALLOWED YAY")
                            out.push(results[i].value);
                        }
                        else if(results[i].reason.er.em.indexOf("INITIALIZATION MODE KICKOUT") >= 0)
                        {
                            //console.log("INIT MODE KICKOUT YAY");
                            out.push(undefined);
                        }
                        else throw results[i].reason
                    }
                    return out;
                })
        })
        .then(function renameServicePoints(svp){
            return q.allSettled(svp.map(function(servicePoint, idx){
                if(servicePoint === undefined) return undefined;
                return esbMessage({
                    "ns":"smm",
                    "op":"smm_changeServicePointCode",
                    "pl":{
                        find: servicePoint.pl.servicePointCode,
                        code: lzSVP[idx].payload.servicePoint.servicePointCode,
                        loginName : autoUser,
                        currentOrganization : autoOrg
                    }
                })
            }))
        })
        .then(function lookupServices(){
            return q.all(lzSRV.map(function(service){
                return esbMessage({
                    "ns":"smm",
                    "op":"smm_getServices",
                    "pl":
                    {
                        which:"all",
                        loginName : autoUser,
                        currentOrganization: autoOrg
                    },
                    "mt":
                    {
                        sk:service.payload.service.serviceCode
                    }
                })
            })).then(function(services){
                servicesExtant = services.map(function(service){return service.pl[0]});
            })
        })
        .then(function lookupservicepoints(){
            return q.all(lzSRV.map(function(service){
                return q.all(service.payload.service.PriceList.map(function(list){
                    return esbMessage({
                        "ns":"smm",
                        "op":"smm_getServicePointByCode",
                        "pl":{
                            code : list.servicePoint,
                            loginName : autoUser,
                            currentOrganization: autoOrg
                        }
                    });
                }));
            }));
        })
        .then(function loadUnlinkedServices(svp){
            var servicePointCodeMap = {};
            svp.forEach(function(ele){
                ele.forEach(function(inner){
                    servicePointCodeMap[inner.servicePointCode] = inner._id;
                })
            })
            lzSRV.forEach(function (ele, idx){
                if (ele.links) {
                    ele.links.forEach(function (link) {
                        if (link.method == "map") {
                            lzSRV[idx].payload.service[link.path] = serviceTypeMap[link.value];
                        }
                    })
                }
            })
            lzSRV.forEach(function (ele, idx, arr){
                //find extant if exists
                var extant = false;
                var existIndex = -1;
                servicesExtant.forEach(function(service, index) {
                    if(!service) return;;
                    if (service.serviceCode == ele.payload.service.serviceCode)
                    {
                        extant = true;
                        existIndex = index
                    }
                })
                if(!extant) {
                    ele.payload.service.PriceList.forEach(function (listing, jdx) {
                        lzSRV[idx].payload.service.PriceList[jdx].servicePoint = servicePointCodeMap[lzSRV[idx].payload.service.PriceList[jdx].servicePoint];
                    })
                }
                else
                {
                    ele.payload.service.PriceList.forEach(function (listing, jdx) {
                        lzSRV[idx].payload.service.PriceList = servicesExtant[existIndex].PriceList;
                    })
                }
            })
            return q.allSettled(
                lzSRV.map(function(ele){
                    var obj = JSON.parse(JSON.stringify(ele.payload));
                    obj.transactionid = "200000000000000000000000";
                    obj.override = true;
                    obj.loginName = autoUser;
                    obj.currentOrganization = autoOrg;
                    return esbMessage({
                        "ns":"smm",
                        "op":"persistService",
                        "pl":obj
                    })
                })
            ).then(function(results){
                    var out = [];
                    for(var i = 0; i < results.length; i++)
                    {
                        if(results[i].state === 'fulfilled')
                        {
                            //console.log("INIT MODE ALLOWED YAY")
                            out.push(results[i].value);
                        }
                        else if(results[i].reason.er.em.indexOf("INITIALIZATION MODE KICKOUT") >= 0)
                        {
                            //console.log("INIT MODE KICKOUT YAY");
                            out.push(undefined);
                        }
                        else throw results[i].reason
                    }
                    return out;
                })
        })
        .then(function renameServiceNames(srv){
            return q.all(srv.map(function(service, idx){
                if(service === undefined) return undefined;
                return esbMessage({
                    "ns":"smm",
                    "op":"smm_changeServiceCode",
                    "pl":{
                        find: service.pl.serviceCode,
                        code: lzSRV[idx].payload.service.serviceCode,
                        loginName : autoUser,
                        currentOrganization: autoOrg
                    }
                })
            }))
        })
        .then(function loadUnlinkedForms(srv){
            return q.allSettled(lzFRM.map(function(form){
                form.upload.content.override = true;
                form.upload.content.loginName = autoUser;
                form.upload.content.currentOrganization = autoOrg;
                return esbMessage({
                    "ns":"bmm",
                    "op": "bmm_persistForm",
                    "pl": JSON.parse(JSON.stringify(form.upload.content))
                })
            })).then(function(results){
                var out = [];
                for(var i = 0; i < results.length; i++)
                {
                    if(results[i].state === 'fulfilled')
                    {
                        //console.log("INIT MODE ALLOWED YAY")
                        out.push(results[i].value);
                    }
                    else if(results[i].reason.er.em.indexOf("INITIALIZATION MODE KICKOUT") >= 0)
                    {
                        //console.log("INIT MODE KICKOUT YAY");
                        out.push(undefined);
                    }
                    else throw results[i].reason
                }
                return out;
            })
        })
        .then(function renameForms(frms){
            return q.all(frms.map(function(form, idx){
                if(form === undefined) return undefined;
                return esbMessage({
                    "ns":"bmm",
                    "op":"bmm_changeFormMetaCode",
                    "pl":{
                        find: form.pl.fc,
                        code: lzFRM[idx].upload.content.form.fc,
                        loginName : autoUser,
                        currentOrganization: autoOrg
                    }
                })
            }))
        })
        .then(function lookupServicesAgain(){
            return q.all(lzSRV.map(function(service){
                return esbMessage({
                    "ns":"smm",
                    "op":"smm_getServices",
                    "pl":
                    {
                        which:"all",
                        loginName : autoUser,
                        currentOrganization: autoOrg
                    },
                    "mt":
                    {
                        sk:service.payload.service.serviceCode
                    }
                })
            }))
        })
        .then(function loadUnlinkedActivities(services){
            var serviceNameMap = {};
            services.forEach(function(ele){
                serviceNameMap[ele.pl[0].serviceName.text] = ele.pl[0].serviceName._id;
            });
            return q.allSettled(lzACT.map(function(activity,i){
                activity.payload.sqc.forEach(function(sq,idx){
                    activity.payload.sqc[idx].sn = serviceNameMap[activity.payload.sqc[idx].sn];
                });
                return esbMessage({
                    "ns":"bmm",
                    "op":"bmm_getFormMeta",
                    "pl":{
                        fc : lzACT[i].form,
                        loginUser: autoUser,
                        currentOrganization: autoOrg
                    }
                }).then(function(formMeta){
                    activity.payload.fm = formMeta._id;
                    return esbMessage({
                        "ns":"bmm",
                        "op":"bmm_persistActivity",
                        "pl":{
                            activity : JSON.parse(JSON.stringify(activity.payload)),
                            override : true,
                            loginName : autoUser,
                            currentOrganization: autoOrg
                        }
                    });
                });
            })).then(function(results){
                var out = [];
                for(var i = 0; i < results.length; i++)
                {
                    if(results[i].state === 'fulfilled')
                    {
                        //console.log("INIT MODE ALLOWED YAY")
                        out.push(results[i].value);
                    }
                    else if(results[i].reason.er.em.indexOf("INITIALIZATION MODE KICKOUT") >= 0)
                    {
                        //console.log("INIT MODE KICKOUT YAY");
                        out.push(undefined);
                    }
                    else throw results[i].reason
                }
                return out;
            });
        })
        .then(function renameActivities(acts){
            return q.all(acts.map(function(act, idx){
                if(act === undefined) return undefined;
                return esbMessage({
                    "ns":"bmm",
                    "op":"bmm_changeActivityCode",
                    "pl":{
                        find: act.abd.ac,
                        code: lzACT[idx].payload.abd.ac,
                        loginName : autoUser,
                        currentOrganization: autoOrg
                    }
                })
            }))
        })
        .then(function success(){
            console.log("Successfully updated Lanzheng elements");
        }  ,  function failure(err){
            console.log("FAILING patching lanzheng:",err);
        })
    }

    function _persistForm(paramRequest, paramResponse){
        var m = {};
        //formHtml
        q().then(function(){
            m.pl=JSON.parse(paramRequest.body.json);
            m.pl.loginName=paramRequest.user.lanzheng.loginName;
            m.pl.currentOrganization=paramRequest.user.currentOrganization;
            m.op='bmm_persistForm';
            return esbMessage(m);
        }).then(function(msg){
            oHelpers.sendResponse(paramResponse,200,msg);
        }).fail(function(er){
            oHelpers.sendResponse(paramResponse,501,er);
        });
    }
    function _persistActivity(paramRequest, paramResponse){
        var m = {},response={}
            ,activity,adminid;
        //formHtml
        q().then(function(){
            m.pl=JSON.parse(paramRequest.body.json).pl;
            m.pl.loginName=paramRequest.user.lanzheng.loginName;
            m.pl.currentOrganization=paramRequest.user.currentOrganization;
            if(m.pl.activity && m.pl.activity.abd && m.pl.activity.abd.aps && parseInt(m.pl.activity.abd.aps,10)===10){
                // create a transaction
                m.op = "createTransaction";
                m.pl.transaction={
                    description:'publish Activity request'
                    ,modules:['bmm','rmm']
                };
                return q.all([esbMessage(m), esbMessage({op:'getOrganization',pl:{org:'lanzheng'}})]);
            }
            return [false,false];
        })
            .then(function(msg){
                m.pl.transactionid=(msg[0]===false)?false:msg[0].pl.transaction._id;
                adminid=(msg[1]===false)?false:msg[1].pl.oID;
                m.op='bmm_persistActivity';
                return esbMessage(m);
            })
            .then(function(msg){
                activity = msg;
                if(m.pl.transactionid){
                    m.op="rmm_persistRequestMessage";
                    m.pl.request = _initRequestMessage(paramRequest,'Activity',activity.abd.ac,adminid);//org should be admin org
                    return esbMessage(m);
                }
                return false;
            })
            .then(function(){
                if(m.pl.transactionid){
                    return _commitTransaction(m);
                }
            })
            .then(function(){
                oHelpers.sendResponse(paramResponse,200,{pl:activity});
            })
            .fail(function(er){
                var trans=q();
                if(m.pl.transactionid){
                    trans = _rollBackTransaction(m);
                }
                trans.fin(function(){
                    oHelpers.sendResponse(paramResponse,501,er);
                });
            });
    }

    var serviceManagementRouter = paramService.Router();
    serviceManagementRouter.put('/service.json', function (paramRequest, paramResponse, paramNext) {//update service
        var m = {};
        var response;
        q().then(function () {
            m.op = "createTransaction";
            m.pl = {
                transaction: {
                    description: 'persist Service'
                    , modules: ['smm', 'rmm']
                }
            };
            m.pl.loginName = paramRequest.user.lanzheng.loginName;
            m.pl.currentOrganization = paramRequest.user.currentOrganization;//@todo: this should be the admin org
            return esbMessage(m)
        })
            .then(function (msg) {
                m.pl.transactionid = msg.pl.transaction._id;
                m.pl.transaction = msg.pl.transacton;
                var reqMsg = JSON.parse(paramRequest.body.json),
                    service = reqMsg.pl.service;
                m.pl.service = service;
                m.op = 'persistService';
                return q.all([
                    esbMessage(m)
                    , esbMessage({op: 'getOrganization', pl: {org: 'lanzheng'}})
                ])
            })
            .then(function (r) {
                response = r[0];
                m.op = "rmm_persistRequestMessage";
                m.pl.request = _initRequestMessage(paramRequest, 'Service', response.pl.serviceCode, r[1].pl.oID);
                return esbMessage(m);
            })
            .then(function () {
                return _commitTransaction(m);
            })
            .then(function () {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(response));
                oHelpers.sendResponse(paramResponse, 200, response);
            })
            .fail(function (r) {
                //@todo: set roll back wmm (not sure why q.all don't want to play nice. fin is never called when I tried that
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                        return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'rmm_rollback'});
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                       // paramResponse.end(JSON.stringify(r));
                        oHelpers.sendResponse(paramResponse, 501, response);
                    });
            });
    });
    serviceManagementRouter.post('/service.json', function (paramRequest, paramResponse, paramNext) {

        var bodyJson = JSON.parse(paramRequest.body.json);
        var company = bodyJson.company;


        var m = {};
        var response;
        q().then(function () {
            m.op = "createTransaction";
            m.pl = {
                transaction: {
                    description: 'persist Service'
                    , modules: ['smm', 'rmm']
                }
            };
            m.pl.loginName = paramRequest.user.lanzheng.loginName;
            m.pl.currentOrganization = paramRequest.user.currentOrganization;
            return esbMessage(m);
        }).then(function (msg) {
            m.pl.transactionid = msg.pl.transaction._id;
            m.pl.transaction = msg.pl.transacton;
            var reqMsg = JSON.parse(paramRequest.body.json);
            var service = reqMsg.pl.service;
            m.pl.service = {
                serviceName: service.serviceName
                , serviceType: service.serviceType
                , briefOverview: service.briefOverview
                , standardPayment: service.standardPayment
                , standardServicePrice: service.standardServicePrice
                , standardPricing: service.standardPricing
                , standardServiceNotes: service.standardServiceNotes
                , standardReservationRequest: service.standardReservationRequest
                , PriceList: service.PriceList
            };
            m.op = 'persistService';
            return q.all([esbMessage(m), esbMessage({op: 'getOrganization', pl: {org: 'lanzheng'}})]);
        })
            .then(function (r) {
                response = r[0];
                m.op = "rmm_persistRequestMessage";
                m.pl.request = _initRequestMessage(paramRequest, 'Service', response.pl.serviceCode, r[1].pl.oID,company);
                return esbMessage(m);
            }).then(function () {
                return _commitTransaction(m)
            }).then(function () {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(response));
                oHelpers.sendResponse(paramResponse, 200, response);
            })
            .fail(function (r) {
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        //paramResponse.end(JSON.stringify(r));
                        oHelpers.sendResponse(paramResponse, 501, r);
                    });
            });
    });

    serviceManagementRouter.post('/perform.json', function (paramRequest, paramResponse) {
        var rc = paramRequest.body.responseCode;
        var sv = paramRequest.body.serviceCode;
        console.log("Hitting perform endpoint with ", sv, "fulfilling", rc);
        console.log("BODY WAS:",paramRequest.body);
        q()
        .then(function () {
            return workflowManager.completeService(rc,sv,{},paramRequest.user,"DO_NEXT");
        })
        //Return the payload constructed by the helper
        .then(function resolve(r) {
            oHelpers.sendResponse(paramResponse, 200, r);
            return r;
        })
        .fail(function failure(r) {
            oHelpers.sendResponse(paramResponse, 501, r);
            return r;
        });
    });

    serviceManagementRouter.get('/service.json', function (paramRequest, paramResponse, paramNext) {
        var query = {};
        if (typeof paramRequest.query._id !== 'undefined') {
            query._id = paramRequest.query._id;
        }
        var m = {
            "op": "myservice",
            "pl": {
                "query": query
            }
        };
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });


    serviceManagementRouter.get('/services.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "smm_getServices",
            mt: {p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed},
            "pl": {which:paramRequest.query.which}
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;

        console.log('m.pl----', m.pl);
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });
    serviceManagementRouter.post('/services.json', function (paramRequest, paramResponse, paramNext) {

        var metaInfo = paramRequest.body.meta;

        var m = {
            "op": "smm_queryServices",
            "pl": {},
            "mt": {p:metaInfo.p,ps:metaInfo.ps,sk:metaInfo.sk,sd:metaInfo.sd, ed:metaInfo.ed}
        };


        console.log('m.mt----', m.mt);

        q().then(function () {
            m.pl = JSON.parse(paramRequest.body.json);
            return esbMessage(m);
        })
            .then(function (r) {
                
                //rebuilding the return json according to the pagination info
                //here is issume r.pl.totals[0].length <= 5. as the limit on smm_queryServices is set to 5 for 'totals';

                var finalReturnVal = {pl:null,err:null};

                var finaResults = [[]];  //  use [[]] to keep the nested array format that is comming from smm_queryServices.
                var finalToltals = [[]];
                var tempArray  = r.pl.totals[0].concat(r.pl.results[0]);
                var page = parseInt(metaInfo.p);
                var pageSize = parseInt(metaInfo.ps);
                var totalsLength = r.pl.totals[0].length;
                var resultsLength = r.pl.results[0].length;
                var TOTALLENGTH = tempArray.length;

                if(TOTALLENGTH<= pageSize){
                    finalReturnVal.pl = r.pl;
                    finalReturnVal.meta = metaInfo;
                    finalReturnVal.meta.tc = TOTALLENGTH;
                    oHelpers.sendResponse(paramResponse, 200, finalReturnVal);

                }
                else{

                    var skipIndex = page*pageSize;
                    var skipBoundary = skipIndex+pageSize;
                    var skipMaxIndex = skipBoundary<TOTALLENGTH?skipBoundary:TOTALLENGTH;

                    var tempArray2  = tempArray.slice(skipIndex,skipMaxIndex);
                    var maxSliceIndex = (pageSize<tempArray2.length)?pageSize:tempArray2.length;

                    if(page!==0){  //no grouping/totals

                        var i = 0;

                        while(i<maxSliceIndex){
                            finaResults[0][i] = tempArray2[i];
                            i = i+1;
                        }
                    }
                    else{
                        var i = 0;

                        while(i<totalsLength){
                            finalToltals[0][i] = tempArray2[i];
                            i = i+1;
                        }
                        var j = totalsLength;
                        var k = 0;

                        while(j<maxSliceIndex){
                            finaResults[0][k] = tempArray2[j];
                            j=j+1;
                            k=k+1;
                        }
                    }
                    finalReturnVal.pl = {totals:finalToltals,results:finaResults};
                    finalReturnVal.meta = metaInfo;
                    finalReturnVal.meta.tc = TOTALLENGTH;

                    oHelpers.sendResponse(paramResponse, 200, finalReturnVal);
                }

            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });
    serviceManagementRouter.get('/servicenames.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "serviceNames",
            "pl": null
        };
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });
    serviceManagementRouter.get('/servicetypes.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "ns": "smm",
            "op": "serviceTypes",
            "pl": null
        };
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });
    serviceManagementRouter.get('/servicepointtypes.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "servicePointTypes",
            "pl": null
        };
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });
    serviceManagementRouter.post('/servicepoint.json', function (paramRequest, paramResponse, paramNext) {

        var bodyJson = JSON.parse(paramRequest.body.json);
        var company = bodyJson.company;

        var m = {
            "op": "createTransaction"
            , "pl": {
                transaction: {
                    description: 'persist ServicePoint'
                    , modules: ['smm', 'rmm']
                }
            }
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;
        var response;
        q().then(function () {
            return esbMessage(m);
        }).then(function (msg) {
            m.pl.transactionid = msg.pl.transaction._id;
            var reqMsg = JSON.parse(paramRequest.body.json),
                servicePoint = reqMsg.pl.servicePoint;
            m.op = "persistServicePoint";
            m.pl.servicePoint = servicePoint;
            return q.all([esbMessage(m), esbMessage({op: 'getOrganization', pl: {org: 'lanzheng'}})]);
        })
            .then(function (r) {
                response = r[0];
                m.op = "rmm_persistRequestMessage";
                m.pl.request = _initRequestMessage(paramRequest, 'ServicePoint', response.pl.servicePointCode, r[1].pl.oID,company);
                return esbMessage(m);
            }).then(function () {
                return _commitTransaction(m);
            }).then(function () {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(response));
                oHelpers.sendResponse(paramResponse, 200, response);
            })
            .fail(function (r) {
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                        return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'rmm_rollback'});
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        //paramResponse.end(JSON.stringify(r));
                        oHelpers.sendResponse(paramResponse, 501, r);
                    });
            });
    });
    serviceManagementRouter.put('/servicepoint.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "createTransaction"
            , "pl": {
                transaction: {
                    description: 'persist ServicePoint'
                    , modules: ['smm', 'rmm']
                }
            }
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;
        var response;
        q().then(function () {
            return esbMessage(m);
        }).then(function (msg) {
            m.pl.transactionid = msg.pl.transaction._id;
            m.pl.transaction = msg.pl.transaction;
            var reqMsg = JSON.parse(paramRequest.body.json),
                servicePoint = reqMsg.pl.servicePoint;
            m.op = "persistServicePoint";
            m.pl.servicePoint = servicePoint;
            return q.all([esbMessage(m), esbMessage({op: 'getOrganization', pl: {org: 'lanzheng'}})]);
        })
            .then(function (r) {
                response = r[0];
                m.op = "rmm_persistRequestMessage";
                m.pl.request = _initRequestMessage(paramRequest, 'ServicePoint', response.pl.servicePointCode, r[1].pl.oID);
                return esbMessage(m);
            }).then(function () {
                return _commitTransaction(m);
            }).then(function () {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(response));
                oHelpers.sendResponse(paramResponse, 200, response);
            })
            .fail(function (r) {
                //@todo: set roll back wmm (not sure why q.all don't want to play nice. fin is never called when I tried that
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                        return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'rmm_rollback'});
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        //paramResponse.end(JSON.stringify(r));
                        oHelpers.sendResponse(paramResponse, 501, r);
                    });
            });
    });
    serviceManagementRouter.get('/servicepoint.json', function (paramRequest, paramResponse, paramNext) {
        var query = {};
        if (typeof paramRequest.query._id !== 'undefined') {
            query._id = paramRequest.query._id;
        }
        var m = {
            "ns": "smm",
            "op": "myservicePoint",
            "pl": {
                "query": query
            }
        };
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });

    serviceManagementRouter.get('/myservicepoints.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "ns": "smm",
            "op": "servicePointsByCreator",
            "mt": {p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed},
            "pl": {}
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });
    serviceManagementRouter.get('/busnessrecords.json', function (paramRequest, paramResponse, paramNext) {

        var businessRecords = busnessrecords//TODO - fill this up
        var deferred = q.defer(),
            user = paramRequest.user.lanzheng.loginName;
        org = paramRequest.user.currentOrganization;

        return q()
            .then(function () {
                return esbMessage({
                    ns: "smm",
                    op: "recordsByOrganization",
                    mt: {p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed},
                    pl: {
                        loginName: user,
                        organization: org
                    }
                })
            })
            .then(function resolve(records) {
                records.pl = records.pl.map(function (ele) {
                    console.log(ele);
                    var newe = ele.toObject();
                    newe.svn = ele.svn.text;
                    return newe;
                });
                oHelpers.sendResponse(paramResponse, 200, records);
            }, function failure(err) {
                oHelpers.sendResponse(paramResponse, 400, err)
            })
    });

    serviceManagementRouter.get('/downloadBusinessRecords.json', function(paramRequest, paramResponse, paramNext){
        var businessRecords = busnessrecords//TODO - fill this up
        var deferred = q.defer(),
            user = paramRequest.user.lanzheng.loginName;
        org = paramRequest.user.currentOrganization;
        return q()
            .then(function () {
                return esbMessage({
                    ns: "smm",
                    op: "downloadRecordsByOrganization",
                    mt: {p:paramRequest.query.p,ps:paramRequest.query.ps,sk:paramRequest.query.sk,sd:paramRequest.query.sd, ed:paramRequest.query.ed},
                    pl: {
                        loginName: user,
                        organization: org
                    }
                })
            })
            .then(function resolve(newxl) {
                oHelpers.sendResponse(paramResponse, 200, {pl:{url:newxl.pl.url}});
            }, function failure(err) {
                oHelpers.sendResponse(paramResponse, 400, err)
            })
    })
    serviceManagementRouter.get('/:type.json', function (paramRequest, paramResponse, paramNext) {
        if (paramRequest.params.type === 'allbookings') {
            oHelpers.sendResponse(paramResponse, 200, allbookings);
        }
        else if (paramRequest.params.type === 'busnessrecords') {
            oHelpers.sendResponse(paramResponse, 200, busnessrecords);
        }
    });

    serviceManagementRouter.get('/servicepointDetails/:servicepointCode.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "ns": "smm",
            "op": "smm_readServicePointDetails",
            "pl": {sprc: paramRequest.params.servicepointCode}
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;
        esbMessage(m)
            .then(function (r) {
                //paramResponse.writeHead(200, {"Content-Type": "application/json"});
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                //paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                //paramResponse.end(JSON.stringify(r));
                oHelpers.sendResponse(paramResponse, 501, r);
            });
    });


    serviceManagementRouter.get('/servicepointDetails/:servicepointDetatils_id.json', function (paramRequest, paramResponse) {

        var m = {
            "ns": "smm",
            "op": "smm_readServicePointDetailByID",
            "pl": {ac: paramRequest.params.servicepointDetatils_id}
        };

        console.log('paramRequest.params.servicepointDetatils_id-----------', paramRequest.params.servicepointDetatils_id);


        esbMessage(m)
            .then(function (r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh----', r.er);
                var r = {pl: null, er: {ec: 404, em: "could not find servicepoint detail page"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });


    serviceManagementRouter.get('/search/servicepointDetails/all.json', function (paramRequest, paramResponse) {

        var m = {
            "ns": "smm",
            "op": "smm_readAllServicePointDetails",
            "pl": {
                oID: paramRequest.user.currentOrganization
                , uID: paramRequest.user.lanzheng.loginName
                , pageSize: 10
            }
        };

        console.log(' smh get all servicePoint Details------');


        esbMessage(m)
            .then(function (r) {
                //console.log(r.pl);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh----', r.er);
                var r = {pl: null, er: {ec: 404, em: "could not find servicepoint details page"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });


    serviceManagementRouter.put('/servicepointDetails/:servicepointDetatils_id.json', function (paramRequest, paramResponse) {

        console.log('paramRequest.params.servicepointDetatils_id', paramRequest.params.servicepointDetatils_id);
        console.log('paramRequest.body', paramRequest.body);


        var m = {
            "ns": "smm",
            "op": "smm_updateServicePointDetail",
            "pl": paramRequest.body
        };


        m.pl.spbi = m.pl.spbi._id;
        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;

        esbMessage(m)
            .then(function (r) {


                console.log('r', r);

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not update servicepointDetail "}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    serviceManagementRouter.post('/servicepointDetails/faq.json', function (paramRequest, paramResponse) {

        console.log('paramRequest.params.servicepointDetatils_id', paramRequest.params.servicepointDetatils_id);
        console.log('paramRequest.body', paramRequest.body);


        var m = {
            "ns": "smm",
            "op": "smm_updateServicePointDetailFAQ",
            "pl": {}
        };


        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;
        m.pl.op = 'create';
        m.pl.jsonData = paramRequest.body;

        esbMessage(m)
            .then(function (r) {

                console.log('r', r);

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not update servicepointDetail "}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    serviceManagementRouter.delete('/servicepointDetails/faq/:servicepointDetatils_id/:faq_uuid.json', function (paramRequest, paramResponse) {

        console.log('paramRequest.params.faq_id\n', paramRequest.params.faq_uuid);


        var m = {
            "ns": "smm",
            "op": "smm_updateServicePointDetailFAQ",
            "pl": {
                uID: paramRequest.user.lanzheng.loginName,
                oID: paramRequest.user.currentOrganization,
                jsonData: {uuid: paramRequest.params.faq_uuid, _id: paramRequest.params.servicepointDetatils_id},
                op: 'delete'

            }
        };

        esbMessage(m)
            .then(function (r) {
                console.log('r', r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not delete servicepointDetail  faq"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    serviceManagementRouter.put('/servicepointDetails/faq/:servicepointDetatils_id/:faq_uuid.json', function (paramRequest, paramResponse) {

        console.log('paramRequest.params.faq_id\n', paramRequest.params.faq_uuid);
        console.log('paramRequest.body\n', paramRequest.body);


        var m = {
            "ns": "smm",
            "op": "smm_updateServicePointDetailFAQ",
            "pl": {}
        };


        m.pl.uID = paramRequest.user.lanzheng.loginName;
        m.pl.oID = paramRequest.user.currentOrganization;
        m.pl.op = 'update';
        m.pl.jsonData = paramRequest.body;
        //m.pl.spbi = m.pl.spbi._id;

        esbMessage(m)
            .then(function (r) {
                console.log('r', r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not update servicepointDetail  faq"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    serviceManagementRouter.post('/servicepointDetails/description/attachment.json', function (paramRequest, paramResponse) {


        console.log('-----attachement bingo-----');


        var m = {ns: 'smm', op: 'smm_updateServicePointDetailDescription', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            photoData: null,
            ifm: null,
            op: 'create',
            jsonData: null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function (err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();

            console.log('file name:----- ', files.file.name);

            var jsonToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function (err, data) {


                m.pl.jsonData = jsonToUpdate;
                var attachment = {};
                attachment.fm = file_ext;
                attachment.fd = data;
                attachment.nm = files.file.name;
                m.pl.jsonData.description.attachment.push(attachment);

                esbMessage(m)
                    .then(function (r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse, 200, r);
                    })
                    .fail(function (r) {
                        console.log('smh error:-----');
                        console.log(r.er);
                        var r = {pl: null, er: {ec: 404, em: "could not save attachment and update profile"}};
                        oHelpers.sendResponse(paramResponse, 404, r);
                    });

            })

        });

    });

    serviceManagementRouter.put('/servicepointDetails/description/:servicepointDetatils_id.json', function (paramRequest, paramResponse) {


        console.log('-----attachement -----');


        var m = {ns: 'smm', op: 'smm_updateServicePointDetailDescription', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            op: 'update',
            _id: paramRequest.params.servicepointDetatils_id,
            jsonData: paramRequest.body
        };

        m.pl.jsonData.spbi = m.pl.jsonData.spbi._id;
        esbMessage(m)
            .then(function (r) {
                console.log('r', r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not update servicepointDetail  description"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });


    serviceManagementRouter.delete('/servicepointDetails/description/attachment/:servicepointDetatils_id/:attch_id.json', function (paramRequest, paramResponse) {


        console.log('paramRequest.params.attch_id\n', paramRequest.params.attch_id);

        var m = {ns: 'smm', op: 'smm_updateServicePointDetailDescription', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            ifm: null,
            op: 'delete',
            jsonData: {uuid: paramRequest.params.attch_id, _id: paramRequest.params.servicepointDetatils_id}
        };

        esbMessage(m)
            .then(function (r) {
                console.log('r', r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not delete servicepointDetail  attachment"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });


    });


    serviceManagementRouter.post('/servicepointDetails/upload.json', function (paramRequest, paramResponse) {


        var m = {ns: 'smm', op: 'smm_uploadServicePointDetailLogo', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            photoData: null,
            ifm: null,
            jsonData: null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function (err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            var jsonToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function (err, data) {


                console.log('data-------', data)

                m.pl.photoData = data;
                m.pl.ifm = file_ext;
                m.pl.jsonData = jsonToUpdate;

                m.pl.jsonData.spbi = m.pl.jsonData.spbi._id;

                esbMessage(m)
                    .then(function (r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse, 200, r);
                    })
                    .fail(function (r) {
                        console.log('smh error:-----');
                        console.log(r.er);
                        var r = {pl: null, er: {ec: 404, em: "could not save image and update profile"}};
                        oHelpers.sendResponse(paramResponse, 404, r);
                    });
            })

        });

    });


    serviceManagementRouter.post('/servicepointDetails/images.json', function (paramRequest, paramResponse) {

        console.log('smh post new image')

        var m = {ns: 'smm', op: 'smm_updateServicePointDetailImages', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            photoData: null,
            ifm: null,
            op: 'create',
            jsonData: null
        };


        var form = new formidable.IncomingForm();
        form.parse(paramRequest, function (err, fields, files) {
            var old_path = files.file.path,
                file_ext = files.file.name.split('.').pop();


            console.log('file name:----- ', files.file.name);

            var jsonToUpdate = JSON.parse(fields.json);

            fs.readFile(old_path, function (err, data) {


                console.log('data-------', data)

                m.pl.photoData = data;
                m.pl.ifm = file_ext;
                m.pl.jsonData = jsonToUpdate;

                esbMessage(m)
                    .then(function (r) {
                        console.log('update successfull');
                        oHelpers.sendResponse(paramResponse, 200, r);
                    })
                    .fail(function (r) {
                        console.log('smh error:-----');
                        console.log(r.er);
                        var r = {pl: null, er: {ec: 404, em: "could not save image and update profile"}};
                        oHelpers.sendResponse(paramResponse, 404, r);
                    });

            })

        });


    });

    serviceManagementRouter.delete('/servicepointDetails/images/:servicepointDetatils_id/:img_id.json', function (paramRequest, paramResponse) {

        console.log('paramRequest.params.attch_id\n', paramRequest.params.attch_id);

        var m = {ns: 'smm', op: 'smm_updateServicePointDetailImages', pl: null};

        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            op: 'delete',
            jsonData: {uuid: paramRequest.params.img_id, _id: paramRequest.params.servicepointDetatils_id}
        };


        esbMessage(m)
            .then(function (r) {
                console.log('r', r);
                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not delete servicepointDetail  image"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });
    });


    serviceManagementRouter.post('/servicepointDetails/videos.json', function (paramRequest, paramResponse) {

        console.log('smh post new video')

        var m = {ns: 'smm', op: 'smm_updateServicePointDetailVideos', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            ifm: null,
            op: 'create',
            jsonData: paramRequest.body
        };


        esbMessage(m)
            .then(function (r) {


                console.log('r', r);

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not update servicepointDetail "}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });


    serviceManagementRouter.delete('/servicepointDetails/videos/:servicepointDetatils_id/:vid_id.json', function (paramRequest, paramResponse) {

        console.log('smh ---delete video\n', paramRequest.params.vid_id);

        var m = {ns: 'smm', op: 'smm_updateServicePointDetailVideos', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            op: 'delete',
            jsonData: {uuid: paramRequest.params.vid_id, _id: paramRequest.params.servicepointDetatils_id}
        };

        esbMessage(m)
            .then(function (r) {


                console.log('r', r);

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smh error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smh error: could not delete servicepointDetail video"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    serviceManagementRouter.post('/servicepointDetails/audios.json', function (paramRequest, paramResponse) {


        console.log('smh post new audio')


        var m = {ns: 'smm', op: 'smm_updateServicePointDetailAudios', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            ifm: null,
            op: 'create',
            jsonData: paramRequest.body
        };


        esbMessage(m)
            .then(function (r) {


                console.log('r', r);

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smm error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smm error: could not update servicepointDetail "}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    serviceManagementRouter.delete('/servicepointDetails/audios/:servicepointDetatils_id/:audio_id.json', function (paramRequest, paramResponse) {

        console.log('smm ---delete audio\n', paramRequest.params.audio_id);

        var m = {ns: 'smm', op: 'smm_updateServicePointDetailAudios', pl: null};
        m.pl = {
            uID: paramRequest.user.lanzheng.loginName,
            oID: paramRequest.user.currentOrganization,
            op: 'delete',
            jsonData: {uuid: paramRequest.params.audio_id, _id: paramRequest.params.servicepointDetatils_id}
        };


        esbMessage(m)
            .then(function (r) {


                console.log('r--', r);

                oHelpers.sendResponse(paramResponse, 200, r);
            })
            .fail(function (r) {
                console.log('smm error:----- ', r);
                var r = {pl: null, er: {ec: 404, em: "smm error: could not delete servicepointDetail audio"}};
                oHelpers.sendResponse(paramResponse, 404, r);
            });

    });

    //createServicePoint

    _patchLanzhengInfo();
    return serviceManagementRouter;
};


var allbookings = {
    "pl": [{
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "王大力",
        "field4": "2014-08-05 12:23:16",
        "field5": "待办"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "李丽",
        "field4": "2014-08-05 12:23:16",
        "field5": "已完成"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "孙悟空",
        "field4": "2014-08-05 12:29:16",
        "field5": "取消"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "黄蓉",
        "field4": "2014-08-05 12:22:16",
        "field5": "过期"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "周林",
        "field4": "2014-08-05 12:23:16",
        "field5": "待办"
    }]
};


var busnessrecords = {
    "pl": [{
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "50",
        "field4": "未完成",
        "field5": "王大力"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "20",
        "field4": "已完成",
        "field5": "李丽"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "50",
        "field4": "取消",
        "field5": "孙悟空"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "50",
        "field4": "已完成",
        "field5": "黄蓉"
    }, {
        "field1": "L0121210120",
        "field2": "证照拍摄",
        "field3": "50",
        "field4": "已完成",
        "field5": "周林"
    }]
};
                        