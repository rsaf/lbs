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
var cbosAppsStorageService = (function () {
    function cbosAppsStorageService(http) {
        this.apps = {};
        this.eventEmitter = new angular2_1.EventEmitter();
        this.http = http;
    }
    cbosAppsStorageService.prototype.getApps = function () {
        var _this = this;
        var message = {
            "m": {
                "dns": "wms",
                "sns": "spa",
                "vr": "1.0.0",
                "op": "ams_get_user_desktop_apps",
                "wf": null,
                "pl": { "app": {} },
                "sqm": null
            }
        };
        var varHeaders = { headers: new http_1.Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) };
        return this.http.post('/wms/message.json', JSON.stringify(message), varHeaders)
            .map(function (r) { return _this._add_to_storage(r.json()); });
        //return  this.http.post('/wms/message.json', JSON.stringify(message), varHeaders).map(r => this._transform(r.json()));
        //return this.http.post('/api/login.json', JSON.stringify(message), varHeaders).map(r => this._transform(r.json()));
        //if (this.apps && !(_.isEmpty(this.apps))) {
        //    setTimeout(() => this.eventEmitter.next(this.apps),0);
        //    return this.eventEmitter.toRx();
        //}
        //else {
        //    this.dataService.message(m).map(r => this._add_to_storage(r.json()));
        //}
    };
    cbosAppsStorageService.prototype.getApp = function (appName) {
        if (appName) {
            if (this.apps) {
                return this.apps[appName];
            }
            else {
                return this.getApps()[appName];
            }
        }
    };
    cbosAppsStorageService.prototype._add_to_storage = function (r) {
        console.log("CBOS: Apps Storage Service", r);
        if (r && r.pl && r.pl.apps) {
            this.apps = r.pl.apps;
            return this.apps;
        }
        else {
            return null;
        }
    };
    cbosAppsStorageService = __decorate([
        angular2_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], cbosAppsStorageService);
    return cbosAppsStorageService;
})();
exports.cbosAppsStorageService = cbosAppsStorageService;
//# sourceMappingURL=cbosAppsStorageService.js.map