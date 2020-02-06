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
import { BrowserModule } from '@angular/platform-browser';

// records
import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsTableRowComponent } from './records-rows/records-table-row.component';
import { RecordDetailDirective } from './utils/record-detail.directive';

// Orders
import { OrderAddEditComponent } from './orders/order-add-edit/order-add-edit.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { OrderNRCEDDetailComponent } from './orders/order-nrced-detail/order-nrced-detail.component';
import { OrderLNGDetailComponent } from './orders/order-lng-detail/order-lng-detail.component';

// Inspections
import { InspectionAddEditComponent } from './inspections/inspection-add-edit/inspection-add-edit.component';
import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { InspectionNRCEDDetailComponent } from './inspections/inspection-nrced-detail/inspection-nrced-detail.component';
import { InspectionLNGDetailComponent } from './inspections/inspection-lng-detail/inspection-lng-detail.component';

// certificates
import { CertificateAddEditComponent } from './certificates/certificate-add-edit/certificate-add-edit.component';
import { CertificateDetailComponent } from './certificates/certificate-detail/certificate-detail.component';
import { CertificateLNGDetailComponent } from './certificates/certificate-lng-detail/certificate-lng-detail.component';

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
    NgbModule.forRoot(),
    InlineSVGModule.forRoot(),
    RecordsRoutingModule
  ],
  declarations: [
    // records
    RecordsListComponent,
    RecordsTableRowComponent,
    RecordDetailDirective,
    // orders
    OrderAddEditComponent,
    OrderDetailComponent,
    OrderNRCEDDetailComponent,
    OrderLNGDetailComponent,
    // inspections
    InspectionAddEditComponent,
    InspectionDetailComponent,
    InspectionNRCEDDetailComponent,
    InspectionLNGDetailComponent,
    // certificates
    CertificateAddEditComponent,
    CertificateDetailComponent,
    CertificateLNGDetailComponent
  ],
  providers: [],
  entryComponents: [
    // records
    RecordsTableRowComponent,
    // orders
    OrderAddEditComponent,
    OrderLNGDetailComponent,
    OrderNRCEDDetailComponent,
    // inspections
    InspectionAddEditComponent,
    InspectionNRCEDDetailComponent,
    InspectionLNGDetailComponent,
    // certificates
    CertificateAddEditComponent,
    CertificateDetailComponent,
    CertificateLNGDetailComponent
  ],
  exports: []
})
export class RecordsModule {}
