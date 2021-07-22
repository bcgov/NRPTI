import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionDetailComponent } from './inspection-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { ProjectLinkPipe } from '../../../pipes/project-link.pipe';

describe('InspectionDetailComponent', () => {
  let component: InspectionDetailComponent;
  let fixture: ComponentFixture<InspectionDetailComponent>;

  const activedRouteStub = new ActivatedRouteStub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalModule,
        CommonModule
      ],
      declarations: [
        InspectionDetailComponent,
        ProjectLinkPipe,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activedRouteStub },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
