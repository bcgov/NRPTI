import { TestBed } from '@angular/core/testing';
import { MatSlideToggleModule } from '@angular/material';
import { MinesRecordDetailComponent } from './mines-records-detail.component';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalModule } from 'nrpti-angular-components';
import { DatePipe } from '@angular/common';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { DocumentAuthenticatedReadOnlyComponent } from '../../documents/document-authenticated-read-only/document-authenticated-read-only.component';
import { S3SignedUrlAnchorComponent } from '../../documents/s3-signed-url-anchor/s3-signed-url-anchor.component';

describe('MinesRecordDetailComponent', () => {
  const testBedHelper = new TestBedHelper<MinesRecordDetailComponent>(MinesRecordDetailComponent);


  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule, CommonModule, MatSlideToggleModule],
      declarations: [MinesRecordDetailComponent, DocumentAuthenticatedReadOnlyComponent, S3SignedUrlAnchorComponent],
      providers: [
        DatePipe,
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
