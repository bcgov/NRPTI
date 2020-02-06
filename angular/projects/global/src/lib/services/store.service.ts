import { Output, EventEmitter } from '@angular/core';

export class StoreService {
  @Output() change: EventEmitter<boolean> = new EventEmitter();

  private currentState: any;
  isOpen = true;

  constructor() {
    this.currentState = {};
  }

  get state(): any {
    return this.currentState;
  }
  set state(state: any) {
    this[state.type] = state.data;
  }

  toggleSideNav() {
    this.isOpen = !this.isOpen;
    this.change.emit(this.isOpen);
  }
}
