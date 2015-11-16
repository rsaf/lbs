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
var cbosNavigationTop_1 = require("../navigation-top/cbosNavigationTop");
var cbosAppStorage_1 = require("../app_storage/cbosAppStorage");
var cbosNavigator = (function () {
    function cbosNavigator() {
        console.log("CBOS: navigator component loaded");
    }
    cbosNavigator = __decorate([
        angular2_1.Component({
            selector: 'cbos-navigator'
        }),
        angular2_1.View({
            templateUrl: 'cbos_components/navigator/cbosNavigator.html',
            directives: [cbosNavigationTop_1.cbosNavigationTop, cbosAppStorage_1.cbosAppStorage],
            styleUrls: []
        }), 
        __metadata('design:paramtypes', [])
    ], cbosNavigator);
    return cbosNavigator;
})();
exports.cbosNavigator = cbosNavigator;
//# sourceMappingURL=cbosNavigator.js.map