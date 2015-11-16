
import {Component, View} from 'angular2/angular2';
import {cbosUserService} from "../../cbos_commons/js/cbosUserService";
import {Router} from 'angular2/router';

@Component({
    selector: 'cbos-login'
})

@View({
    templateUrl: 'cbos_components/login/cbosLogin.html',
})
export class cbosLogin {
    router:Router;
    userService: cbosUserService;
    constructor( router:Router, userService:cbosUserService){
        this.userService = userService;
        this.router = router;
    }

    login(event, paramUsername, paramPassword, paramCaptcha) {
        event.preventDefault();
        var m = {"username":paramUsername, "password":paramPassword };
        this.userService.loginLocalUser(m).subscribe(user => this.redirectUserAfterLogin(user), er => console.log(er), ()=> console.log("CBOS: login done"));
        console.log("CBOS: login component loaded");
    }
    private redirectUserAfterLogin(user){
        if(user && user.loginstatus){
           return this.router.parent.navigateByUrl('/desktop');
        }
    }
}
