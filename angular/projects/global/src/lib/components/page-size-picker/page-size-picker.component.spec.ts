import { async, TestBed } from '@angular/core/testing';
import { PageSizePickerComponent } from './page-size-picker.component';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';

describe('PageSizePickerComponent', () => {
  const testBedHelper = new TestBedHelper<PageSizePickerComponent>(PageSizePickerComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageSizePickerComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
