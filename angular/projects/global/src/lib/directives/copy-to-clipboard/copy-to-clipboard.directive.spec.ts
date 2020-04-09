import { async, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CopyToClipboardDirective } from './copy-to-clipboard.directive';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';

@Component({
  template: `
    <button [libCopyToClipboard]="'copy text'"></button>
  `
})
class TestComponent {}

describe('CopyToClipboardDirective', () => {
  const testBedHelper = new TestBedHelper<TestComponent>(TestComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CopyToClipboardDirective, TestComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
