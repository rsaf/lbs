
exports.version = "0.1.0";

module.exports = function(paramService, esbMessage){
    var homeRouter = paramService.Router();
    var userloginVerifier = null;
    var registerUzer = null;
    var sessionUser = null;
    var logoutUser = null;

    var m1 = {
        "ns":'scm',
        "op": 'getVerifyUserLogin',
        "pl": null
    };

    esbMessage(m1)
        .then(function(r1) {
            //console.log(r1);
            userloginVerifier = r1.pl.fn;
            homeRouter.post('/login.json', userloginVerifier());
            var m2 = {
                "ns":'scm',
                "op": 'getRegisterUser',
                "pl": null
            };
            return esbMessage(m2);
        })
        .then(function(r2){
            //console.log(r2);
            registerUzer = r2.pl.fn;
            homeRouter.post('/registration.json', registerUzer());
            var m3 = {
                "ns":'scm',
                "op": 'getSessionUser',
                "pl": null
            };
            return esbMessage(m3);
        })
        .then(function(r3){
            sessionUser = r3.pl.fn;
            homeRouter.get('/user.json', sessionUser());

            var m4 = {
                "ns":'scm',
                "op": 'getLogoutUser',
                "pl": null
            };
            return esbMessage(m4);

        })
        .then(function(r4){
            logoutUser = r4.pl.fn;
            homeRouter.get('/logout.json', logoutUser());
        })
        .fail(function(err) {
            console.log('error: ' + err);
        });

    return homeRouter;
};

