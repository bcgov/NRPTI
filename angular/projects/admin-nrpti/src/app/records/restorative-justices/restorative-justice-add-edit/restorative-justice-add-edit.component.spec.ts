import { TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestorativeJusticeAddEditComponent } from './restorative-justice-add-edit.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule, StoreService } from 'nrpti-angular-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Utils } from 'nrpti-angular-components';
import { RecordUtils } from '../../utils/record-utils';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { MatSlideToggleModule } from '@angular/material';
import { LoadingScreenService } from 'nrpti-angular-components';
import { FactoryService } from '../../../services/factory.service';
import { EventEmitter } from '@angular/core';

describe('RestorativeJusticeAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<RestorativeJusticeAddEditComponent>(RestorativeJusticeAddEditComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', [
    'userInLngRole',
    'userInBcmiRole',
    'userInNrcedRole',
    'userOnlyInLimitedRole',
    'userInRole',
    'isFlavourEditEnabled'
  ]);
  mockFactoryService.userInLngRole.and.returnValue(true);
  mockFactoryService.userInBcmiRole.and.returnValue(true);
  mockFactoryService.userInNrcedRole.and.returnValue(true);

  const mockLoadingScreenService = {
    isLoading: false,
    setLoadingState: () => {
      return false;
    }
  };

  const mockStoreService = {
    getItem: () => {},
    stateChange: new EventEmitter()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        GlobalModule,
        CommonModule,
        MatSlideToggleModule,
        NgxPaginationModule,
        NgbModule
      ],
      declarations: [RestorativeJusticeAddEditComponent],
      providers: [
        Utils,
        RecordUtils,
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: StoreService, useValue: mockStoreService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useValue: mockFactoryService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
