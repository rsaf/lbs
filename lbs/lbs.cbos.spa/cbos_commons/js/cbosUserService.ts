
import {Injectable, EventEmitter} from 'angular2/angular2'
import {Http, Headers} from 'angular2/http';

@Injectable()
export class cbosUserService  {
    http: Http;
    user: any;
    eventEmitter:EventEmitter;
    constructor(httpService:Http){
      this.http = httpService;
      this.user = {};
      this.eventEmitter = new EventEmitter();
    }

   getLocalUser(m) {
       if (this.user && this.user.loginstatus) {
           setTimeout(() => this.eventEmitter.next(this.user),0);
           return this.eventEmitter.toRx();
       }
       else {
           return this.http.get('/api/user.json').map(r => this._transform(r.json()));
       }
   }

    loginLocalUser(m) {
        var varHeaders =  {headers: new Headers({'Content-Type': 'application/json', 'Accept':'application/json'})};
        this.http.post('/wms/message.json', JSON.stringify(m), varHeaders).map(r => this._transform(r.json()));
        return this.http.post('/api/login.json', JSON.stringify(m), varHeaders).map(r => this._transform(r.json()));
    }

    logoutLocalUser(m){
        return this.http.get('/api/logout.json').map(r => this._transform(r.json()));
    }

    private _transform(r){
        if(r && r.pl && r.pl.user && r.pl.user.loginstatus){
            this.user = r.pl.user;
            return this.user;
        }
        else {
            return null;
        }
    }

}
