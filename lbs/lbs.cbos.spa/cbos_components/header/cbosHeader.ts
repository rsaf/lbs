import {Component, View} from 'angular2/angular2';
import {cbosUserService} from "../../cbos_commons/js/cbosUserService";
@Component({
    selector: 'cbos-header'
})

@View({
    templateUrl: 'cbos_components/header/cbosHeader.html',
    styleUrls: ['cbos_components/header/resources/css/header.css']
})

export class cbosHeader {
         user: any;
    constructor(userService:cbosUserService){
         this.user= {};
         this.user.avatar = ""; // angular will try to evaluate the expression user.avatar in the view onPageLoad, this prevent evaluation error
         userService.getLocalUser({}).subscribe(user => this.user = user);
         console.log("CBOS: header component loaded");
    }

}