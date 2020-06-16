import { async, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManagementPlanAddEditComponent } from './management-plan-add-edit.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Utils } from 'nrpti-angular-components';
import { RecordUtils } from '../../utils/record-utils';
import { LoadingScreenService } from 'nrpti-angular-components';
import { FactoryService } from '../../../services/factory.service';

describe('ManagementPlanAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<ManagementPlanAddEditComponent>(ManagementPlanAddEditComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['userInRole']);
  mockFactoryService.userInRole.and.returnValue(true);

  const mockLoadingScreenService = {
    isLoading: false,
    setLoadingState: () => {
      return false;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        GlobalModule,
        NgxPaginationModule,
        NgbModule.forRoot()
      ],
      declarations: [ManagementPlanAddEditComponent],
      providers: [
        Utils,
        RecordUtils,
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useValue: mockFactoryService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
