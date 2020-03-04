import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

// modules
import { GlobalModule } from 'nrpti-angular-components';

// components
import { DocumentLinkStagingComponent } from './document-link-staging/document-link-staging.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

// services

@NgModule({
  declarations: [FileUploadComponent, DocumentLinkStagingComponent],
  imports: [NgbModule, FormsModule, BrowserModule, GlobalModule],
  providers: [],
  exports: [FileUploadComponent, DocumentLinkStagingComponent]
})
export class CommonModule {}
