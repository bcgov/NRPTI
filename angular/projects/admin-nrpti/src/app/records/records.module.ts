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

// Permits
import { PermitAddEditComponent } from './permits/permit-add-edit/permit-add-edit.component';
import { PermitDetailComponent } from './permits/permit-detail/permit-detail.component';
import { PermitLNGDetailComponent } from './permits/permit-lng-detail/permit-lng-detail.component';

// Agreements
import { AgreementAddEditComponent } from './agreements/agreement-add-edit/agreement-add-edit.component';
import { AgreementDetailComponent } from './agreements/agreement-detail/agreement-detail.component';
import { AgreementLNGDetailComponent } from './agreements/agreement-lng-detail/agreement-lng-detail.component';

// SelfReports
import { SelfReportAddEditComponent } from './self-reports/self-report-add-edit/self-report-add-edit.component';
import { SelfReportDetailComponent } from './self-reports/self-report-detail/self-report-detail.component';
import { SelfReportLNGDetailComponent } from './self-reports/self-report-lng-detail/self-report-lng-detail.component';

// Restorative Justices
import { RestorativeJusticeAddEditComponent } from './restorative-justices/restorative-justice-add-edit/restorative-justice-add-edit.component';
import { RestorativeJusticeDetailComponent } from './restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { RestorativeJusticeNRCEDDetailComponent } from './restorative-justices/restorative-justice-nrced-detail/restorative-justice-nrced-detail.component';
import { RestorativeJusticeLNGDetailComponent } from './restorative-justices/restorative-justice-lng-detail/restorative-justice-lng-detail.component';

// Tickets
import { TicketAddEditComponent } from './tickets/ticket-add-edit/ticket-add-edit.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { TicketNRCEDDetailComponent } from './tickets/ticket-nrced-detail/ticket-nrced-detail.component';
import { TicketLNGDetailComponent } from './tickets/ticket-lng-detail/ticket-lng-detail.component';

// directives
import { RecordDetailDirective } from './utils/record-detail.directive';

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
    CertificateLNGDetailComponent,
    // permits
    PermitAddEditComponent,
    PermitDetailComponent,
    PermitLNGDetailComponent,
    // agreements
    AgreementDetailComponent,
    AgreementAddEditComponent,
    AgreementLNGDetailComponent,
    // self reports
    SelfReportAddEditComponent,
    SelfReportDetailComponent,
    SelfReportLNGDetailComponent,
    // restorative justices
    RestorativeJusticeAddEditComponent,
    RestorativeJusticeDetailComponent,
    RestorativeJusticeNRCEDDetailComponent,
    RestorativeJusticeLNGDetailComponent,
    // tickets
    TicketAddEditComponent,
    TicketDetailComponent,
    TicketNRCEDDetailComponent,
    TicketLNGDetailComponent
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
    CertificateLNGDetailComponent,
    // permits
    PermitAddEditComponent,
    PermitDetailComponent,
    PermitLNGDetailComponent,
    // agreements
    AgreementDetailComponent,
    AgreementAddEditComponent,
    AgreementLNGDetailComponent,
    // self reports
    SelfReportAddEditComponent,
    SelfReportDetailComponent,
    SelfReportLNGDetailComponent,
    // restorative justices
    RestorativeJusticeAddEditComponent,
    RestorativeJusticeDetailComponent,
    RestorativeJusticeNRCEDDetailComponent,
    RestorativeJusticeLNGDetailComponent,
    // tickets
    TicketAddEditComponent,
    TicketDetailComponent,
    TicketNRCEDDetailComponent,
    TicketLNGDetailComponent
  ],
  exports: []
})
export class RecordsModule {}
