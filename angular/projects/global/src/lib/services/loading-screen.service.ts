import { Output, EventEmitter } from '@angular/core';

export class LoadingScreenService {
  @Output() stateChange: EventEmitter<any> = new EventEmitter();

  constructor() { }

  setLoadingState(state: boolean, location?: string) {
    this.stateChange.emit({ state: state, location: location });
  }
}
