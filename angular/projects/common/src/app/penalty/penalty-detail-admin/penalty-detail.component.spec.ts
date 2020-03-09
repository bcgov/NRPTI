import { async, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { TestBedHelper } from '../../spec/spec-utils';
import { PenaltyDetailComponent } from './penalty-detail.component';

describe('PenaltyDetailComponent', () => {
  const testBedHelper = new TestBedHelper<PenaltyDetailComponent>(PenaltyDetailComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PenaltyDetailComponent],
      imports: [ReactiveFormsModule, MatAutocompleteModule]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    component.data = [{ type: 'convictionType', penalty: { type: 'Days', value: 140 }, description: 'description' }];

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
