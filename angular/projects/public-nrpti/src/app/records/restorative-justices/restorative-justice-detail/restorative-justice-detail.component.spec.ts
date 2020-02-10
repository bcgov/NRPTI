import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestorativeJusticeDetailComponent } from './restorative-justice-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';

describe('RestorativeJusticeDetailComponent', () => {
  let component: RestorativeJusticeDetailComponent;
  let fixture: ComponentFixture<RestorativeJusticeDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule],
      declarations: [RestorativeJusticeDetailComponent],
      providers: [{ provide: ActivatedRoute, useValue: activedRouteStub }, { provide: Router, useValue: mockRouter }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestorativeJusticeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
