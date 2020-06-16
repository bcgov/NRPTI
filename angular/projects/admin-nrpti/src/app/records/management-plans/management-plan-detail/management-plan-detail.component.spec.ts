import { async, TestBed } from '@angular/core/testing';
import { ManagementPlanDetailComponent } from './management-plan-detail.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { RecordDetailDirective } from '../../utils/record-detail.directive';
import { DatePipe } from '@angular/common';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { FactoryService } from '../../../services/factory.service';

describe('ManagementPlanDetailComponent', () => {
  const testBedHelper = new TestBedHelper<ManagementPlanDetailComponent>(ManagementPlanDetailComponent);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['userInRole']);
  mockFactoryService.userInRole.and.returnValue(true);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule, CommonModule],
      declarations: [ManagementPlanDetailComponent, RecordDetailDirective],
      providers: [
        DatePipe,
        { provide: Router, useValue: mockRouter },
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
