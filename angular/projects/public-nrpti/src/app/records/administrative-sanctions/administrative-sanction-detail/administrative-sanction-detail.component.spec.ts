import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeSanctionDetailComponent } from './administrative-sanction-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../../../../common/src/app/common.module';

describe('AdministrativeSanctionDetailComponent', () => {
  let component: AdministrativeSanctionDetailComponent;
  let fixture: ComponentFixture<AdministrativeSanctionDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule, CommonModule],
      declarations: [AdministrativeSanctionDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activedRouteStub },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativeSanctionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
