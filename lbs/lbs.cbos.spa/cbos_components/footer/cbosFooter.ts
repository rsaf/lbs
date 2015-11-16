import {Component, View} from 'angular2/angular2';
@Component({
    selector: 'cbos-footer'
})

@View({
    templateUrl: 'cbos_components/footer/cbosFooter.html',
    styleUrls: ['cbos_components/footer/resources/css/footer.css']

})

export class cbosFooter {
    constructor(){
        console.log("CBOS: footer component loaded");
    }

    slickInit(){

        console.log('initializing the slick-----');
        $('.cbos-app-storage-click').slick({
            dots: false,
            infinite: false,
            speed: 300,
            slidesToShow: 2,
            slidesToScroll: 1,
            prevArrow:".toolbox-slick-prev",
            nextArrow:".toolbox-slick-next",
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

                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        });
    }
}