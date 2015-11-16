require.config({
    baseUrl: '',
    paths: {
        'angular': 'bower_components/angular/angular',
        'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular-bootstrap' : 'bower_components/angular-bootstrap/ui-bootstrap.min',
        'ui-bootstrap-tpls' : 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-animate' : 'bower_components/angular-animate/angular-animate.min',
        'angular-strap.min' : 'bower_components/angular-strap/dist/angular-strap.min',
        'angular-strap.tpl.min' : 'bower_components/angular-strap/dist/angular-strap.tpl.min',
        'angular-scroll.min' : 'bower_components/angular-scroll/angular-scroll.min',
        'bootstrap' : 'bower_components/bootstrap/dist/js/bootstrap.min',
        'bootstrap-select' : 'bower_components/bootstrap-select/dist/js/bootstrap-select.min',
        'jquery.dotdotdot.min' : 'bower_components/jQuery.dotdotdot/src/js/jquery.dotdotdot.min',
        'swiper.min' : 'bower_components/swiper/dist/js/swiper.min',
        'angular-touch' : 'bower_components/angular-touch/angular-touch.min',
        'angular-ui-tree':'bower_components/angular-ui-tree/dist/angular-ui-tree.min',
        'angular-ui-router':'bower_components/angular-ui-router/release/angular-ui-router.min',
        'angular-slick':'bower_components/angular-slick/dist/slick.min',
        'slick-carousel':'bower_components/slick-carousel/slick/slick.min',
        'angular-css':'bower_components/angular-css/angular-css.min',
        'lodash':'bower_components/lodash/lodash.min',
        'angular-gettext':'bower_components/angular-gettext/dist/angular-gettext.min',
        'gettext': 'po/cbos.cn',
        'angular-debounce':'bower_components/angular-debounce/dist/angular-debounce.min',
        'angular-sanitize':'bower_components/angular-sanitize/angular-sanitize.min'
    },
    shim: {
        'cbos': {
            deps: ['angular', 'bootstrap', 'jquery','angular-bootstrap','ui-bootstrap-tpls'
                ,'angular-animate','angular-strap.min','angular-strap.tpl.min','angular-scroll.min','bootstrap',
                'bootstrap-select','jquery.dotdotdot.min', 'swiper.min','angular-touch', 'angular-ui-tree','angular-ui-router',
                'angular-slick','slick-carousel','angular-css','lodash','angular-gettext','gettext','angular-debounce','angular-sanitize']
        },
        'angular-bootstrap': {
            deps: ['angular']
        },
        'angular-animate': {
            deps: ['angular']
        },
        'ui-bootstrap-tpls': {
            deps:['angular','angular-bootstrap']
        },

        'angular-scroll.min': {
            deps: ['angular']
        },
        'angular-strap.min': {
            deps: ['angular']
        },
        'angular-strap.tpl.min': {
            deps: ['angular','angular-strap.min']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'bootstrap-select':{
            deps:['bootstrap']
        }
        ,
        'jquery.dotdotdot.min': {
            deps: ['jquery']
        },

        'swiper.min': {
            deps: ['jquery']
        },
        'angular-touch':{
            deps: ['angular']
        },
        'angular-ui-tree':
        {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'slick-carousel': {
            deps: ['angular','jquery']
        }
        ,
        'angular-slick': {
            deps: ['angular','jquery','slick-carousel']
        },
        'angular-css':{
            deps:['angular']
        },
        'angular-gettext':{
            deps:['angular']
        },
        'gettext':{
            deps:['angular-gettext']
        },
        'angular-debounce':{
            deps:['angular']
        },
        'angular-sanitize':{
            deps:['angular']
        }
    }

});

require(['cbos'], function (cbos) {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    $http.get("/api/user.json").then(function success (r) {
        if((r.status ===200)&& r.data && r.data.pl && r.data.pl.user){
            cbos.user = r.data.pl.user;
        }
        angular.bootstrap(document, ['lbs.cbos.base']);
    }).then(null, function failure(er) {
        // Handle error case
    });
 });
