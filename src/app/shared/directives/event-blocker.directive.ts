//HostListener: It selects the host element and can also listen to an event on the host
import { Directive, HostListener } from '@angular/core';

// Normally we would have to add the @Injectable decorator 
// The directive decorator allows classes to be injected with services
@Directive({
  selector: '[app-event-blocker]'
})
export class EventBlockerDirective {

  @HostListener('drop',['$event'])
  @HostListener('dragover',['$event'])
  public handleEvent(event: Event){
    event.preventDefault()
  }

}
