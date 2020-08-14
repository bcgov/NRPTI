// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared/shared.module';
import { RecordsRoutingModule } from './records-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { DocumentsModule } from '../documents/documents.module';

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

// Administrative Penalties
import { AdministrativePenaltyAddEditComponent } from './administrative-penalties/administrative-penalty-add-edit/administrative-penalty-add-edit.component';
import { AdministrativePenaltyDetailComponent } from './administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativePenaltyNRCEDDetailComponent } from './administrative-penalties/administrative-penalty-nrced-detail/administrative-penalty-nrced-detail.component';
import { AdministrativePenaltyLNGDetailComponent } from './administrative-penalties/administrative-penalty-lng-detail/administrative-penalty-lng-detail.component';

// Administrative Sanctions
import { AdministrativeSanctionAddEditComponent } from './administrative-sanctions/administrative-sanction-add-edit/administrative-sanction-add-edit.component';
import { AdministrativeSanctionDetailComponent } from './administrative-sanctions/administrative-sanction-detail/administrative-sanction-detail.component';
import { AdministrativeSanctionNRCEDDetailComponent } from './administrative-sanctions/administrative-sanction-nrced-detail/administrative-sanction-nrced-detail.component';
import { AdministrativeSanctionLNGDetailComponent } from './administrative-sanctions/administrative-sanction-lng-detail/administrative-sanction-lng-detail.component';

// Warnings
import { WarningAddEditComponent } from './warnings/warning-add-edit/warning-add-edit.component';
import { WarningDetailComponent } from './warnings/warning-detail/warning-detail.component';
import { WarningNRCEDDetailComponent } from './warnings/warning-nrced-detail/warning-nrced-detail.component';
import { WarningLNGDetailComponent } from './warnings/warning-lng-detail/warning-lng-detail.component';

// ConstructionPlans
import { ConstructionPlanAddEditComponent } from './construction-plans/construction-plan-add-edit/construction-plan-add-edit.component';
import { ConstructionPlanDetailComponent } from './construction-plans/construction-plan-detail/construction-plan-detail.component';
import { ConstructionPlanLNGDetailComponent } from './construction-plans/construction-plan-lng-detail/construction-plan-lng-detail.component';

// management plans
import { ManagementPlanAddEditComponent } from './management-plans/management-plan-add-edit/management-plan-add-edit.component';
import { ManagementPlanDetailComponent } from './management-plans/management-plan-detail/management-plan-detail.component';
import { ManagementPlanLNGDetailComponent } from './management-plans/management-plan-lng-detail/management-plan-lng-detail.component';

// court convictions
import { CourtConvictionAddEditComponent } from './court-convictions/court-conviction-add-edit/court-conviction-add-edit.component';
import { CourtConvictionDetailComponent } from './court-convictions/court-conviction-detail/court-conviction-detail.component';
import { CourtConvictionNRCEDDetailComponent } from './court-convictions/court-conviction-nrced-detail/court-conviction-nrced-detail.component';
import { CourtConvictionLNGDetailComponent } from './court-convictions/court-conviction-lng-detail/court-conviction-lng-detail.component';

// certificate amendments
import { CertificateAmendmentAddEditComponent } from './certificate-amendments/certificate-amendments-add-edit/certificate-amendments-add-edit.component';
import { CertificateAmendmentDetailComponent } from './certificate-amendments/certificate-amendments-detail/certificate-amendments-detail.component';
import { CertificateAmendmentLNGDetailComponent } from './certificate-amendments/certificate-amendments-lng-detail/certificate-amendments-lng-detail.component';
import { CertificateAmendmentBCMIDetailComponent } from './certificate-amendments/certificate-amendments-bcmi-detail/certificate-amendments-bcmi-detail.component';

// correspondence
import { CorrespondenceAddEditComponent } from './correspondences/correspondence-add-edit/correspondence-add-edit.component';
import { CorrespondenceDetailComponent } from './correspondences/correspondence-detail/correspondence-detail.component';
import { CorrespondenceBCMIDetailComponent } from './correspondences/correspondence-bcmi-detail/correspondence-bcmi-detail.component';
import { CorrespondenceNRCEDDetailComponent } from './correspondences/correspondence-nrced-detail/correspondence-nrced-detail.component';

// report
import { ReportAddEditComponent } from './reports/report-add-edit/report-add-edit.component';
import { ReportDetailComponent } from './reports/report-detail/report-detail.component';
import { ReportBCMIDetailComponent } from './reports/report-bcmi-detail/report-bcmi-detail.component';
import { ReportNRCEDDetailComponent } from './reports/report-nrced-detail/report-nrced-detail.component';

// dam safety inspection
import { DamSafetyInspectionAddEditComponent } from './dam-safety-inspections/dam-safety-inspection-add-edit/dam-safety-inspection-add-edit.component';
import { DamSafetyInspectionDetailComponent } from './dam-safety-inspections/dam-safety-inspection-detail/dam-safety-inspection-detail.component';
import { DamSafetyInspectionBCMIDetailComponent } from './dam-safety-inspections/dam-safety-inspection-bcmi-detail/dam-safety-inspection-bcmi-detail.component';
import { DamSafetyInspectionNRCEDDetailComponent } from './dam-safety-inspections/dam-safety-inspection-nrced-detail/dam-safety-inspection-nrced-detail.component';

// annual reports
import { AnnualReportAddEditComponent } from './annual-reports/annual-report-add-edit/annual-report-add-edit.component';
import { AnnualReportDetailComponent } from './annual-reports/annual-report-detail/annual-report-detail.component';
import { AnnualReportBCMIDetailComponent } from './annual-reports/annual-report-bcmi-detail/annual-report-bcmi-detail.component';

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
    RecordsRoutingModule,
    MatTooltipModule,
    MatCheckboxModule,
    NgbDropdownModule,
    DocumentsModule
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
    TicketLNGDetailComponent,
    // administrative penatlies
    AdministrativePenaltyAddEditComponent,
    AdministrativePenaltyDetailComponent,
    AdministrativePenaltyNRCEDDetailComponent,
    AdministrativePenaltyLNGDetailComponent,
    // administrative sanctions
    AdministrativeSanctionAddEditComponent,
    AdministrativeSanctionDetailComponent,
    AdministrativeSanctionNRCEDDetailComponent,
    AdministrativeSanctionLNGDetailComponent,
    // warnings
    WarningAddEditComponent,
    WarningDetailComponent,
    WarningNRCEDDetailComponent,
    WarningLNGDetailComponent,
    // construction plans
    ConstructionPlanDetailComponent,
    ConstructionPlanAddEditComponent,
    ConstructionPlanLNGDetailComponent,
    // management plans
    ManagementPlanAddEditComponent,
    ManagementPlanDetailComponent,
    ManagementPlanLNGDetailComponent,
    // court convictions
    CourtConvictionAddEditComponent,
    CourtConvictionDetailComponent,
    CourtConvictionNRCEDDetailComponent,
    CourtConvictionLNGDetailComponent,
    // certificate amendments
    CertificateAmendmentAddEditComponent,
    CertificateAmendmentDetailComponent,
    CertificateAmendmentLNGDetailComponent,
    CertificateAmendmentBCMIDetailComponent,
    // correspondence
    CorrespondenceAddEditComponent,
    CorrespondenceDetailComponent,
    CorrespondenceBCMIDetailComponent,
    CorrespondenceNRCEDDetailComponent,
    // report
    ReportAddEditComponent,
    ReportDetailComponent,
    ReportBCMIDetailComponent,
    ReportNRCEDDetailComponent,
    // dam safety inspection
    DamSafetyInspectionAddEditComponent,
    DamSafetyInspectionDetailComponent,
    DamSafetyInspectionBCMIDetailComponent,
    DamSafetyInspectionNRCEDDetailComponent,
    // annual report
    AnnualReportAddEditComponent,
    AnnualReportDetailComponent,
    AnnualReportBCMIDetailComponent
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
    TicketLNGDetailComponent,
    // administrative penalties
    AdministrativePenaltyAddEditComponent,
    AdministrativePenaltyDetailComponent,
    AdministrativePenaltyNRCEDDetailComponent,
    AdministrativePenaltyLNGDetailComponent,
    // administrative sanctions
    AdministrativeSanctionAddEditComponent,
    AdministrativeSanctionDetailComponent,
    AdministrativeSanctionNRCEDDetailComponent,
    AdministrativeSanctionLNGDetailComponent,
    // warnings
    WarningAddEditComponent,
    WarningDetailComponent,
    WarningNRCEDDetailComponent,
    WarningLNGDetailComponent,
    // construction plans
    ConstructionPlanDetailComponent,
    ConstructionPlanAddEditComponent,
    ConstructionPlanLNGDetailComponent,
    // management plans
    ManagementPlanAddEditComponent,
    ManagementPlanDetailComponent,
    ManagementPlanLNGDetailComponent,
    // court convictions
    CourtConvictionAddEditComponent,
    CourtConvictionDetailComponent,
    CourtConvictionNRCEDDetailComponent,
    CourtConvictionLNGDetailComponent,
    // certificate amendments
    CertificateAmendmentAddEditComponent,
    CertificateAmendmentDetailComponent,
    CertificateAmendmentBCMIDetailComponent,
    CertificateAmendmentLNGDetailComponent,
    // correspondence
    CorrespondenceAddEditComponent,
    CorrespondenceDetailComponent,
    CorrespondenceBCMIDetailComponent,
    CorrespondenceNRCEDDetailComponent,
    // report
    ReportAddEditComponent,
    ReportDetailComponent,
    ReportBCMIDetailComponent,
    ReportNRCEDDetailComponent,
    // dam safety inspection
    DamSafetyInspectionAddEditComponent,
    DamSafetyInspectionDetailComponent,
    DamSafetyInspectionBCMIDetailComponent,
    DamSafetyInspectionNRCEDDetailComponent,
    // annual report
    AnnualReportAddEditComponent,
    AnnualReportDetailComponent,
    AnnualReportBCMIDetailComponent
  ],
  exports: []
})
export class RecordsModule {}
