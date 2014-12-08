
exports.version = "0.1.0";

module.exports = function(paramService, esbMessage){
    var homeRouter = paramService.Router();
    var userloginVerifier = null;
    var registerUzer = null;
    var m1 = {
        "ns":'scm',
        "op": 'getVerifyUserLogin',
        "pl": null
    };

    esbMessage(m1)
        .then(function(r1) {
            //console.log(r1);
            userloginVerifier = r1.pl.fn;
            homeRouter.post('/login', userloginVerifier());
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
            homeRouter.post('/registration', registerUzer());
        })
        .fail(function(err) {
            console.log('error: ' + err);
        });

    return homeRouter;
};

