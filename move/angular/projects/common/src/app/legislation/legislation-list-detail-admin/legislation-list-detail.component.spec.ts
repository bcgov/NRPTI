import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegislationListDetailComponent } from './legislation-list-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';

describe('LegislationListDetailComponent', () => {
  let component: LegislationListDetailComponent;
  let fixture: ComponentFixture<LegislationListDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule],
      declarations: [LegislationListDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activedRouteStub },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegislationListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
