export class StoreService {
  private currentState: any;

  constructor() {
    this.currentState = {};
  }

  get state(): any {
    return this.currentState;
  }
  set state(state: any) {
    this[state.type] = state.data;
  }
}
