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
///**
// * Created by lbs005 on 11/11/15.
// */
var angular2_1 = require('angular2/angular2');
var cbosNavigationAppsService_1 = require("../../cbos_commons/js/cbosNavigationAppsService");
var cbosNavigationTop = (function () {
    function cbosNavigationTop(navigationApps) {
        var _this = this;
        this.navigationApps = navigationApps;
        console.log("CBOS: navigator component loaded");
        navigationApps.getApps().subscribe(function (r) { _this.topnav = r; console.log('this.topnav---', _this.topnav); });
    }
    cbosNavigationTop = __decorate([
        angular2_1.Component({
            selector: 'cbos-navigation-top',
        }),
        angular2_1.View({
            templateUrl: 'cbos_components/navigation-top/cbosNavigationTop.html',
            styleUrls: [],
            directives: [angular2_1.NgFor, angular2_1.NgIf]
        }), 
        __metadata('design:paramtypes', [cbosNavigationAppsService_1.cbosNavigationAppsService])
    ], cbosNavigationTop);
    return cbosNavigationTop;
})();
exports.cbosNavigationTop = cbosNavigationTop;
//# sourceMappingURL=cbosNavigationTop.js.map