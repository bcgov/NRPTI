import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { GlobalModule } from 'nrpti-angular-components';

// components
import { DocumentLinkStagingComponent } from './document-link-staging/document-link-staging.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentReadOnlyComponent } from './document-read-only/document-read-only.component';
import { EntityAddEditComponent } from './entity/entity-add-edit/entity-add-edit.component';

// services

@NgModule({
  declarations: [
    FileUploadComponent,
    DocumentLinkStagingComponent,
    DocumentEditComponent,
    DocumentReadOnlyComponent,
    EntityAddEditComponent
  ],
  imports: [NgbModule, FormsModule, ReactiveFormsModule, BrowserModule, GlobalModule],
  providers: [],
  exports: [
    FileUploadComponent,
    DocumentLinkStagingComponent,
    DocumentEditComponent,
    DocumentReadOnlyComponent,
    EntityAddEditComponent
  ]
})
export class CommonModule {}
