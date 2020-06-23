// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material';

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
    MatSlideToggleModule
  ],
  declarations: [
    MinesListComponent,
    MinesTableRowComponent,
    MinesDetailComponent,
    MinesAddEditComponent
  ],
  providers: [],
  entryComponents: [MinesTableRowComponent],
  exports: []
})
export class MinesModule {}
