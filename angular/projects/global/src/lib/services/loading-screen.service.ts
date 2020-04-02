import { Output, EventEmitter } from '@angular/core';

export class LoadingScreenService {
  @Output() stateChange: EventEmitter<boolean> = new EventEmitter();
  public isLoading = false;

  constructor() { }

  toggleLoadingState() {
    this.isLoading = !this.isLoading;
    this.stateChange.emit(this.isLoading);
  }

  setLoadingToTrue() {
    this.isLoading = true;
    this.stateChange.emit(this.isLoading);
  }

  setLoadingToFalse() {
    this.isLoading = false;
    this.stateChange.emit(this.isLoading);
  }
}
