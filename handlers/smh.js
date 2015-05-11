/**
 * Created by LBS006 on 12/3/14.
 */

// workspace/services


var q = require('q');
var oHelpers = require('../utilities/helpers.js');
var formidable = require('formidable');
var fs = require('fs');

function _initRequestMessage(paramRequest, type, code, adminOrg) {
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
        message = "网点"
    }
    return {
//    rdu: paramRequest.user.id//@todo: this should be set correctly
        rdo: adminOrg
        , rc: 'code'
        , rt: message + '申请 ' + code
        , rsu: paramRequest.user.lanzheng.loginName
        , rso: paramRequest.user.currentOrganization
        , rs: 10
        , rb: '请审核用户申请，拼同意或者拒绝 '
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

    function _prepopulateSpecialCaseServices(){

        var importSpecialCaseServices = require('../data/smm_special_init.json');

        importSpecialCaseServices.forEach(function(ele){
            return esbMessage({
                "ns" : ele.rename.ns,
                "op" : ele.rename.find,
                "pl" : {
                    code : ele.rename.pl
                }
            }).then(function(inUse){
                if(!inUse)
                    _persistSpecialCaseWithTransaction(ele);
            })
        })
    }

    function _persistSpecialCaseWithTransaction(input){
        var transactionid = undefined;
        return q()
            .then(function createTransaction() {
                return esbMessage({
                    "op": "createTransaction",
                    "pl": {
                        transaction: {
                            description: 'persist with transaction'
                            , modules: ['smm']
                        },
                        currentOrganization : "200000000000000000000000",
                        loginName : "a1ed"
                    }
                });
            })
            .then(function persistSpecialCase(msg) {
                transactionid = msg.pl.transaction._id;

                var m = {
                    "ns": input.persist.ns,
                    "op": input.persist.op,
                    "pl":{
                        transactionid : transactionid
                    }
                };
                m.pl[input.persist.tgtField] = input.persist.pl;
                return esbMessage(m);
            })
            .then(function rename(m) {
                return esbMessage({
                    "ns": input.rename.ns,
                    "op": input.rename.op,
                    "pl": {
                        find: m.pl[input.rename.tgtField],
                        code: input.rename.pl
                    }
                })
            })
            .then(function commitTransaction(m) {
                return _commitTransaction({pl:{transactionid:transactionid}});
            })
            .then(function resolve(r) {
                return r
            }  ,  function failure(r) {
                throw r;
            })
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
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(response));
            })
            .fail(function (r) {
                //@todo: set roll back wmm (not sure why q.all don't want to play nice. fin is never called when I tried that
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                        return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'rmm_rollback'});
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        paramResponse.end(JSON.stringify(r));
                    });
            });
    });
    serviceManagementRouter.post('/service.json', function (paramRequest, paramResponse, paramNext) {
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
                m.pl.request = _initRequestMessage(paramRequest, 'Service', response.pl.serviceCode, r[1].pl.oID);
                return esbMessage(m);
            }).then(function () {
                return _commitTransaction(m)
            }).then(function () {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(response));
            })
            .fail(function (r) {
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        paramResponse.end(JSON.stringify(r));
                    });
            });
    });

    serviceManagementRouter.post('/perform.json', function (paramRequest, paramResponse) {
        var rc = paramRequest.body.responseCode;
        var sv = paramRequest.body.serviceCode;
        console.log("Hitting perform endpoint with ", sv, "fulfilling", rc);
        q().then(function () {
            return _onServicePerformed(rc, sv, paramRequest.user)
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
    })

    function _onServicePerformed(responseCode, serviceCode, user) {
        var ln = user && user.lanzheng ? user.lanzheng.loginName : undefined,
            co = user && user.lanzheng ? user.lanzheng.currentOrganization : undefined,
            transactionid,
            service,
            enq,
            idx,
            responseInfo;

        function findFirstIndex(array, callback) {
            for (var i = 0; i < array.length; i++) {
                if (callback(array[i])) return i;
            }
            return -1;
        }

        //TODO - Touch SMM & FMM as needed
        return q()
            //START TRANSACTION
            .then(function () {
                return esbMessage({
                    op: "createTransaction",
                    pl: {
                        loginName: ln,
                        currentOrganization: co,
                        transaction: {
                            description: 'Record service performance'
                            , modules: ['bmm', 'smm']
                        }
                    }
                })
            })
            //GET SERVICE INFO
            .then(function (tid) {
                transactionid = tid.pl.transaction._id;
                console.log("Performance associated with transaction id = ", transactionid);
                return esbMessage({
                    ns: "smm",
                    op: "smm_getService",
                    pl: {
                        code: serviceCode,
                        loginName: ln,
                        currentOrganization: co
                    }
                })
            })
            //FETCH RESPONSE INFO
            .then(function (serviceResponse) {
                service = serviceResponse.pl.toObject();
                return esbMessage({
                    ns: "bmm",
                    op: "bmm_getResponse",
                    pl: {
                        code: responseCode,
                        loginName: ln,
                        currentOrganization: co
                    }
                });
            })
            //UPDATE RESPONSE STATUS TO 'PERFORMED'
            .then(function (response) {
                responseInfo = response;
                idx = response && response.sb && response.sb.length > 0
                    ? findFirstIndex(response.sb, function (e) {
                    return (true || e.svid == service._id) && e.cvs == 20
                })//IS ISSUED
                    : -1;
                if (idx >= 0) {
                    response.sb[idx].cvs = 40;//PERFORMED
                    response.sb = response.sb[idx]
                    var rpl = response;
                    return esbMessage({
                        "ns": "bmm",
                        "op": "bmm_persistResponse",
                        "pl": {
                            response: rpl,
                            loginName: ln,
                            currentOrganization: co
                        }
                    });
                }
                else throw {pl: null, er: {em: "Invalid service performance - request not issued", ec: 1567}};
            })
            //PROCESS PERFORMANCE
            .then(function (esbResponse) {
                return esbMessage({
                    ns: "smm",
                    op: "smm_spawnBusinessRecord",
                    pl: {
                        response: {
                            acn: responseInfo.acn//activity name
                            , ac: responseInfo.dp.ac// activity code
                            , rc: responseCode//response code
                            , serviceCode: serviceCode// service code
                            , svn: service.serviceName// service name code
                            , st: 20//IS ISSUED
                            , uid: ln// user login account , customer who bought the service
                            , usn: responseInfo.ow.uid// user name , customer who bought the service
                            , svp: responseInfo.sb[idx].svp//
                            , service: ""//{ type: paramMongoose.Schema.Types.ObjectId, ref: 'services',required:true }
                            , oID: service.ct.oid
                        },
                        loginName: ln,
                        currentOrganization: org,
                        transactionid: transactionid
                    }
                })
            })
            //FETCH RESPONSE INFO
            .then(function (processResponse) {
                return esbMessage({
                    ns: "bmm",
                    op: "bmm_getResponse",
                    pl: {
                        code: responseCode,
                        loginName: ln,
                        currentOrganization: co
                    }
                });
            })
            //UPDATE RESPONSE STATUS TO 'PROCESSED'
            .then(function (response) {
                idx = response && response.sb && response.sb.length > 0
                    ? findFirstIndex(response.sb, function (e) {
                    return (true || e.svid == service._id) && e.cvs == 40
                })//IS PERFORMED
                    : -1;
                if (idx >= 0) //This service has been processed and seen satisfactory
                {
                    response.sb[idx].cvs = 50;//PROCESSED
                    response.sb = response.sb[idx];
                    return esbMessage({
                        "ns": "bmm",
                        "op": "bmm_persistResponse",
                        "pl": {
                            response: response,
                            loginName: ln,
                            currentOrganization: co
                        }
                    })
                }
                else  throw {pl: null, er: {em: "Invalid service performance - failed processing", ec: 1568}};
            })
            //COMMIT TRANSACTION
            .then(function (esbResponse) {
                enq = esbResponse;
                if (transactionid) {
                    console.log("COMMITTING TRANSACTION", transactionid.pl.transaction._id);
                    return _commitTransaction({pl: {transactionid: transactionid.pl.transaction._id}});
                }
                return false;
            })
            //RESOLVE & SCHEDULE NEXT
            .then(function resolve(r) {
                _scheduleNextOrder(enq, idx + 1);
                return {pl: r, er: null};
            }, function failure(r) {
                console.log("Rolling back service performance transaction. Failure : ", r);
                return _rollBackTransaction2({pl: {transactionid: transactionid.pl.transaction._id}});
            });
    }

    function _scheduleNextOrder(response, index) {
        var ln = undefined;
        var co = undefined;
        var transactionid = undefined;
        return q()
            //INIT TRANSACTION
            .then(function () {
                return esbMessage({  //and a transactionid
                    op: "createTransaction",
                    pl: {
                        loginName: ln,
                        currentOrganization: org,
                        transaction: {
                            description: 'Notify service point of response intent'
                            , modules: ['bmm', 'smm']
                        }
                    }
                })
            })
            //INSPECT RESPONSE STATUS
            .then(function () {
                if (!response)
                    throw {pl: null, er: {ec: 1920, em: "No response passed."}};
                else if (!response.sb || response.sb.length == 0)
                    throw {pl: null, er: {ec: 1921, em: "No response services available."}};
                else if (!response.sb.length > index || !response.sb[index])
                    throw {pl: null, er: {ec: 1922, em: "Index not availabe in response services list."}};
                else if (response.sb[index].cvs != 10)
                    throw {
                        pl: null,
                        er: {
                            ec: 1923,
                            em: "Attempting to issue a " + response.sb[index].cvs + " service. Must be PENDING (10)."
                        }
                    };
                else return true;
            })
            //UPDATE RESPONSE STATUS
            .then(function () {
                response.sb[index].cvs = 20//ISSUED
                return esbMessage({
                    "ns": "bmm",
                    "op": "bmm_persistResponse",
                    "pl": {
                        sb: response.sb,
                        loginName: ln,
                        currentOrganization: co,
                        transactionid: transactionid
                    }
                })
            })
            //FETCH SERVICE INFO
            .then(function () {
                if (response.sb.length <= index) throw "no services to order";
                return esbMessage({
                    ns: "smm",
                    op: "smm_getService",
                    pl: {
                        qid: response.sb[index].svid,
                        loginName: ln,
                        currentOrganization: co,
                        transactionid: transactionid
                    }
                })
            })
            //SPAWN BUSINESS RECORD
            .then(function (serviceResponse) {
                var service = serviceResponse.pl;
                //console.log("SPAWNING USING \nSERVICE:",service,"\nRESPONSE:",responseInfo);
                return esbMessage({
                    ns: "smm",
                    op: "smm_spawnBusinessRecord",
                    pl: {
                        response: {
                            acn: response.acn//activity name
                            , rc: responseCode//response code
                            , serviceCode: service.serviceCode// service code
                            , svn: response.svn// service name code
                            , st: 10// 'issued' status
                            , uid: ln// user login account , customer who bought the service
                            , usn: response.usn// user name , customer who bought the service
                            , svp: response.svp// service price
                            , service: service._id//{ type: paramMongoose.Schema.Types.ObjectId, ref: 'services',required:true }
                        },
                        loginName: ln,
                        currentOrganization: org,
                        transactionid: transactionid
                    }
                })
            })
            //TODO - Handle 'no more' case and close response
            //FINISH TRANSACTION
            .then(function resolve(r) {
                if (transactionid) {
                    console.log("COMMITTING TRANSACTION", transactionid.pl.transaction._id);
                    return _commitTransaction({pl: {transactionid: transactionid.pl.transaction._id}});
                }
                return {pl: r, er: null};
            }, function failure(r) {
                //TODO - Handle failure of next order
                console.log("FAILED TO SCHEDULE NEXT ORDER.", r);
                return _rollBackTransaction2({pl: {transactionid: transactionid.pl.transaction._id}, er:r});
            })
    }

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
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });
    serviceManagementRouter.get('/services.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "servicesByCreator",
            "pl": {}
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;
        esbMessage(m)
            .then(function (r) {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });
    serviceManagementRouter.post('/services.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "smm_queryServices",
            "pl": {}
        };
        q().then(function () {
            m.pl = JSON.parse(paramRequest.body.json);
            return esbMessage(m);
        })
            .then(function (r) {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });
    serviceManagementRouter.get('/servicenames.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "serviceNames",
            "pl": null
        };
        esbMessage(m)
            .then(function (r) {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
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
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });
    serviceManagementRouter.get('/servicepointtypes.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "op": "servicePointTypes",
            "pl": null
        };
        esbMessage(m)
            .then(function (r) {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });
    serviceManagementRouter.post('/servicepoint.json', function (paramRequest, paramResponse, paramNext) {
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
                m.pl.request = _initRequestMessage(paramRequest, 'ServicePoint', response.pl.servicePointCode, r[1].pl.oID);
                return esbMessage(m);
            }).then(function () {
                return _commitTransaction(m);
            }).then(function () {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(response));
            })
            .fail(function (r) {
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                        return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'rmm_rollback'});
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        paramResponse.end(JSON.stringify(r));
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
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(response));
            })
            .fail(function (r) {
                //@todo: set roll back wmm (not sure why q.all don't want to play nice. fin is never called when I tried that
                return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'smm_rollback'})
                    .then(function () {
                        return esbMessage({pl: {transactionid: m.pl.transactionid}, op: 'rmm_rollback'});
                    })
                    .fin(function () {
                        _rollBackTransaction(m);
                        paramResponse.writeHead(501, {"Content-Type": "application/json"});
                        if (r.er && r.er.ec && r.er.ec > 1000) {
                            r.er.em = 'Server poblem....';
                        }
                        paramResponse.end(JSON.stringify(r));
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
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });

    serviceManagementRouter.get('/myservicepoints.json', function (paramRequest, paramResponse, paramNext) {
        var m = {
            "ns": "smm",
            "op": "servicePointsByCreator",
            "pl": {}
        };
        m.pl.loginName = paramRequest.user.lanzheng.loginName;
        m.pl.currentOrganization = paramRequest.user.currentOrganization;
        esbMessage(m)
            .then(function (r) {
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
            });
    });
    serviceManagementRouter.get('/busnessrecords.json', function (paramRequest, paramResponse, paramNext) {

        var businessRecords = busnessrecords//TODO - fill this up
        console.log("HIT BUSINESSRECORDS")
        var deferred = q.defer(),
            user = paramRequest.user.lanzheng.loginName;
        org = paramRequest.user.currentOrganization;

        return q()
            .then(function () {
                return esbMessage({
                    ns: "smm",
                    op: "recordsByOrganization",
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
                console.log("records are now :", records);
                oHelpers.sendResponse(paramResponse, 200, records);
            }, function failure(err) {
                console.log(err);
                oHelpers.sendResponse(paramResponse, 400, err)
            })
    });
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
                paramResponse.writeHead(200, {"Content-Type": "application/json"});
                paramResponse.end(JSON.stringify(r));
            })
            .fail(function (r) {
                paramResponse.writeHead(501, {"Content-Type": "application/json"});
                if (r.er && r.er.ec && r.er.ec > 1000) {
                    r.er.em = 'Server poblem....';
                }
                paramResponse.end(JSON.stringify(r));
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

    _prepopulateSpecialCaseServices();
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
                        