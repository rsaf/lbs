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
var cbosUserService = (function () {
    function cbosUserService(httpService) {
        this.http = httpService;
        this.user = {};
        this.eventEmitter = new angular2_1.EventEmitter();
    }
    cbosUserService.prototype.getLocalUser = function (m) {
        var _this = this;
        if (this.user && this.user.loginstatus) {
            setTimeout(function () { return _this.eventEmitter.next(_this.user); }, 0);
            return this.eventEmitter.toRx();
        }
        else {
            return this.http.get('/api/user.json').map(function (r) { return _this._transform(r.json()); });
        }
    };
    cbosUserService.prototype.loginLocalUser = function (m) {
        var _this = this;
        var varHeaders = { headers: new http_1.Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) };
        this.http.post('/wms/message.json', JSON.stringify(m), varHeaders).map(function (r) { return _this._transform(r.json()); });
        return this.http.post('/api/login.json', JSON.stringify(m), varHeaders).map(function (r) { return _this._transform(r.json()); });
    };
    cbosUserService.prototype.logoutLocalUser = function (m) {
        var _this = this;
        return this.http.get('/api/logout.json').map(function (r) { return _this._transform(r.json()); });
    };
    cbosUserService.prototype._transform = function (r) {
        if (r && r.pl && r.pl.user && r.pl.user.loginstatus) {
            this.user = r.pl.user;
            return this.user;
        }
        else {
            return null;
        }
    };
    cbosUserService = __decorate([
        angular2_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], cbosUserService);
    return cbosUserService;
})();
exports.cbosUserService = cbosUserService;
//# sourceMappingURL=cbosUserService.js.map