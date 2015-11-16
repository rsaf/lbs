///**
// * Created by lbs005 on 11/11/15.
// */
import {Component, View} from 'angular2/angular2';
import {cbosNavigationTop} from "../navigation-top/cbosNavigationTop";
import {cbosAppStorage} from "../app_storage/cbosAppStorage";

@Component({
    selector: 'cbos-navigator'
})

@View({
    templateUrl: 'cbos_components/navigator/cbosNavigator.html',
    directives:[cbosNavigationTop,cbosAppStorage],
    styleUrls: []

})

export class cbosNavigator {
    constructor(){
        console.log("CBOS: navigator component loaded");
    }
}