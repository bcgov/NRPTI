import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LegislationListDetailComponent } from './legislation-list-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';
import { Legislation } from '../../models/master/common-models/legislation';

describe('LegislationListDetailComponent', () => {
  let component: LegislationListDetailComponent;
  let fixture: ComponentFixture<LegislationListDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule, HttpClientTestingModule],
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

  it('should display an actCode when the backend cannot return the legislation code map', async () => {
    const testActCode = 'ACT_103';
    const testLegislation = new Legislation({ act: testActCode });

    // populates the component with legislation data,
    // which will then be parsed by buildLegislationString() and added as a grid item
    component.data = [testLegislation];
    fixture.detectChanges();
    const gridEl = fixture.nativeElement.querySelector('.grid-item-value');

    expect(gridEl.textContent).toContain(testActCode);
  });
});
