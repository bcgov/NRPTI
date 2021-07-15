import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule, MatAutocompleteModule, MatCheckboxModule, MatSlideToggleModule, MatChipsModule, MatChipList, MatIconModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';

// modules
import { GlobalModule } from 'nrpti-angular-components';

// components
import { DocumentLinkStagingComponent } from './document-link-staging/document-link-staging.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentReadOnlyComponent } from './document-read-only/document-read-only.component';
import { LegislationAddEditComponent } from './legislation/legislation-add-edit/legislation-add-edit.component';
import { LegislationListAddEditComponent } from './legislation/legislation-list-add-edit/legislation-list-add-edit.component';
import { LegislationListDetailComponent as LegislationListDetailAdminComponent } from './legislation/legislation-list-detail-admin/legislation-list-detail.component';
import { LegislationListDetailComponent as LegislationListDetailPublicComponent } from './legislation/legislation-list-detail-public/legislation-list-detail.component';
import { AutoCompleteMultiSelectComponent } from './autocomplete-multi-select/autocomplete-multi-select.component';
import { EntityAddEditComponent } from './entity/entity-add-edit/entity-add-edit.component';
import { EntityDetailComponent } from './entity/entity-detail/entity-detail.component';
import { PenaltyAddEditComponent } from './penalty/penalty-add-edit/penalty-add-edit.component';
import { PenaltyDetailComponent as PenaltyDetailAdminComponent } from './penalty/penalty-detail-admin/penalty-detail.component';
import { PenaltyDetailComponent as PenaltyDetailPublicComponent } from './penalty/penalty-detail-public/penalty-detail.component';
import { LinkAddEditComponent } from './link-add-edit/link-add-edit.component';
import { SearchFilterTemplateComponent } from './search-filter-template/search-filter-template.component';
import { RecordAssociationEditComponent } from './record-association/record-association-edit.component';
import { CallbackPipe } from './autocomplete-multi-select/callback.pipe';
import { StoreService } from 'nrpti-angular-components';

// services

@NgModule({
  declarations: [
    FileUploadComponent,
    DocumentLinkStagingComponent,
    DocumentEditComponent,
    DocumentReadOnlyComponent,
    LegislationAddEditComponent,
    LegislationListAddEditComponent,
    LegislationListDetailAdminComponent,
    LegislationListDetailPublicComponent,
    AutoCompleteMultiSelectComponent,
    EntityAddEditComponent,
    EntityDetailComponent,
    PenaltyAddEditComponent,
    PenaltyDetailAdminComponent,
    PenaltyDetailPublicComponent,
    LinkAddEditComponent,
    SearchFilterTemplateComponent,
    RecordAssociationEditComponent,
    CallbackPipe
  ],
  imports: [
    NgbModule,
    FormsModule,
    BrowserModule,
    GlobalModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    DragDropModule,
    MatTooltipModule
  ],
  providers: [MatChipList, StoreService],
  exports: [
    FileUploadComponent,
    DocumentLinkStagingComponent,
    DocumentEditComponent,
    DocumentReadOnlyComponent,
    LegislationAddEditComponent,
    LegislationListAddEditComponent,
    LegislationListDetailAdminComponent,
    LegislationListDetailPublicComponent,
    AutoCompleteMultiSelectComponent,
    EntityAddEditComponent,
    EntityDetailComponent,
    PenaltyAddEditComponent,
    PenaltyDetailAdminComponent,
    PenaltyDetailPublicComponent,
    LinkAddEditComponent,
    SearchFilterTemplateComponent,
    RecordAssociationEditComponent
  ]
})
export class CommonModule {}
