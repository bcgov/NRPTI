import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AutoGrowTextAreaDirective } from './auto-grow-textarea.directive';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { Utils } from '../../utils/utils';

@Component({
  template: `
    <textarea libAutoGrowTextArea minRows="1" maxRows="5" rows="2"></textarea>
  `
})
class TestComponent {}

describe('AutoGrowTextAreaDirective', () => {
  const testBedHelper = new TestBedHelper<TestComponent>(TestComponent);

  beforeEach((() => {
    TestBed.configureTestingModule({
      providers: [Utils],
      declarations: [AutoGrowTextAreaDirective, TestComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
