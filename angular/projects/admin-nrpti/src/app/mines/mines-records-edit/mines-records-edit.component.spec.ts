import { MinesRecordsEditComponent } from './mines-records-edit.component';
import { waitForAsync, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Utils } from 'nrpti-angular-components';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingScreenService } from 'nrpti-angular-components';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '@angular/common';
import { RecordUtils } from '../../records/utils/record-utils';
import { FactoryService } from '../../services/factory.service';
import { BsModalService } from 'ngx-bootstrap/modal';

// TODO: Skipping Test: Resolve in new ticket #1402
xdescribe('MinesRecordsEditComponent', () => {
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

  beforeEach(waitForAsync(() => {
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
      declarations: [MinesRecordsEditComponent],
      providers: [
        Utils,
        RecordUtils,
        BsModalService,
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
