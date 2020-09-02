import { MinesRecordsEditComponent } from './mines-records-edit.component';
import { async, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Utils } from 'nrpti-angular-components';
import { MatSlideToggleModule } from '@angular/material';
import { LoadingScreenService } from 'nrpti-angular-components';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '@angular/common';
import { RecordUtils } from '../../records/utils/record-utils';
import { FactoryService } from '../../services/factory.service';
import { DialogService } from 'ng2-bootstrap-modal';

describe('MinesRecordsEditComponent', () => {
  const testBedHelper = new TestBedHelper<MinesRecordsEditComponent>(MinesRecordsEditComponent);

  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['userInBcmiRole']);
  mockFactoryService.userInBcmiRole.and.returnValue(true);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

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
        CommonModule,
        MatSlideToggleModule,
        NgxPaginationModule,
        NgbModule.forRoot()
      ],
      declarations: [MinesRecordsEditComponent],
      providers: [
        Utils,
        RecordUtils,
        DialogService,
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
