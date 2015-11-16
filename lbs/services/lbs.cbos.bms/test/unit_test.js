/**
 * Created by leo on 9/16/15.
 */


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

var bms_init_message = {
    "pl": {dep: {"nmm": nmm, "clm": clm, "sfm": sfm}}
};
var bms = require("../bms_interface.js");

describe('bms test suites. ', function () {
    describe("blob operations test suite. ", function () {
        before(function (done) {
            bms.init(bms_init_message).then(function success(r) {
                console.log("reply from bms.init.....%s ", r.pl.ss);
                done();
            });
        });

        it("update blob operation. ", function (done) {
            var message1 = {
                "pl": {
                    "form": {
                        "uuid": "ffca346d-921d-47f8-9607-3323b4589cea",
                        "blob": "my template ",
                        "ext": "html"
                    }
                }
            }
            bms.bms_update_blob(message1).then(function success(r) {
                chai.expect(r.pl.form.uuid).to.equal(message1.pl.form.uuid);
                chai.expect(r.pl.form.uuid).to.equal("ffca346d-921d-47f8-9607-3323b4589cea");
                done();
            }).then(null, function failure(e) {
                console.log("failuire message %s", e);
                done();
            });

        });
    });

});

