import { Directive, HostListener } from '@angular/core';

// IMPORTANT: You can inject services to Directives without adding the @Injectable decorator. 
// This is because the @Directive decorator already allows service injections
@Directive({
  selector: '[app-event-blocker]'
})
export class EventBlockerDirective {

  /* The HostListener Directive allows us to pass in the event object from the DOM to this method when a drop event occurs. You 
  *  can add more objects to the array that you want from the template you can have multiple @HostListener decorators to handle
  *  different events in the same method.
  */
  @HostListener('drop', ['$event']) 
  @HostListener('dragover', ['$event']) 
  public handleEvent(event: Event) {
    event.preventDefault()
    // event.stopPropagation()      // Dont need this since the preventDefault will also handle this.
  }

}
