
import {Injectable} from 'angular2/angular2'
import {Http, Headers} from 'angular2/http';

@Injectable()
export class cbosDataService  {

   private http:Http;

   public constructor(httpService:Http){
        this.http = httpService;
    }

    message(m) {
        //@Todo message format validation needed here
        var varHeaders =  {headers: new Headers({'Content-Type': 'application/json', 'Accept':'application/json'})};
        var message = {
            "m": {
                "dns": "wms",
                "sns": "spa",
                "vr": "1.0.0",
                "op": m.op,
                "wf": m.wf,
                "pl": m.pl,
                "sqm": m.sqm
            }
        };
        console.log("Message to post to backend ", message);

        //return this.http.post('/wms/message.json', "", varHeaders);
        return this.http.get('/api/money.json');
    }

}
