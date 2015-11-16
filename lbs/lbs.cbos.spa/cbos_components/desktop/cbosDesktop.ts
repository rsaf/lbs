
import {Component, View} from 'angular2/angular2';
import {ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
import {cbosDataService} from "../../cbos_commons/js/cbosDataService";
import {cbosFooter} from "../footer/cbosFooter";
import {cbosHeader} from "../header/cbosHeader";
import {cbosNavigator} from "../navigator/cbosNavigator";

@Component({
    selector: 'cbos-desktop',
    providers: [cbosDataService]

})

@View({
    templateUrl: 'cbos_components/desktop/cbosDesktop.html',
    directives:[cbosFooter, cbosHeader,cbosNavigator]
})

export class cbosDesktop {
    dataService: cbosDataService;

    constructor(dataService: cbosDataService){
        this.dataService = dataService;
        console.log("CBOS: desktop component loaded");
    }
}