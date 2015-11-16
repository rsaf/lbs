/**
 * Created by leo on 8/10/15.
 */

var q = null;
var bcrypt = null;
var mongoose = null;
var esb_messenger = null;
var user_schema = null;
var user_model = null;
var organization_schema = null;
var organization_model = null;

exports.operations = [
    init,
    ups_create_user,
    ups_update_user,
    ups_read_user,
    ups_register_user,
    ups_create_organization,
    ups_verify_user_credentials,

];

exports.operations.forEach(function (op) {
    exports[op.name] = op;
});


function init(m) {
    var r = {"pl": null, "er": null};
    esb_messenger = m.pl.mc;
    q = m.pl.dep.nmm.q();
    bcrypt = m.pl.dep.nmm.bcrypt();

    var deferred = q.defer();
    var p0 = m.pl.dep.sfm.get_mongoose({"sns": "ups"});

    q.all([p0]).then(function (r) {
        mongoose = r[0].pl.so;
        user_schema = require('./models/user.js')(mongoose);
        user_schema.methods.setValues =  m.pl.dep.clm.set_entity_values();
        user_schema.methods.setCreated =  m.pl.dep.clm.set_entity_created();
        user_schema.methods.setModified =  m.pl.dep.clm.set_entity_modified();
        user_model = mongoose.model('users', user_schema);

        organization_schema = require('./models/organization.js')(mongoose);
        organization_schema.methods.setValues =  m.pl.dep.clm.set_entity_values();
        organization_schema.methods.setCreated =  m.pl.dep.clm.set_entity_created();
        organization_schema.methods.setModified =  m.pl.dep.clm.set_entity_modified();
        organization_model = mongoose.model('organizations', organization_schema);
        deferred.resolve({pl: {"ss": "ups initiation done!"}, er: null});
    }).then(null, function failure(err) {
        deferred.reject({pl: null, er: {ec: 1003, em: err}});
    })
    return deferred.promise;
}


function ups_create_user(m) {
    var r = {"pl": {}, "er": {}};
    return organization_model.findById(m.pl.user.organizationID).exec().then(function success(paramOrganization) {
        if (paramOrganization) {
            console.log("UPS: success method for finding organization %s ", JSON.stringify(paramOrganization));
            return paramOrganization;
        }
        else {
            console.log("UPS: no associated organization found, a new one will be created ");
            var organization = new organization_model();
            organization._id = m.pl.user.organizationID;
            return organization.save();
        }
    }).then(function success(paramOrganization) {
        console.log("UPS: success method for creating organization %s", JSON.stringify(paramOrganization));
        var user = new user_model();
        user.cl.ln = m.pl.user.username;
        //console.log("UPS: hashing password %s ", m.pl.password);
        user.cl.hpw = bcrypt.hashSync(m.pl.user.password, bcrypt.genSaltSync(8), null);
        user.ut = m.pl.user.usertype;
        user.em = m.pl.user.email;
        user.mb = m.pl.user.mobile;
        user.ual =  m.pl.user.avatar;
        user.ufn = m.pl.user.fullname;
        user.ur = m.pl.user.role;
        user.org = paramOrganization;
        return user.save()
    }).then(function success(paramUser) {
        r.pl.user = {
            "organizationID": paramUser.org,
            "username": paramUser.cl.ln,
            "usertype": paramUser.ut,
            "logincount": paramUser.cl.lc,
            "loginstatus": paramUser.ls,
            "userstatus": paramUser.us,
            "id": paramUser._id,
            "avatar": paramUser.ual,
            "fullname": paramUser.ufn,
            "role": paramUser.ur,
            "mobile": paramUser.mb,
            "email": paramUser.em
        };
        console.log("UPS: success method for creating creating user %s", JSON.stringify(r));
        return r;
    }).then(null, function failure(error) {
        console.log("UPS: failure for creating creating user with error %s", error);
        r.er = {"ec": 8008 , "em" : error};
        return r;
    });
}


function ups_update_user(m) {
    var r = {"pl": {}, "er": {}};
    return user_model.findById(m.pl.user.id).exec().then(function success(user) {
        if (user) {
            console.log("UPS: success method for finding user %s ", JSON.stringify(user));
            user.setValues(m.pl.user);
            return user.save();
        }
        else {
            console.log("UPS: no associated user found, no updates will be made ");
            //@Todo: needs proper testing to ensure the return path hits the failure route
            throw("no user found ..");
        }
    }).then(function success(user){
        r.pl.user = user;
        return r;
    }).then(null, function failure(er){
        r.er = {"ec": 8050 , "em" : er};
        return r;
    });
}


function ups_register_user(m) {
    var r = {"pl": {}, "er": {}};
    var organization = new organization_model();
    return organization.save().then(function success(paramOrganization) {
        console.log(r);
        var user = new user_model();
        user.cl.un = m.pl.user.username;
        user.cl.hpw = bcrypt.hashSync(m.pl.user.password, bcrypt.genSaltSync(8), null);
        user.ut = m.pl.user.usertype;
        user.org = paramOrganization;
        return user.save()
    }).then(function success(paramUser) {
        console.log(paramUser);
        r.pl.user = {
            "organizationID": paramUser.org,
            "username": paramUser.cl.ln,
            "usertype": paramUser.ut,
            "logincount": paramUser.cl.lc,
            "loginstatus": paramUser.ls,
            "userstatus": paramUser.us,
            "id": paramUser._id
        };
        console.log("UPS: success method for creating creating user %s", JSON.stringify(r));
        return r;
    }).then(null, function failure(error) {
        r.er = {"ec": 8008 , "em" : error};
        return r;
    });
}

function ups_create_organization(m) {
    var r = {"pl": {}, "er": {}};
    var deferred = q.defer();
    var organization = new organization_model();
    organization.save().then(function success(paramOrganization) {
        console.log(paramUser);
        r.pl.organization = paramOrganization;
        deferred.resolve(r);

    }).then(null, function failure(error) {
        r.er = error;
        deferred.reject(r);
    });
    return deferred.promise;
}

function ups_verify_user_credentials(m) {
    var r = {"pl": {}, "er": {}};
    console.log("UPS: starting to verify user login credentials %s", JSON.stringify(m));
    return user_model.findOne({$or:[{"cl.ln": m.pl.user.username},{"mb": m.pl.user.username}]}).exec().then(function success(paramUser) {
        if (paramUser) {
            if (bcrypt.compareSync(m.pl.user.password, paramUser.cl.hpw)) {
                var logincount = paramUser.cl.lc + 1;
                paramUser.cl.lc = logincount;
                paramUser.ls = true;
                paramUser.save();
                r.pl.user = {
                    "username": paramUser.cl.ln,
                    "logincount": paramUser.cl.lc,
                    "loginstatus": paramUser.ls,
                    "userstatus": paramUser.us,
                    "usertype": paramUser.ut,
                    "organizationID": paramUser.org,
                    "mobile": paramUser.mb,
                    "id": paramUser._id,
                    "aid": paramUser.aid,
                    "nid":paramUser.nid,
                    "avatar": paramUser.ual,
                    "fullname": paramUser.ufn,
                    "role": paramUser.ur,
                    "email": paramUser.em
                };
                console.log("UPS: sending back user login credentials %s", JSON.stringify(r));
               return r;
            }
            else {
                r.er = {"ec": 1001, "em": "username or password does not exit"};
                console.log("UPS: error 1001 finding user  %s", JSON.stringify(r));
                throw r;
            }
        }
        else {
            r.er = {"ec": 1002, "em": "username or password does not exit"};
            console.log("UPS: error 1002 finding user  %s", JSON.stringify(r));
            throw r;
        }
    }).then(null, function failure(error) {

        if(error && error.er){

            console.log("UPS: error 1005 finding user  %s", JSON.stringify(error));
            throw error;
        }
        r.er = {"ec": 1003, "em": error};
        console.log("UPS: error 1003 finding user  %s", JSON.stringify(r));
        throw r;
    });
}

function ups_read_user(m) {
    var r = {"pl": {}, "er": {}};
    console.log("UPS: get user message %s ", JSON.stringify(m));
    return  user_model.findById(m.pl.user.id).exec().then(function success(paramUser) {
            if (paramUser) {
                r.pl.user = {
                    "username": paramUser.cl.ln,
                    "logincount": paramUser.cl.lc,
                    "loginstatus": paramUser.ls,
                    "userstatus": paramUser.us,
                    "usertype": paramUser.ut,
                    "organizationID": paramUser.org,
                    "mobile": paramUser.mb,
                    "id": paramUser._id,
                    "aid": paramUser.aid,
                    "nid":paramUser.nid,
                    "avatar": paramUser.ual,
                    "fullname": paramUser.ufn,
                    "role": paramUser.ur,
                    "email": paramUser.em

                };
            }
            else {
                r.er = {"ec": 1001, "em": "username or password does not exit"};
            }
            return r;

    }).then(null, function failure(error) {
        console.log("UPS: get user fail %s", error );
        r.er = {"ec": 1002, "em": error};
       return r;
    });
};

