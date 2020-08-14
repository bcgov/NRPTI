// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule, MatCheckboxModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';

// local modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared/shared.module';
import { MinesRoutingModule } from './mines-routing.module';
import { DocumentsModule } from '../documents/documents.module';

// mines
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
import { MinesCollectionsRecordAddComponent } from './mines-collections-record-add/mines-collections-record-add.component';
import { MinesRecordsAddEditComponent } from './mines-records-add-edit/mines-records-add-edit.component';

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
    NgbModule.forRoot(),
    MinesRoutingModule,
    MatTooltipModule,
    NgbDropdownModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    DragDropModule,
    DocumentsModule
  ],
  declarations: [
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
    MinesCollectionsRecordAddComponent,
    MinesRecordDetailComponent,
    MinesRecordsAddEditComponent
  ],
  providers: [],
  entryComponents: [
    MinesTableRowComponent,
    MinesRecordsTableRowComponent,
    MinesCollectionsTableRowComponent,
    MinesCollectionRecordTableRowComponent,
  ],
  exports: [
    MinesCollectionsRecordAddComponent
  ]
})
export class MinesModule { }
