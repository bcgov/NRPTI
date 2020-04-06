import { async, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DigitOnlyDirective } from './digit-only.directive';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';

@Component({
  template: `
    <input [libDigitOnly] />
  `
})
class TestComponent {}

describe('DigitOnlyDirective', () => {
  const testBedHelper = new TestBedHelper<TestComponent>(TestComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DigitOnlyDirective, TestComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
