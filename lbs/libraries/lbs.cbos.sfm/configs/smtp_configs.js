/**
 * Created by leo on 4/29/15.
 */


module.exports.get_smtp_client  = function(param_module_ns){
    var smtpConfig = require('./cbos.json').external_services.smtpconfig;
    var smtpTransport = require('nodemailer-smtp-transport');
    var smtpClient = require('nodemailer').createTransport(smtpTransport(smtpConfig.options));
    return smtpClient;
};

