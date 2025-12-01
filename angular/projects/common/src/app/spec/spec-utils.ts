import { convertToParamMap } from '@angular/router';
import { Type } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';

/**
 * Utility to make working with the testbed easier.  Specifically when you need to control component creation and
 * fixture change detection so that mocks and spies can be setup first.
 *
 * @export
 * @class TestBedHelper
 * @template T
 */
export class TestBedHelper<T> {
  private component: Type<T>;

  /**
   * Creates an instance of TestBedHelper.
   *
   * @param {Type<T>} component the class of the component/service/etc being tested.
   * @memberof TestBedHelper
   */
  constructor(component: Type<T>) {
    this.component = component;
  }

  /**
   * Initializes the component and fixture.
   *
   * - In most cases, this will be called in the beforeEach.
   * - In tests that require custom mock behaviour, set up the mock behaviour before calling this.
   *
   * @param {boolean} [detectChanges=true] set to false if you want to manually call fixture.detectChanges(), etc.
   * Usually you want to control this when the timing of ngOnInit, and similar auto-exec functions, matters.
   * @returns @returns {{ component: T; fixture: ComponentFixture<T> }} Object containing the component and test
   * fixture.
   * @memberof TestBedHelper
   */
  public createComponent(detectChanges: boolean = true): { component: T; fixture: ComponentFixture<T> } {
    const fixture = TestBed.createComponent(this.component);
    const component = fixture.componentInstance;

    if (detectChanges) {
      fixture.detectChanges();
    }

    return { component, fixture };
  }
}

export interface IActivatedRouteData {
  data?: {};
  params?: {};
  queryParamMap?: {};
  snapshot?: {};
}

/**
 * Utility class to make mocking ActivatedRoute easier.
 *
 * @export
 * @class ActivatedRouteStub
 */
export class ActivatedRouteStub {
  public data = of({});
  public params = of({});
  public queryParamMap = of(convertToParamMap({}));
  public snapshot = {};

  constructor(initialData: IActivatedRouteData = null) {
    this.data = of((initialData && initialData.data) || {});
    this.params = of((initialData && initialData.params) || {});
    this.queryParamMap = of(convertToParamMap((initialData && initialData.queryParamMap) || {}));
    this.snapshot = (initialData && initialData.snapshot) || {};
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
   * @param {{}} queryParamMap
   * @memberof ActivatedRouteStub
   */
  public setQueryParamMap(queryParamMap: {}) {
    this.queryParamMap = of(convertToParamMap(queryParamMap));
  }

  /**
   * Sets the snapshot property.
   *
   * @param {{}} snapshot
   * @memberof ActivatedRouteStub
   */
  public setSnapshot(snapshot: {}) {
    this.snapshot = snapshot;
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
