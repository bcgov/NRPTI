import { async, TestBed } from '@angular/core/testing';
import { WarningNRCEDDetailComponent } from './warning-nrced-detail.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { DatePipe } from '@angular/common';
import { FactoryService } from '../../../services/factory.service';

describe('WarningNRCEDDetailComponent', () => {
  const testBedHelper = new TestBedHelper<WarningNRCEDDetailComponent>(WarningNRCEDDetailComponent);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['userInRole']);
  mockFactoryService.userInRole.and.returnValue(true);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule],
      declarations: [WarningNRCEDDetailComponent],
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
