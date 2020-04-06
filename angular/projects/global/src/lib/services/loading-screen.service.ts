import { Output, EventEmitter } from '@angular/core';

export class LoadingScreenService {
  @Output() stateChange: EventEmitter<boolean> = new EventEmitter();
  public isLoading = false;

  constructor() {}

  setLoadingState(state: boolean) {
    this.isLoading = state;
    this.stateChange.emit(this.isLoading);
  }
}
