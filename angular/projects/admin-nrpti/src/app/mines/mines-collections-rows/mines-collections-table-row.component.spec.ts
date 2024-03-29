import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService } from 'ng2-bootstrap-modal';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { SharedModule } from '../../shared/shared.module';
import { MinesCollectionsTableRowComponent } from './mines-collections-table-row.component';
import { AgencyDataService } from '../../../../../global/src/lib/utils/agency-data-service';
import { FactoryService } from '../../services/factory.service';

class MockFactoryService {}

class MockAgencyDataService {}

describe('MinesCollectionsTableRowComponent', () => {
  const testBedHelper = new TestBedHelper<MinesCollectionsTableRowComponent>(MinesCollectionsTableRowComponent);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, CommonModule, GlobalModule],
      declarations: [MinesCollectionsTableRowComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useClass: MockFactoryService },
        { provide: AgencyDataService, useClass: MockAgencyDataService },
        DialogService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    component.rowData = {};

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
