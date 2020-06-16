import { async, TestBed } from '@angular/core/testing';
import { AdministrativeSanctionDetailComponent } from './administrative-sanction-detail.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalModule } from 'nrpti-angular-components';
import { RecordDetailDirective } from '../../utils/record-detail.directive';
import { DatePipe } from '@angular/common';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { DocumentAuthenticatedReadOnlyComponent } from '../../../documents/document-authenticated-read-only/document-authenticated-read-only.component';
import { S3SignedUrlAnchorComponent } from '../../../documents/s3-signed-url-anchor/s3-signed-url-anchor.component';
import { FactoryService } from '../../../services/factory.service';

describe('AdministrativeSanctionDetailComponent', () => {
  const testBedHelper = new TestBedHelper<AdministrativeSanctionDetailComponent>(AdministrativeSanctionDetailComponent);

  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['userInLngRole', 'userInNrcedRole']);
  mockFactoryService.userInLngRole.and.returnValue(true);
  mockFactoryService.userInNrcedRole.and.returnValue(true);

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule, CommonModule],
      declarations: [
        AdministrativeSanctionDetailComponent,
        RecordDetailDirective,
        DocumentAuthenticatedReadOnlyComponent,
        S3SignedUrlAnchorComponent
      ],
      providers: [
        DatePipe,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useValue: mockFactoryService }
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
