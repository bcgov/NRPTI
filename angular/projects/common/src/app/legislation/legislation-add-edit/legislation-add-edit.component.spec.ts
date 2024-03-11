import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { TestBedHelper } from '../../spec/spec-utils';
import { LegislationAddEditComponent } from './legislation-add-edit.component';
import { Utils } from 'nrpti-angular-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FactoryService } from '../../../../../admin-nrpti/src/app/services/factory.service';

describe('LegislationAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<LegislationAddEditComponent>(LegislationAddEditComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegislationAddEditComponent],
      imports: [ReactiveFormsModule, FactoryService, MatAutocompleteModule, HttpClientTestingModule],
      providers: [Utils]
    }).compileComponents();
  });

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    const act = new FormControl();
    const regulation = new FormControl();
    const section = new FormControl();
    const subSection = new FormControl();
    const paragraph = new FormControl();
    const legislationDescription = new FormControl();

    component.formGroup = new FormGroup({ act, regulation, section, subSection, paragraph, legislationDescription });

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
