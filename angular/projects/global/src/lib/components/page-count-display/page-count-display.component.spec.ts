import { async, TestBed } from '@angular/core/testing';
import { PageCountDisplayComponent } from './page-count-display.component';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';

describe('PageCountDisplayComponent', () => {
  const testBedHelper = new TestBedHelper<PageCountDisplayComponent>(PageCountDisplayComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageCountDisplayComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
