import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TestBedHelper } from '../spec/spec-utils';
import { SearchFilterTemplateComponent } from './search-filter-template.component';
import { GlobalModule, Utils } from 'nrpti-angular-components';
import { AutoCompleteMultiSelectComponent } from '../autocomplete-multi-select/autocomplete-multi-select.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CallbackPipe } from '../autocomplete-multi-select/callback.pipe';

describe('SearchFilterTemplateComponent', () => {
  const testBedHelper = new TestBedHelper<SearchFilterTemplateComponent>(SearchFilterTemplateComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        GlobalModule,
        MatTooltipModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatIconModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [Utils],
      declarations: [SearchFilterTemplateComponent, AutoCompleteMultiSelectComponent, CallbackPipe]
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = testBedHelper.createComponent(false);

    expect(component).toBeTruthy();
  });
});
