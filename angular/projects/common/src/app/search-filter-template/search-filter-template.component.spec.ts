import { async, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatTooltipModule, MatSelectModule, MatCheckboxModule, MatSlideToggleModule } from '@angular/material';
import { TestBedHelper } from '../spec/spec-utils';
import { SearchFilterTemplateComponent } from './search-filter-template.component';
import { GlobalModule, Utils } from 'nrpti-angular-components';
import { AutoCompleteMultiSelectComponent } from '../autocomplete-multi-select/autocomplete-multi-select.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SearchFilterTemplateComponent', () => {
  const testBedHelper = new TestBedHelper<SearchFilterTemplateComponent>(SearchFilterTemplateComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        GlobalModule,
        MatTooltipModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        FormsModule,
        RouterTestingModule],
      providers: [Utils],
      declarations: [SearchFilterTemplateComponent, AutoCompleteMultiSelectComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent(false);

    expect(component).toBeTruthy();
  });
});
