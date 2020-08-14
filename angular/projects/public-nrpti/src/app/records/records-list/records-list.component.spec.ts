import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RecordsListComponent } from './records-list.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import {
  GlobalModule,
  TableTemplateUtils,
  Utils,
  LoadingScreenService
} from 'nrpti-angular-components';

describe('RecordsListComponent', () => {
  const testBedHelper = new TestBedHelper<RecordsListComponent>(RecordsListComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  const mockLoadingScreenService = {
    setLoadingState: () => { }
  };

  beforeEach((() => {
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
      declarations: [RecordsListComponent, SearchFiltersComponent],
      providers: [
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        TableTemplateUtils,
        Utils
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
