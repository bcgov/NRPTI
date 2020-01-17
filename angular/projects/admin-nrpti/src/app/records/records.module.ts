// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared.module';
import { RecordsRoutingModule } from './records-routing.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// components
import { RecordsListComponent } from './records-list/records-list.component';
import { OrderAddEditComponent } from './orders/order-add-edit/order-add-edit.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { BrowserModule } from '@angular/platform-browser';
import { RecordsTableRowComponent } from './records-rows/records-table-row.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    GlobalModule,
    ReactiveFormsModule,
    NrptiCommonModule,
    SharedModule,
    NgxPaginationModule,
    MatSlideToggleModule,
    NgbModule.forRoot(),
    InlineSVGModule.forRoot(),
    RecordsRoutingModule
  ],
  declarations: [OrderAddEditComponent, OrderDetailComponent, RecordsListComponent, RecordsTableRowComponent],
  providers: [],
  entryComponents: [OrderAddEditComponent, RecordsTableRowComponent],
  exports: []
})
export class RecordsModule { }
