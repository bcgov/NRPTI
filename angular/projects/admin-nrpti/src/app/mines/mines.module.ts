// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule, MatCheckboxModule } from '@angular/material';

// local modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared/shared.module';
import { MinesRoutingModule } from './mines-routing.module';

// mines
import { MinesTableRowComponent } from './mines-rows/mines-table-row.component';
import { MinesListComponent } from './mines-list/mines-list.component';
import { MinesDetailComponent } from './mines-detail/mines-detail.component';
import { MinesAddEditComponent } from './mines-add-edit/mines-add-edit.component';
import { MinesContentComponent } from './mines-content/mines-content.component';
import { MinesRecordsListComponent } from './mines-records-list/mines-records-list.component';
import { MinesRecordsTableRowComponent } from './mines-records-rows/mines-records-table-row.component';
import { MinesCollectionsListComponent } from './mines-collections-list/mines-collections-list.component';
import { MinesCollectionsTableRowComponent } from './mines-collections-rows/mines-collections-table-row.component';

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
    MatCheckboxModule
  ],
  declarations: [
    MinesListComponent,
    MinesTableRowComponent,
    MinesDetailComponent,
    MinesAddEditComponent,
    MinesContentComponent,
    MinesRecordsListComponent,
    MinesRecordsTableRowComponent,
    MinesCollectionsListComponent,
    MinesCollectionsTableRowComponent
  ],
  providers: [],
  entryComponents: [MinesTableRowComponent, MinesRecordsTableRowComponent, MinesCollectionsTableRowComponent],
  exports: []
})
export class MinesModule {}
