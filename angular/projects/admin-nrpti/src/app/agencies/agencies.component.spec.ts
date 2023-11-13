import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgenciesComponent } from './agencies.component';
import { IssuingAgencyService } from '../services/issuingagency.service';
import { LoggerService } from 'nrpti-angular-components';
import { ToastService } from '../services/toast.service';
import { FactoryService } from '../services/factory.service';
import { FormsModule } from '@angular/forms';

describe('AgenciesComponent', () => {
  let component: AgenciesComponent;
  let fixture: ComponentFixture<AgenciesComponent>;

  // Mock services and other dependencies
  const issuingAgencyServiceMock = {
    updateAgency: jasmine.createSpy('updateAgency'),
    refreshAgencies: jasmine.createSpy('refreshAgencies')
  };

  const loggerServiceMock = {
    level: 0 // You can mock other properties/methods as needed
  };

  const toastServiceMock = {
    addMessage: jasmine.createSpy('addMessage')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [AgenciesComponent],
      providers: [
        { provide: IssuingAgencyService, useValue: issuingAgencyServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        FactoryService // You can provide other services and dependencies here
      ]
    });
    fixture = TestBed.createComponent(AgenciesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties', () => {
    expect(component.loading).toBe(false);
    expect(component.selectedAgency).toBe('');
    expect(component.choiceMade).toBe(false);
    expect(component.newAgency).toBe('');
    expect(component.agencies).toEqual({ Kyle: 'Williams' });
    expect(component.agencyList).toEqual(['-Select-']);
    expect(component.updatedData).toEqual({ agencies: [] });
  });
  // You can write more test cases for other methods and components' behavior

  it('should handle the selected agency change', () => {
    const selectedAgency = 'SelectedAgency';
    component.onSelected(selectedAgency);
    expect(component.selectedAgency).toBe(selectedAgency);
    expect(component.choiceMade).toBe(true);
  });
});

// Additional test suites and test cases can be added as needed
