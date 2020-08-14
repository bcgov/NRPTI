import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDetailComponent } from './ticket-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../../../../common/src/app/common.module';

describe('TicketDetailComponent', () => {
  let component: TicketDetailComponent;
  let fixture: ComponentFixture<TicketDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule, CommonModule],
      declarations: [TicketDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activedRouteStub },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
