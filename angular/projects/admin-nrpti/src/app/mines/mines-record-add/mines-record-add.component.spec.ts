import { waitForAsync, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { GlobalModule, LoadingScreenService, Utils, StoreService } from 'nrpti-angular-components';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { ActivatedRouteStub, TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { RecordUtils } from '../../records/utils/record-utils';
import { FactoryService } from '../../services/factory.service';
import { SharedModule } from '../../shared/shared.module';
import { MinesRecordAddComponent } from './mines-record-add.component';

xdescribe('MinesAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<MinesRecordAddComponent>(MinesRecordAddComponent);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', [
    'editCollection',
    'createCollection',
    'deleteCollection'
  ]);

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
        SharedModule,
        MatSlideToggleModule,
        NgxPaginationModule,
        NgbModule
      ],
      declarations: [MinesRecordAddComponent],
      providers: [
        Utils,
        RecordUtils,
        BsModalService,
        StoreService,
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useValue: mockFactoryService }
      ]
    }).compileComponents();
  }));

  it('should create', waitForAsync(() => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  }));
});
