import {Component, View, OnInit} from 'angular2/angular2';
import {ReactTreeView} from './react-tree-view';

@Component({
    selector: 'angular-2-host'
})

@View({
   templateUrl:'./components/react-integration/angular-2-host.html'
})

export class Angular2Host implements OnInit {

    onInit(){
        ReactTreeView.initialize('Locations');
    }

}