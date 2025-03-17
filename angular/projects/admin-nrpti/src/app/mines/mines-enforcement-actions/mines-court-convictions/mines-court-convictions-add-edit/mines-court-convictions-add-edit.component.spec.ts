import { TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MinesCourtConvictionsAddEditComponent } from './mines-court-convictions-add-edit.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule, StoreService } from 'nrpti-angular-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Utils } from 'nrpti-angular-components';
import { RecordUtils } from '../../../../records/utils/record-utils';
import { CommonModule } from '../../../../../../../common/src/app/common.module';
import { MatSlideToggleModule } from '@angular/material';
import { LoadingScreenService } from 'nrpti-angular-components';
import { FactoryService } from '../../../../services/factory.service';
import { EventEmitter } from '@angular/core';

describe('MinesCourtConvictionsAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<MinesCourtConvictionsAddEditComponent>(MinesCourtConvictionsAddEditComponent);

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

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  const mockStoreService = {
    getItem: () => {
      return ['item'];
    },
    stateChange: new EventEmitter()
  };

  const mockLoadingScreenService = {
    isLoading: false,
    setLoadingState: () => {
      return false;
    }
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
      declarations: [MinesCourtConvictionsAddEditComponent],
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
