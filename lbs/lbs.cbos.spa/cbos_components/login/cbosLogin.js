var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var angular2_1 = require('angular2/angular2');
var cbosUserService_1 = require("../../cbos_commons/js/cbosUserService");
var router_1 = require('angular2/router');
var cbosLogin = (function () {
    function cbosLogin(router, userService) {
        this.userService = userService;
        this.router = router;
    }
    cbosLogin.prototype.login = function (event, paramUsername, paramPassword, paramCaptcha) {
        var _this = this;
        event.preventDefault();
        var m = { "username": paramUsername, "password": paramPassword };
        this.userService.loginLocalUser(m).subscribe(function (user) { return _this.redirectUserAfterLogin(user); }, function (er) { return console.log(er); }, function () { return console.log("CBOS: login done"); });
        console.log("CBOS: login component loaded");
    };
    cbosLogin.prototype.redirectUserAfterLogin = function (user) {
        if (user && user.loginstatus) {
            return this.router.parent.navigateByUrl('/desktop');
        }
    };
    cbosLogin = __decorate([
        angular2_1.Component({
            selector: 'cbos-login'
        }),
        angular2_1.View({
            templateUrl: 'cbos_components/login/cbosLogin.html',
        }), 
        __metadata('design:paramtypes', [router_1.Router, cbosUserService_1.cbosUserService])
    ], cbosLogin);
    return cbosLogin;
})();
exports.cbosLogin = cbosLogin;
//# sourceMappingURL=cbosLogin.js.map