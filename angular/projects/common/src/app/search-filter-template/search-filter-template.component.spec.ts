import { async, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatTooltipModule } from '@angular/material';
import { TestBedHelper } from '../spec/spec-utils';
import { SearchFilterTemplateComponent } from './search-filter-template.component';
import { GlobalModule, Utils } from 'nrpti-angular-components';

describe('SearchFilterTemplateComponent', () => {
  const testBedHelper = new TestBedHelper<SearchFilterTemplateComponent>(SearchFilterTemplateComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule, GlobalModule, MatTooltipModule],
      providers: [Utils],
      declarations: [SearchFilterTemplateComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent(false);

    expect(component).toBeTruthy();
  });
});
