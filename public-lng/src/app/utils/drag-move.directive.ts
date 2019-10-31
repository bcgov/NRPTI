import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

//
// ref: https://saschwarz.github.io/angular2-gestures-slides/#/9
//

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[dragMove]'
})
export class DragMoveDirective {
  @Input() x;
  @Input() y;
  @Output() locationChange = new EventEmitter<any>();

  private startX = 0;
  private startY = 0;

  @HostListener('panstart', ['$event']) protected onPanStart(event) {
    event.preventDefault();
    this.startX = this.x;
    this.startY = this.y;
  }

  @HostListener('panmove', ['$event']) protected onPanMove(event) {
    event.preventDefault();
    this.x = this.startX + event.deltaX;
    this.y = this.startY + event.deltaY;
    this.locationChange.emit({ x: this.x, y: this.y });
  }
}
