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
var react_tree_view_1 = require('./react-tree-view');
var Angular2Host = (function () {
    function Angular2Host() {
    }
    Angular2Host.prototype.onInit = function () {
        react_tree_view_1.ReactTreeView.initialize('Locations');
    };
    Angular2Host = __decorate([
        angular2_1.Component({
            selector: 'angular-2-host'
        }),
        angular2_1.View({
            templateUrl: './components/react-integration/angular-2-host.html'
        }), 
        __metadata('design:paramtypes', [])
    ], Angular2Host);
    return Angular2Host;
})();
exports.Angular2Host = Angular2Host;
