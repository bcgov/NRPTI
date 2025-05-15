import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AdministrativePenaltyDetailComponent } from './administrative-penalty-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { ProjectLinkPipe } from '../../../pipes/project-link.pipe';

describe('AdministrativePenaltyDetailComponent', () => {
  let component: AdministrativePenaltyDetailComponent;
  let fixture: ComponentFixture<AdministrativePenaltyDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobalModule, CommonModule, HttpClientTestingModule],
      declarations: [AdministrativePenaltyDetailComponent, ProjectLinkPipe],
      providers: [
        { provide: ActivatedRoute, useValue: activedRouteStub },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativePenaltyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
