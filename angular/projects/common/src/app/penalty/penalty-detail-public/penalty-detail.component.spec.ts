import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyDetailComponent } from './penalty-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';

describe('PenaltyDetailComponent', () => {
  let component: PenaltyDetailComponent;
  let fixture: ComponentFixture<PenaltyDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule],
      declarations: [PenaltyDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activedRouteStub },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
