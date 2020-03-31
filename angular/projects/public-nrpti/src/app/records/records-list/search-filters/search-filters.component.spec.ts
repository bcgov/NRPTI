import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchFiltersComponent } from './search-filters.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { SharedModule } from '../../../shared.module';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { GlobalModule, Utils } from 'nrpti-angular-components';

describe('SearchFiltersComponent', () => {
  const testBedHelper = new TestBedHelper<SearchFiltersComponent>(SearchFiltersComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        CommonModule,
        GlobalModule,
        NgxPaginationModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [SearchFiltersComponent],
      providers: [
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        Utils
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const formGroup = new FormGroup({
      dateIssuedStart: new FormControl(),
      dateIssuedEnd: new FormControl(),
      issuedToCompany: new FormControl(),
      issuedToIndividual: new FormControl(),
      activityType: new FormControl(),
      agency: new FormControl(),
      act: new FormControl(),
      regulation: new FormControl()
    });

    const { component, fixture } = testBedHelper.createComponent(false);

    component.formGroup = formGroup;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
