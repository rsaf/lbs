/**
 * Created by lbs005 on 11/11/15.
 */
import {Component, View,NgFor,NgIf} from 'angular2/angular2';
import {cbosAppsStorageService} from "../../cbos_commons/js/cbosAppsStorageService";

@Component({
    selector: 'cbos-app-storage',
    providers: [cbosAppsStorageService]
})

@View({
    templateUrl: 'cbos_components/app_storage/cbosAppStorage.html',
    styleUrls: [],
    directives: [NgFor,NgIf]
})

export class cbosAppStorage {
    apps:any;
    appsStorage:cbosAppsStorageService;

    constructor(appsStorage:cbosAppsStorageService){
        this.appsStorage = appsStorage;
        appsStorage.getApps().subscribe(r => {this.apps = r;});
    }
}