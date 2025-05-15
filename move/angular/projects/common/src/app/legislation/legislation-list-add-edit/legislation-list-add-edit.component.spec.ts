import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TestBedHelper } from './../../spec/spec-utils';
import { LegislationListAddEditComponent } from './legislation-list-add-edit.component';
import { LegislationAddEditComponent } from './../legislation-add-edit/legislation-add-edit.component';
import { Utils, ConfigService } from 'nrpti-angular-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FactoryService } from '../../../../../admin-nrpti/src/app/services/factory.service';

describe('LegislationListAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<LegislationListAddEditComponent>(LegislationListAddEditComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegislationListAddEditComponent, LegislationAddEditComponent],
      imports: [FormsModule, ReactiveFormsModule, MatAutocompleteModule, HttpClientTestingModule],
      providers: [Utils, ConfigService, FactoryService]
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

    component.formArray = new FormArray([
      new FormGroup({
        act,
        regulation,
        section,
        subSection,
        paragraph,
        legislationDescription
      })
    ]);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
