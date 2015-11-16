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
var http_1 = require('angular2/http');
var router_1 = require('angular2/router');
var cbosLogin_1 = require("./cbos_components/login/cbosLogin");
var cbosDesktop_1 = require("./cbos_components/desktop/cbosDesktop");
var cbosUserService_1 = require("./cbos_commons/js/cbosUserService");
var cbosDataService_1 = require("./cbos_commons/js/cbosDataService");
var cbosNavigationAppsService_1 = require("./cbos_commons/js/cbosNavigationAppsService");
var cbos = (function () {
    function cbos(userService, router, location) {
        var _this = this;
        this.router = router;
        this.location = location;
        this.userService = userService;
        this.userService.getLocalUser({}).subscribe(function (user) { return _this.redirectUser(user); }, function (er) { return console.log(er); }, function () { return console.log('CBOS loaded'); });
    }
    cbos.prototype.redirectUser = function (user) {
        if (user && user.loginstatus) {
            console.log("CBOS: user is login");
            if (this.location.path() === '/' || this.location.path() === '') {
                return this.router.navigateByUrl('/desktop');
            }
        }
    };
    cbos = __decorate([
        angular2_1.Component({
            selector: 'cbos',
            providers: [http_1.HTTP_PROVIDERS, router_1.ROUTER_PROVIDERS, angular2_1.provide(router_1.LocationStrategy, { useClass: router_1.HashLocationStrategy }), cbosUserService_1.cbosUserService, cbosDataService_1.cbosDataService, cbosNavigationAppsService_1.cbosNavigationAppsService]
        }),
        angular2_1.View({
            template: '<router-outlet></router-outlet>',
            directives: [router_1.ROUTER_DIRECTIVES, cbosLogin_1.cbosLogin, cbosDesktop_1.cbosDesktop]
        }),
        router_1.RouteConfig([
            new router_1.Route({ path: '/', component: cbosLogin_1.cbosLogin, as: 'Login' }),
            new router_1.Route({ path: '/desktop', component: cbosDesktop_1.cbosDesktop, as: 'Desktop' }),
        ]), 
        __metadata('design:paramtypes', [cbosUserService_1.cbosUserService, router_1.Router, router_1.Location])
    ], cbos);
    return cbos;
})();
exports.cbos = cbos;
angular2_1.bootstrap(cbos).catch(function (er) { return console.log(er); });
//# sourceMappingURL=cbos.js.map