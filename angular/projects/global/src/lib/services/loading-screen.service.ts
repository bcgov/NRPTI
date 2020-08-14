import { EventEmitter } from '@angular/core';

export class LoadingScreenService {
  stateChange: EventEmitter<any> = new EventEmitter();

  constructor() { }

  setLoadingState(state: boolean, location?: string) {
    this.stateChange.emit({ state: state, location: location });
  }
}
