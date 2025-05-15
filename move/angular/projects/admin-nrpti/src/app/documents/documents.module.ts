// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DocumentAuthenticatedReadOnlyComponent } from '../documents/document-authenticated-read-only/document-authenticated-read-only.component';
import { S3SignedUrlAnchorComponent } from '../documents/s3-signed-url-anchor/s3-signed-url-anchor.component';

@NgModule({
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  declarations: [DocumentAuthenticatedReadOnlyComponent, S3SignedUrlAnchorComponent],
  providers: [],
  exports: [DocumentAuthenticatedReadOnlyComponent]
})
export class DocumentsModule {}
