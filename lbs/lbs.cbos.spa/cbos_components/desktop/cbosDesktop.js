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
var cbosDataService_1 = require("../../cbos_commons/js/cbosDataService");
var cbosFooter_1 = require("../footer/cbosFooter");
var cbosHeader_1 = require("../header/cbosHeader");
var cbosNavigator_1 = require("../navigator/cbosNavigator");
var cbosDesktop = (function () {
    function cbosDesktop(dataService) {
        this.dataService = dataService;
        console.log("CBOS: desktop component loaded");
    }
    cbosDesktop = __decorate([
        angular2_1.Component({
            selector: 'cbos-desktop',
            providers: [cbosDataService_1.cbosDataService]
        }),
        angular2_1.View({
            templateUrl: 'cbos_components/desktop/cbosDesktop.html',
            directives: [cbosFooter_1.cbosFooter, cbosHeader_1.cbosHeader, cbosNavigator_1.cbosNavigator]
        }), 
        __metadata('design:paramtypes', [cbosDataService_1.cbosDataService])
    ], cbosDesktop);
    return cbosDesktop;
})();
exports.cbosDesktop = cbosDesktop;
//# sourceMappingURL=cbosDesktop.js.map