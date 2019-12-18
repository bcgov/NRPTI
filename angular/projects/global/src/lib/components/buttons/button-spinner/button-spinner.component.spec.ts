import { async, TestBed } from '@angular/core/testing';
import { ButtonSpinnerComponent } from './button-spinner.component';
import { TestBedHelper } from '../../../../../../common/src/app/spec/spec-utils';

describe('ButtonSpinnerComponent', () => {
  const testBedHelper = new TestBedHelper<ButtonSpinnerComponent>(ButtonSpinnerComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonSpinnerComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
