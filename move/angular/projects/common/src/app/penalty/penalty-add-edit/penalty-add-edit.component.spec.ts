import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TestBedHelper } from '../../spec/spec-utils';
import { PenaltyAddEditComponent } from './penalty-add-edit.component';
import { GlobalModule, Utils } from 'nrpti-angular-components';

describe('PenaltyAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<PenaltyAddEditComponent>(PenaltyAddEditComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule, GlobalModule],
      providers: [Utils],
      declarations: [PenaltyAddEditComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    const type = new FormControl({});
    const penalty = new FormGroup({
      type: new FormControl(),
      value: new FormControl()
    });
    const description = new FormControl({});

    component.formArray = new FormArray([new FormGroup({ type, penalty, description })]);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
