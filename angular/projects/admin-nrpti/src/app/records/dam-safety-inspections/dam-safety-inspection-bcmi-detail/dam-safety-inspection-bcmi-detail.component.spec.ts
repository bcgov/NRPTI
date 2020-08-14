import { TestBed } from '@angular/core/testing';
import { DamSafetyInspectionBCMIDetailComponent } from './dam-safety-inspection-bcmi-detail.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule, StoreService } from 'nrpti-angular-components';
import { DatePipe } from '@angular/common';
import { FactoryService } from '../../../services/factory.service';
import { EventEmitter } from '@angular/core';

describe('CorrespondenceBCMIDetailComponent', () => {
  const testBedHelper = new TestBedHelper<DamSafetyInspectionBCMIDetailComponent>
    (DamSafetyInspectionBCMIDetailComponent);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['userInBcmiRole']);
  mockFactoryService.userInBcmiRole.and.returnValue(true);

  const mockStoreService = {
    getItem: () => { },
    stateChange: new EventEmitter()
  };

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule],
      declarations: [DamSafetyInspectionBCMIDetailComponent],
      providers: [
        DatePipe,
        { provide: Router, useValue: mockRouter },
        { provide: StoreService, useValue: mockStoreService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useValue: mockFactoryService }
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
