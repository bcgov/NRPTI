import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatCheckboxModule } from '@angular/material';

// modules
import { GlobalModule } from 'nrpti-angular-components';

// components
import { DocumentLinkStagingComponent } from './document-link-staging/document-link-staging.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentReadOnlyComponent } from './document-read-only/document-read-only.component';
import { LegislationAddEditComponent } from './legislation-add-edit/legislation-add-edit.component';
import { AutoCompleteMultiSelectComponent } from './autocomplete-multi-select/autocomplete-multi-select.component';

// services

@NgModule({
  declarations: [
    FileUploadComponent,
    DocumentLinkStagingComponent,
    DocumentEditComponent,
    DocumentReadOnlyComponent,
    LegislationAddEditComponent,
    AutoCompleteMultiSelectComponent
  ],
  imports: [
    NgbModule,
    FormsModule,
    BrowserModule,
    GlobalModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule
  ],
  providers: [],
  exports: [
    FileUploadComponent,
    DocumentLinkStagingComponent,
    DocumentEditComponent,
    DocumentReadOnlyComponent,
    LegislationAddEditComponent,
    AutoCompleteMultiSelectComponent
  ]
})
export class CommonModule {}
