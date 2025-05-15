import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DigitOnlyDirective } from './digit-only.directive';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';

@Component({
  standalone: false,
  template: `
    <input [libDigitOnly] />
  `
})
class TestComponent {}

describe('DigitOnlyDirective', () => {
  const testBedHelper = new TestBedHelper<TestComponent>(TestComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DigitOnlyDirective, TestComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
