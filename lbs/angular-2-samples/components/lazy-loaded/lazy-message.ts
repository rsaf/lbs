
import {Component} from 'angular2/angular2';

@Component({
    selector: 'lazy-message',
    template: '<div>"Hello" from a dependency of the lazy loaded component.</div>'
})

export class LazyMessage {
}