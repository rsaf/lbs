
import {Component,View, bootstrap, provide} from 'angular2/angular2';
import {HTTP_PROVIDERS } from 'angular2/http';
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, Location,LocationStrategy, HashLocationStrategy, Route, AsyncRoute, Router} from 'angular2/router';
import {cbosLogin} from "./cbos_components/login/cbosLogin";
import {cbosDesktop} from "./cbos_components/desktop/cbosDesktop";
import {cbosUserService} from "./cbos_commons/js/cbosUserService";
import {cbosDataService} from "./cbos_commons/js/cbosDataService";
import {cbosNavigationAppsService} from "./cbos_commons/js/cbosNavigationAppsService";

@Component({
    selector: 'cbos',
    providers: [HTTP_PROVIDERS, ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy}), cbosUserService, cbosDataService,cbosNavigationAppsService]
})

@View({
    template: '<router-outlet></router-outlet>',
    directives:[ROUTER_DIRECTIVES, cbosLogin, cbosDesktop]
})

@RouteConfig([
    new Route({path: '/', component: cbosLogin, as: 'Login'}),
    new Route({path: '/desktop', component: cbosDesktop, as: 'Desktop'}),
    //new Route({path: '/desktop/apps/...', component: cbosApp, as: 'app'})
])

export class cbos {

    userService: cbosUserService;
    router: Router;
    location: Location;

    constructor(userService: cbosUserService, router:Router, location: Location){
        this.router = router;
        this.location = location;
        this.userService = userService;
        this.userService.getLocalUser({}).subscribe(user => this.redirectUser(user), er => console.log(er),() => console.log('CBOS loaded'));
    }

   private redirectUser(user){
    if(user && user.loginstatus) {
        console.log("CBOS: user is login");
        if (this.location.path() === '/' || this.location.path() === '') {
            return this.router.navigateByUrl('/desktop');
        }
    }
   }
}

bootstrap(cbos).catch(er => console.log(er));
