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
var cbosFooter = (function () {
    function cbosFooter() {
        console.log("CBOS: footer component loaded");
    }
    cbosFooter.prototype.slickInit = function () {
        console.log('initializing the slick-----');
        $('.cbos-app-storage-click').slick({
            dots: false,
            infinite: false,
            speed: 300,
            slidesToShow: 2,
            slidesToScroll: 1,
            prevArrow: ".toolbox-slick-prev",
            nextArrow: ".toolbox-slick-next",
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    };
    cbosFooter = __decorate([
        angular2_1.Component({
            selector: 'cbos-footer'
        }),
        angular2_1.View({
            templateUrl: 'cbos_components/footer/cbosFooter.html',
            styleUrls: ['cbos_components/footer/resources/css/footer.css']
        }), 
        __metadata('design:paramtypes', [])
    ], cbosFooter);
    return cbosFooter;
})();
exports.cbosFooter = cbosFooter;
//# sourceMappingURL=cbosFooter.js.map