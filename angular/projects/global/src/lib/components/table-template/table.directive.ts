import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[libTable]'
})
export class TableDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
