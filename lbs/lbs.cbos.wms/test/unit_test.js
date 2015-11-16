/**
 * Created by leo on 9/16/15.
 */

var nmm_module_path = '../../libraries/lbs.cbos.nmm/nmm_interface.js';
var nmm = require(nmm_module_path);
var chai = nmm.chai();

var clm_init_message = {
    "pl": {dep: {"nmm": nmm}}
};
var clm_module_path = '../../libraries/lbs.cbos.clm/clm_interface.js';
var clm = require(clm_module_path).init(clm_init_message);

var sfm_init_message = {
    "pl": {dep: {"nmm": nmm, "clm": clm}}
};
var sfm_module_path = '../../libraries/lbs.cbos.sfm/sfm_interface.js';
var sfm = require(sfm_module_path).init(sfm_init_message);


//--- module specific configurations --//

var wms_init_message = {
    "pl": {dep: {"nmm": nmm, "clm": clm, "sfm": sfm}}
};
var wms = require("../wms_interface.js");

describe('wms test suites', function () {
    before(function (done) {
        wms.init(wms_init_message).then(function success(r){
            console.log("reply from wms.init......%s", r.pl.ss);
            done();
        })
    })

    describe("wms create workflow suite", function(){

        it("creates workflow instance given a valid template", function(done){
            var m = {
                wf:{
                    wtk:"CBWD_UNITTEST_HALFAUTO"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.er).to.equal(null);
                chai.expect(r.pl).to.not.equal(null);
            })
        })

        it("gracefully fails when template not found", function(done){
            var m = {
                wf:{
                    wtk:"I_AM_NOT_A_TEMPLATE_KEY"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.er).to.not.equal(null);
                chai.expect(r.pl).to.equal(null);
            })
        })

        it("reinstantiates inprogress workflow given an id", function(done){
            var m1 = {
                wf:{
                    wtk:"CBWD_UNITTEST_HALFAUTO"
                }
            }
            var m2 = {
                wf:{
                    wid:"UNKNOWN"
                }
            }
            wms.wms_process(m1).then(function(r){
                chai.expect(r.pl.wf).to.exist();
                m2.wf.wid = r.pl.wf.wid;
                return wms.process(m2).then(function(r){
                    chai.expect(r.er).to.equal(null);
                    chai.expect(r.pl).to.not.equal(null);
                })
            })
        })

        it("gracefully creates a new workflow instance with the given id if it doesn't exist and template specified", function(done){
            var m = {
                wf:{
                    wid:"WHAT_IS_THIS_THIS_ISNT_A_REAL_ID",
                    wtk:"CBWD_UNITTEST_HALFAUTO"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.er).to.equal(null);
                chai.expect(r.pl).to.not.equal(null);
            })
        })

        it("gracefully fails if given an id for a non-existent workflow instance, but no template specified", function(done){
            var m = {
                wf:{
                    wid:"WHAT_IS_THIS_THIS_ISNT_A_REAL_ID",
                    wtk:"I_AM_NOT_A_TEMPLATE_KEY"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.er).to.not.equal(null);
                chai.expect(r.pl).to.equal(null);
            })
        })
    })
    describe("wms upload workflow design", function(done){

        it("saves invalid template design, but marks it as unpublished", function(done){
            var m = {

            }
            wms.wms_upload_workflow_design(m).then(function(r){
                chai.expect(r.pl).to.not.equal(null)
                chai.expect(r.er).to.equal(null)
                chai.expect(r.pl.published).to.equal(false)
            })
        })

        it("saves valid template design, but marks it as unpublished", function(done){
            var m = {

            }
            wms.wms_upload_workflow_design(m).then(function(r){
                chai.expect(r.pl).to.not.equal(null)
                chai.expect(r.er).to.equal(null)
                chai.expect(r.pl.published).to.equal(false)
            })
        })

        it("successfully publishes valid template design", function(done){
            var m = {

            }
            wms.wms_publish_workflow_design(m).then(function(r){
                chai.expect(r.pl).to.not.equal(null)
                chai.expect(r.er).to.equal(null)
                chai.expect(r.pl.published).to.equal(true)
            })
        })

        it("successfully rejects publication of invalid template design", function(done){
            var m = {

            }
            wms.wms_publish_workflow_design(m).then(function(r){
                chai.expect(r.pl).to.equal(null)
                chai.expect(r.er).to.not.equal(null)
                chai.expect(r.pl.published).to.equal(false)
            })
        })
    })
    describe("wms intraworkflow testing", function(done){
        it("successfully reaches end state in an automatic workflow", function(done){
            var m = {
                wf : {
                    wtk : "CBWD_UNITTEST_FULLAUTO"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.pl).to.not.equal(null)
                chai.expect(r.er).to.equal(null)
                chai.expect(r.pl.finished).to.equal(true)
            })
        })
    })
    describe("wms rollback testing", function(done){
        it("successfully rollbacks a workflow in the middle of operation", function(done){
            var m = {
                wf:{
                    wtk:"CBWD_UNITTEST_HALFAUTO"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.pl).to.not.equal(null);
                chai.expect(r.er).to.equal(null);
                chai.expect(r.pl.wf.wid).to.exist();
                chai.expect(r.pl.isFinished).to.equal(false);
                m.wf.wid = r.pl.wf.wid
                return wms.wms_rollback_workflow(m)
            }).then(function (r){
                //rolledback
            })
        })
        it("gracefully fails if workflow isn't a valid one", function(done){
            var m = {
                wf: {
                    wtk:"CBWD_UNITTEST_HALFAUTO"
                }
            }
            wms.wms_process(m).then(function(r){
                chai.expect(r.pl).to.not.equal(null);
                chai.expect(r.er).to.equal(null);
                chai.expect(r.pl.wf.wid).to.exist();
                chai.expect(r.pl.isFinished).to.equal(false);
                m.wf.wid = r.pl.wf.wid
                return wms.wms_rollback_workflow(m)
            }).then(function (r){

            })
        })
    })

});