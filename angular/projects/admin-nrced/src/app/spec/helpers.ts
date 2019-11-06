import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

/**
 * Helper class to make mocking ActivatedRoute easier.
 *
 * @export
 * @class ActivatedRouteStub
 */
export class ActivatedRouteStub {
  public data = of({});
  public params = of({});
  public queryParamMap = of(convertToParamMap({}));

  constructor(initialData = {}) {
    this.setData(initialData);
  }

  /**
   * Sets the data property.
   *
   * @param {{}} data
   * @memberof ActivatedRouteStub
   */
  public setData(data: {}) {
    this.data = of(data);
  }

  /**
   * Sets the params property.
   *
   * @param {{}} params
   * @memberof ActivatedRouteStub
   */
  public setParams(params: {}) {
    this.params = of(params);
  }

  /**
   * Sets the queryParamMap property.
   *
   * @param {{}} params
   * @memberof ActivatedRouteStub
   */
  public setQueryParamMap(params: {}) {
    this.queryParamMap = of(convertToParamMap(params));
  }

  /**
   * Clears data, params, and queryParamMap properties, setting them all to return empty objects.
   *
   * @memberof ActivatedRouteStub
   */
  public clear() {
    this.data = of({});
    this.params = of({});
    this.queryParamMap = of(convertToParamMap({}));
  }
}
