///**
// * Created by lbs005 on 11/11/15.
// */
import {Component, View,NgFor,NgIf} from 'angular2/angular2';
import {cbosNavigationAppsService} from "../../cbos_commons/js/cbosNavigationAppsService";

@Component({
    selector: 'cbos-navigation-top',
})

@View({
    templateUrl: 'cbos_components/navigation-top/cbosNavigationTop.html',
    styleUrls: [],
    directives:[NgFor,NgIf]

})

export class cbosNavigationTop {
    topnav:any;
    navigationApps:cbosNavigationAppsService;
    constructor(navigationApps:cbosNavigationAppsService){

        this.navigationApps = navigationApps;
        console.log("CBOS: navigator component loaded");
        navigationApps.getApps().subscribe(r => {this.topnav = r ; console.log('this.topnav---',this.topnav);});
    }
}