import { EventEmitter } from '@angular/core';

/**
 * An object containing a single key value pair.
 *
 * @export
 * @interface IStateItem
 */
export interface IStateItem {
  [key: string]: any;
}

export class StoreService {
  public stateChange: EventEmitter<object> = new EventEmitter();

  private currentState: object;

  constructor() {
    this.currentState = {};
  }

  /**
   * Get the entire store state.
   *
   * @type {object}
   * @memberof StoreService
   */
  get state(): object {
    return this.currentState;
  }

  /**
   *  Set the entire store state.  WIll override any existing store state.
   *
   * @memberof StoreService
   */
  set state(state: object) {
    this.currentState = state;
    this.stateChange.emit(this.currentState);
  }

  /**
   * Add an item to the store.  WIll override an existing item with the same key.
   *
   * @param {IStateItem} item
   * @memberof StoreService
   */
  setItem(item: IStateItem) {
    this.currentState = { ...this.currentState, ...item };
    this.stateChange.emit(this.currentState);
  }

  /**
   * Get an item from the store.
   *
   * @param {string} itemKey
   * @returns {*}
   * @memberof StoreService
   */
  getItem(itemKey: string): any {
    return this.currentState[itemKey];
  }

  /**
   * remove an item from the store.
   *
   * @param {string} itemKey
   * @memberof StoreService
   */
  removeItem(itemKey: string) {
    delete this.currentState[itemKey];
    this.stateChange.emit(this.currentState);
  }
}
