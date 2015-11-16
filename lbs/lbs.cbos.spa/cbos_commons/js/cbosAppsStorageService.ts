
import {Injectable, EventEmitter} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http';

@Injectable()
export class cbosAppsStorageService  {
    apps: any;
    eventEmitter:EventEmitter;
    http: Http;

    constructor(http: Http){
        this.apps = {};
        this.eventEmitter = new EventEmitter();
        this.http = http;
    }

    getApps() {
        var message = {
            "m": {
                "dns": "wms",
                "sns": "spa",
                "vr": "1.0.0",
                "op": "ams_get_user_desktop_apps",
                "wf": null,
                "pl":  {"app": {}},
                "sqm": null
            }
        };
        var varHeaders =  {headers: new Headers({'Content-Type': 'application/json', 'Accept':'application/json'})};
        return  this.http.post('/wms/message.json', JSON.stringify(message), varHeaders)
            .map(r => this._add_to_storage(r.json()));

        //return  this.http.post('/wms/message.json', JSON.stringify(message), varHeaders).map(r => this._transform(r.json()));
        //return this.http.post('/api/login.json', JSON.stringify(message), varHeaders).map(r => this._transform(r.json()));
        //if (this.apps && !(_.isEmpty(this.apps))) {
        //    setTimeout(() => this.eventEmitter.next(this.apps),0);
        //    return this.eventEmitter.toRx();
        //}
        //else {
        //    this.dataService.message(m).map(r => this._add_to_storage(r.json()));
        //}
    }
    getApp(appName){
        if(appName){
            if(this.apps ){
                return this.apps[appName];
            }
            else{
                return this.getApps()[appName];
            }
        }
    }

    private _add_to_storage(r){
        console.log("CBOS: Apps Storage Service", r);
        if(r && r.pl && r.pl.apps){
            this.apps = r.pl.apps;
            return this.apps;
        }
        else {
            return null;
        }
    }

}
