

export function redirectUser(r){
    if(r && r.pl && r.pl.user && r.pl.user.status){
        this.user = r.pl.user;

        if(this.location.path() === '/'){
            this.location.go('/desktop');
        }
    }
    else {
        this.user = {};
        console.log("CBOS user not login");
        this.location.go('/');
    }
}