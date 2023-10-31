import { TestBed } from '@angular/core/testing';
import { MinesCollectionDetailComponent } from './mines-collection-detail.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { RecordDetailDirective } from '../../records/utils/record-detail.directive';
import { DatePipe } from '@angular/common';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { DialogService } from 'ng2-bootstrap-modal';
import { MatSlideToggleModule } from '@angular/material';
import { FactoryService } from '../../services/factory.service';
import { AgencyDataService } from '../../../../../global/src/lib/utils/agency-data-service';

class MockFactoryService {}

class MockAgencyDataService {}

describe('MinesCollectionDetailComponent', () => {
  const testBedHelper = new TestBedHelper<MinesCollectionDetailComponent>(MinesCollectionDetailComponent);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule, CommonModule, MatSlideToggleModule],
      declarations: [MinesCollectionDetailComponent, RecordDetailDirective],
      providers: [
        DatePipe,
        DialogService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useClass: MockFactoryService },
        { provide: AgencyDataService, useClass: MockAgencyDataService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
