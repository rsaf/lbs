/**
 * Created by leo on 9/16/15.
 */

var nmm_module_path = '../../../libraries/lbs.cbos.nmm/nmm_interface.js';
var nmm = require(nmm_module_path);
var chai = nmm.chai();

var clm_init_message = {
    "pl": {dep: {"nmm": nmm}}
};
var clm_module_path = '../../../libraries/lbs.cbos.clm/clm_interface.js';
var clm = require(clm_module_path).init(clm_init_message);

var sfm_init_message = {
    "pl": {dep: {"nmm": nmm, "clm": clm}}
};
var sfm_module_path = '../../../libraries/lbs.cbos.sfm/sfm_interface.js';
var sfm = require(sfm_module_path).init(sfm_init_message);


//--- module specific configurations --//

var ams_init_message = {
    "pl": {dep: {"nmm": nmm, "clm": clm, "sfm": sfm}, mc: null}
};
var ams = require("../ams_interface.js");


var bms_init_message = {
    "pl": {dep: {"nmm": nmm, "clm": clm, "sfm": sfm}}
};
var bms = require("../../lbs.cbos.bms/bms_interface.js");

var eid = null;
var lid = null;
var enm = null;

describe('ams test suites', function () {
    describe("ams create entity test suite", function () {
        before(function (done) {
            bms.init(bms_init_message).then(function success(r) {
                ams_init_message.pl.mc = bms.bms_create_blob;
                console.log("reply from bms.init.....%s ", r.pl.ss);
                ams.init(ams_init_message).then(function success(r) {
                    console.log("reply from ams.init.....%s ", r.pl.ss);
                    done();
                });
            });
        });

        //it("create entities operations", function (done) {
        //    var message1 = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_create_entity",
        //        "pl": {
        //            "navigationtop": {
        //                "name": "navigationtop",
        //                "desc": "top navigations for apps links",
        //                "apps": [
        //                    {
        //                        "name": "DESKTOP",
        //                        "linkTo": "desktop",
        //                        "icons": {
        //                            "idefault": "cbos_layouts/desktop/theme/images/desktop_menu_gray.jpg",
        //                            "iselected": "cbos_layouts/desktop/theme/images/desktop_menu_blue.jpg"
        //                        }
        //                    },
        //                    {
        //                        "name": "CRM",
        //                        "linkTo": "desktop.app({appName:'crm'})",
        //                        "icons": {
        //                            "idefault": "cbos_layouts/desktop/theme/images/crm_menu_gray.jpg",
        //                            "iselected": "cbos_layouts/desktop/theme/images/crm_menu_blue.jpg"
        //                        }
        //                    },
        //                    {
        //                        "name": "HRM",
        //                        "linkTo": "desktop.app({appName:'hrm'})",
        //                        "icons": {
        //                            "idefault": "cbos_layouts/desktop/theme/images/hrm_menu_gray.jpg",
        //                            "iselected": "cbos_layouts/desktop/theme/images/hrm_menu_blue.jpg"
        //                        }
        //                    }
        //                ]
        //            }
        //        }
        //    };
        //    ams.ams_create_entity(message1).then(function success(r) {
        //        console.log("Create===== entity %s", JSON.stringify(r));
        //        eid = r.pl.navigationtop.eid;
        //        enm = r.pl.navigationtop.name;
        //        chai.expect(r.pl.navigationtop.name).to.equal(message1.pl.navigationtop.name);
        //        done();
        //
        //    }).then(null, function failure(er) {
        //     console.log("failuire message %s", er);
        //        done();
        //    });
        //
        //});

        //it("create layout operations", function (done) {
        //    var message1 = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_create_entity",
        //        "pl": {
        //            "layout": {
        //                "name": "layout1",
        //                "type": "2x2y"
        //            }
        //        }
        //    };
        //    ams.ams_create_entity(message1).then(function success(r) {
        //        //console.log("Create layout %s", JSON.stringify(r));
        //        lid = r.pl.layout.eid;
        //        chai.expect(r.pl.layout.name).to.equal(message1.pl.layout.name);
        //        chai.expect(r.pl.layout.type).to.equal(message1.pl.layout.type);
        //        done();
        //
        //    }).then(null, function failure(er) {
        //        console.log("failuire message %s", er);
        //        done();
        //    });
        //
        //});


        //it("delete entity operation", function (done) {
        //    var message3 = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_delete_entity",
        //        "pl": {
        //            "navigationtop": {
        //                "eid": "56287a454a055c9b5fe70c37",
        //                "name":"" ,
        //                "apps":
        //                {
        //                    "aid": "562737fc7b4c4fec593b8201",
        //                    "lnid": "562737fc7b4c4fec593b8203",
        //                    "linkTo": "desktop.app({appName:'pms'})",
        //                    "name": "PMS",
        //                    "_id": "56287a454a055c9b5fe70c52",
        //                    "icons": {
        //                        "iselected": "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg",
        //                        "idefault": "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg"
        //                    },
        //                    "dlayout": {
        //                        "lid": "562737fc7b4c4fec593b8202",
        //                        "ltu": "layouts/58523c84-f5e8-410e-9666-c9fae0647b68.html"
        //                    }
        //                }
        //            }
        //        }
        //    };
        //    ams.ams_delete_entity(message3).then(function success(r) {
        //        console.log("Update======= entity %s",JSON.stringify(r));
        //        eid = r.pl.navigationtop.eid;
        //        enm = r.pl.navigationtop.name;
        //        chai.expect(r.pl.navigationtop.name).to.equal(message3.pl.navigationtop.name);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("failuire message %s", JSON.stringify(er));
        //        done();
        //    });
        //
        //});


        //it("update entity operation", function (done) {
        //    var message3 = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_update_entity",
        //        "pl": {
        //            "navigationtop": {
        //                "eid": "562737ae7b4c4fec593b81e4",
        //                "name":"navigationtop_updated2" ,
        //                "apps":
        //                {
        //                    "aid": "562737fc7b4c4fec593b8201",
        //                    "lnid": "562737fc7b4c4fec593b8203",
        //                    "linkTo": "desktop.app({appName:'pms'})",
        //                    "name": "PMS",
        //                    "_id": "562737fc7b4c4fec593b8205",
        //                    "icons": {
        //                        "iselected": "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg",
        //                        "idefault": "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg"
        //                    },
        //                    "dlayout": {
        //                        "lid": "562737fc7b4c4fec593b8202",
        //                        "ltu": "layouts/58523c84-f5e8-410e-9666-c9fae0647b68.html"
        //                    }
        //                }
        //            }
        //        }
        //    };
        //    ams.ams_update_entity(message3).then(function success(r) {
        //        console.log("Update======= entity %s",r);
        //        eid = r.pl.navigationtop.eid;
        //        enm = r.pl.navigationtop.name;
        //        chai.expect(r.pl.navigationtop.name).to.equal(message3.pl.navigationtop.name);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("failuire message %s", JSON.stringify(er));
        //        done();
        //    });
        //
        //});


        //front end test
        //lbs.cbos.message({"op": "ams_create_entity_done","pl": {"table": { "eid": "5620a88fbf2ec90f3c2148a3"}} });
        //lbs.cbos.message({"sqm": {"parent": "xyhz"}, "op": "ams_create_entity_done","pl": {"table": { "eid": "56226419275d45de44945ee8"}} });
        //lbs.cbos.message({"sqm":{"parent":"56226419275d45de44945ee7"},"op":"ams_read_entities","pl":{"tables":{}}});
        //
        //it("create entity done operation", function (done) {
        //    var message = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //         "sqm": {"ct": "forms"},
        //         "op": "ams_create_entity_done",
        //         "pl": {
        //            "table": {
        //                "eid": "563b16ca46400945551b0262"
        //            }
        //        }
        //    };
        //    ams.ams_create_entity_done(message).then(function success(r) {
        //        console.log("Read====== entity %s", JSON.stringify(r))
        //        //chai.expect(r.pl.table.eid).to.equal(message1.pl.table.eid);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("failuire message %s", JSON.string(er));
        //        done();
        //    });
        //
        //});


        //it("get user desktop operation", function (done) {
        //    var message = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "oc": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_get_user_desktop_apps",
        //        "pl": {
        //            "desktop": {
        //                "eid": "5641dabfcfabadd48646eef7"
        //            }
        //        }
        //    };
        //    ams.ams_get_user_desktop_apps(message).then(function success(r) {
        //        console.log("Read====== entity %s", JSON.stringify(r))
        //        //chai.expect(r.pl.table.eid).to.equal(message1.pl.table.eid);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("failuire message %s", JSON.string(er));
        //        done();
        //    });
        //
        //});

        it("get user navigationtop operation", function (done) {
            var message = {
                "ac": {"uid": "sa", "oid": "500000000000000000000000"},
                "oc": {"uid": "sa", "oid": "500000000000000000000000"},
                "op": "ams_get_user_top_nav",
                "pl": {
                    "navigationtop": {
                    }
                }
            };
            ams.ams_get_user_top_nav(message).then(function success(r) {
                console.log("Read====== entity %s", JSON.stringify(r))
                //chai.expect(r.pl.table.eid).to.equal(message1.pl.table.eid);
                done();
            }).then(null, function failure(er) {
                console.log("failuire message %s", JSON.string(er));
                done();
            });

        });


        //it("get app components", function (done) {
        //    var message = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_get_app_components",
        //        "pl": {
        //            "app": {
        //                "eid": "5629bfa8b586d54864788847"
        //            }
        //        }
        //    };
        //    ams.ams_get_app_components(message).then(function success(r) {
        //        console.log("Success reply message %s", JSON.stringify(r))
        //        //chai.expect(r.pl.table.eid).to.equal(message2.pl.table.eid);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("Failure error message %s", JSON.string(er));
        //        done();
        //    });
        //
        //});


        //it("get canvas components", function (done) {
        //    var message = {
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_get_canvas_components",
        //        "pl": {
        //            "canvas": {
        //                "eid": "562e3f4a2edc4c8618a70ebb",
        //                 "name": "appname"
        //            }
        //        }
        //    };
        //    ams.ams_get_canvas_components(message).then(function success(r) {
        //        console.log("Success reply message %s", JSON.stringify(r))
        //        //chai.expect(r.pl.table.eid).to.equal(message2.pl.table.eid);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("Failure error message %s", JSON.string(er));
        //        done();
        //    });
        //
        //});


        //it("add cbos compenent operation", function (done) {
        //    var message2 = {
        //        "dns": "ams",
        //        "ac": {"uid": "sa", "oid": "500000000000000000000000"},
        //        "op": "ams_add_cbos_component",
        //        "pl": {
        //            "layout": {
        //                "eid": "56272f640905a27f58a3a465",
        //                "lcp": {"cpd": '<cbos-table-runtime tid="562726e8d3a26046586cdf47" vtu="tables/5ecb9074-6ba8-4eb7-a6ee-fde4f16aec79.html" title="SSSS"></cbos-table-runtime>',
        //                    "lig":'cbos-y1-grid'
        //                }
        //            }
        //        }
        //    };
        //    ams.ams_add_cbos_component(message2).then(function success(r) {
        //        console.log("Read====== entity %s", JSON.stringify(r))
        //        //chai.expect(r.pl.table.eid).to.equal(message2.pl.table.eid);
        //        done();
        //    }).then(null, function failure(er) {
        //        console.log("failuire message %s", JSON.string(er));
        //        done();
        //    });
        //
        //});


    });

});

