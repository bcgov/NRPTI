// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EditorModule } from '@tinymce/tinymce-angular';

// local modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared/shared.module';
import { MinesRoutingModule } from './mines-routing.module';
import { DocumentsModule } from '../documents/documents.module';
import { RecordsModule } from '../records/records.module';

// mines
import { ConfirmComponentNew } from './../confirm/confirm.component';
import { MinesTableRowComponent } from './mines-rows/mines-table-row.component';
import { MinesListComponent } from './mines-list/mines-list.component';
import { MinesDetailComponent } from './mines-detail/mines-detail.component';
import { MinesAddEditComponent } from './mines-add-edit/mines-add-edit.component';
import { MinesRecordsListComponent } from './mines-records-list/mines-records-list.component';
import { MinesRecordsTableRowComponent } from './mines-records-rows/mines-records-table-row.component';
import { MinesCollectionsListComponent } from './mines-collections-list/mines-collections-list.component';
import { MinesCollectionsTableRowComponent } from './mines-collections-rows/mines-collections-table-row.component';
import { MinesCollectionDetailComponent } from './mines-collection-detail/mines-collection-detail.component';
import { MinesCollectionRecordTableRowComponent } from './mines-collection-detail/mines-collection-detail-record-row/mines-collection-detail-record-row.component';
import { MinesCollectionsAddEditComponent } from './mines-collections-add-edit/mines-collections-add-edit.component';
import { MinesRecordDetailComponent } from './mines-records-detail/mines-records-detail.component';
import { MinesRecordAddComponent } from './mines-record-add/mines-record-add.component';
import { MinesRecordsEditComponent } from './mines-records-edit/mines-records-edit.component';
import { EnforcementActionsComponent } from '../enforcement-actions/enforcement-actions.component';
import { EnforcementActionsTableComponent } from '../enforcement-actions/enforcement-actions-table/enforcement-actions-table.component';
import { EnforcementActionsTableRowComponent } from '../enforcement-actions/enforcement-actions-table/enforcement-actions-table-row/enforcement-actions-table-row.component';
import { EnforcementActionsResolver } from '../enforcement-actions/enforcement-actions-resolver';
import { MinesAdministrativePenaltyAddEditComponent } from './mines-enforcement-actions/mines-administrative-penalty-add-edit/mines-administrative-penalty-add-edit.component';
import { MinesAdministrativePenaltyDetailComponent } from './mines-enforcement-actions/mines-administrative-penalty-detail/mines-administrative-penalty-detail.component';
import { MinesCourtConvictionsAddEditComponent } from './mines-enforcement-actions/mines-court-convictions/mines-court-convictions-add-edit/mines-court-convictions-add-edit.component';
import { MinesCourtConvictionsDetailComponent } from './mines-enforcement-actions/mines-court-convictions/mines-court-convictions-detail/mines-court-convictions-detail.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GlobalModule,
    NrptiCommonModule,
    SharedModule,
    NgxPaginationModule,
    NgbModule,
    MinesRoutingModule,
    MatTooltipModule,
    NgbDropdownModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    DragDropModule,
    DocumentsModule,
    EditorModule,
    RecordsModule
  ],
  declarations: [
    ConfirmComponentNew,
    MinesListComponent,
    MinesTableRowComponent,
    MinesDetailComponent,
    MinesAddEditComponent,
    MinesRecordsListComponent,
    MinesRecordsTableRowComponent,
    MinesCollectionsListComponent,
    MinesCollectionsTableRowComponent,
    MinesCollectionDetailComponent,
    MinesCollectionRecordTableRowComponent,
    MinesCollectionsAddEditComponent,
    MinesRecordAddComponent,
    MinesRecordDetailComponent,
    MinesRecordsEditComponent,
    EnforcementActionsComponent,
    EnforcementActionsTableRowComponent,
    EnforcementActionsTableComponent,
    MinesAdministrativePenaltyAddEditComponent,
    MinesAdministrativePenaltyDetailComponent,
    MinesCourtConvictionsAddEditComponent,
    MinesCourtConvictionsDetailComponent
  ],
  providers: [EnforcementActionsResolver],
  exports: [MinesRecordAddComponent]
})
export class MinesModule {}
