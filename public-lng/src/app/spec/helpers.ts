import { of } from 'rxjs';

export class ActivatedRouteStub {
  public parent = {
    data: of({})
  };

  constructor(initialData) {
    this.setParentData(initialData);
  }

  public setParentData(data: {}) {
    this.parent.data = of(data);
  }
}

export default ActivatedRouteStub;
