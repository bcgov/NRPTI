import { Type } from '@angular/core';
import {
  Order,
  OrderNRCED,
  OrderLNG,
  Inspection,
  InspectionNRCED,
  InspectionLNG,
  Certificate,
  CertificateLNG,
  Permit,
  PermitLNG,
  Agreement,
  AgreementLNG,
  SelfReport,
  SelfReportLNG,
  RestorativeJustice,
  RestorativeJusticeLNG,
  RestorativeJusticeNRCED,
  Ticket,
  TicketLNG,
  TicketNRCED,
  AdministrativePenalty,
  AdministrativePenaltyLNG,
  AdministrativePenaltyNRCED,
  AdministrativeSanction,
  AdministrativeSanctionLNG,
  AdministrativeSanctionNRCED,
  Warning,
  WarningLNG,
  WarningNRCED,
  ConstructionPlan,
  ConstructionPlanLNG,
  ManagementPlan,
  ManagementPlanLNG
} from '../../../../../common/src/app/models';

// orders
import { OrderNRCEDDetailComponent } from '../orders/order-nrced-detail/order-nrced-detail.component';
import { OrderLNGDetailComponent } from '../orders/order-lng-detail/order-lng-detail.component';

// inspections
import { InspectionNRCEDDetailComponent } from '../inspections/inspection-nrced-detail/inspection-nrced-detail.component';
import { InspectionLNGDetailComponent } from '../inspections/inspection-lng-detail/inspection-lng-detail.component';

// certificates
import { CertificateLNGDetailComponent } from '../certificates/certificate-lng-detail/certificate-lng-detail.component';

// permits
import { PermitLNGDetailComponent } from '../permits/permit-lng-detail/permit-lng-detail.component';

// agreements
import { AgreementLNGDetailComponent } from '../agreements/agreement-lng-detail/agreement-lng-detail.component';

// self reports
import { SelfReportLNGDetailComponent } from '../self-reports/self-report-lng-detail/self-report-lng-detail.component';

// restorative justices
import { RestorativeJusticeNRCEDDetailComponent } from '../restorative-justices/restorative-justice-nrced-detail/restorative-justice-nrced-detail.component';
import { RestorativeJusticeLNGDetailComponent } from '../restorative-justices/restorative-justice-lng-detail/restorative-justice-lng-detail.component';

// tickets
import { TicketLNGDetailComponent } from '../tickets/ticket-lng-detail/ticket-lng-detail.component';
import { TicketNRCEDDetailComponent } from '../tickets/ticket-nrced-detail/ticket-nrced-detail.component';

// administrative penalties
import { AdministrativePenaltyNRCEDDetailComponent } from '../administrative-penalties/administrative-penalty-nrced-detail/administrative-penalty-nrced-detail.component';
import { AdministrativePenaltyLNGDetailComponent } from '../administrative-penalties/administrative-penalty-lng-detail/administrative-penalty-lng-detail.component';

// administrative sanctions
import { AdministrativeSanctionNRCEDDetailComponent } from '../administrative-sanctions/administrative-sanction-nrced-detail/administrative-sanction-nrced-detail.component';
import { AdministrativeSanctionLNGDetailComponent } from '../administrative-sanctions/administrative-sanction-lng-detail/administrative-sanction-lng-detail.component';

// warnings
import { WarningNRCEDDetailComponent } from '../warnings/warning-nrced-detail/warning-nrced-detail.component';
import { WarningLNGDetailComponent } from '../warnings/warning-lng-detail/warning-lng-detail.component';

// other
import { ConstructionPlanLNGDetailComponent } from '../construction-plans/construction-plan-lng-detail/construction-plan-lng-detail.component';

// management plans
import { ManagementPlanLNGDetailComponent } from '../management-plans/management-plan-lng-detail/management-plan-lng-detail.component';

// other
import { RecordComponent } from './record-component';

export class RecordUtils {
  /**
   * Given a single record object, find the matching model based on the records _schemaName, and return a new instance.
   * Returns null if no matching model found.
   *
   * @static
   * @param {*} data
   * @returns {object} new instance of record model, or null.
   * @memberof RecordUtils
   */
  static getRecordModelInstance(data: any): object {
    if (!data || !data._schemaName) {
      return null;
    }

    switch (data._schemaName) {
      case 'Order':
        return new Order(data);
      case 'OrderLNG':
        return new OrderLNG(data);
      case 'OrderNRCED':
        return new OrderNRCED(data);
      case 'Inspection':
        return new Inspection(data);
      case 'InspectionLNG':
        return new InspectionLNG(data);
      case 'InspectionNRCED':
        return new InspectionNRCED(data);
      case 'Certificate':
        return new Certificate(data);
      case 'CertificateLNG':
        return new CertificateLNG(data);
      case 'Permit':
        return new Permit(data);
      case 'PermitLNG':
        return new PermitLNG(data);
      case 'Agreement':
        return new Agreement(data);
      case 'AgreementLNG':
        return new AgreementLNG(data);
      case 'SelfReport':
        return new SelfReport(data);
      case 'SelfReportLNG':
        return new SelfReportLNG(data);
      case 'RestorativeJustice':
        return new RestorativeJustice(data);
      case 'RestorativeJusticeLNG':
        return new RestorativeJusticeLNG(data);
      case 'RestorativeJusticeNRCED':
        return new RestorativeJusticeNRCED(data);
      case 'Ticket':
        return new Ticket(data);
      case 'TicketLNG':
        return new TicketLNG(data);
      case 'TicketNRCED':
        return new TicketNRCED(data);
      case 'AdministrativePenalty':
        return new AdministrativePenalty(data);
      case 'AdministrativePenaltyLNG':
        return new AdministrativePenaltyLNG(data);
      case 'AdministrativePenaltyNRCED':
        return new AdministrativePenaltyNRCED(data);
      case 'AdministrativeSanction':
        return new AdministrativeSanction(data);
      case 'AdministrativeSanctionLNG':
        return new AdministrativeSanctionLNG(data);
      case 'AdministrativeSanctionNRCED':
        return new AdministrativeSanctionNRCED(data);
      case 'Warning':
        return new Warning(data);
      case 'WarningLNG':
        return new WarningLNG(data);
      case 'WarningNRCED':
        return new WarningNRCED(data);
      case 'ConstructionPlan':
        return new ConstructionPlan(data);
      case 'ConstructionPlanLNG':
        return new ConstructionPlanLNG(data);
      case 'ManagementPlan':
        return new ManagementPlan(data);
      case 'ManagementPlanLNG':
        return new ManagementPlanLNG(data);
      default:
        return null;
    }
  }

  /**
   * Given a record type, return the matching detail component type, or null if no matching component found.
   * Returns null if no matching detail component found.
   *
   * @static
   * @param {string} recordType
   * @returns {Type<RecordComponent>} the record detail component, or null.
   * @memberof RecordUtils
   */
  static getRecordDetailComponent(recordType: string): Type<RecordComponent> {
    if (!recordType) {
      return null;
    }

    switch (recordType) {
      case 'OrderNRCED':
        return OrderNRCEDDetailComponent;
      case 'OrderLNG':
        return OrderLNGDetailComponent;
      case 'InspectionNRCED':
        return InspectionNRCEDDetailComponent;
      case 'InspectionLNG':
        return InspectionLNGDetailComponent;
      case 'CertificateLNG':
        return CertificateLNGDetailComponent;
      case 'PermitLNG':
        return PermitLNGDetailComponent;
      case 'AgreementLNG':
        return AgreementLNGDetailComponent;
      case 'SelfReportLNG':
        return SelfReportLNGDetailComponent;
      case 'RestorativeJusticeNRCED':
        return RestorativeJusticeNRCEDDetailComponent;
      case 'RestorativeJusticeLNG':
        return RestorativeJusticeLNGDetailComponent;
      case 'TicketLNG':
        return TicketLNGDetailComponent;
      case 'TicketNRCED':
        return TicketNRCEDDetailComponent;
      case 'AdministrativePenaltyLNG':
        return AdministrativePenaltyLNGDetailComponent;
      case 'AdministrativePenaltyNRCED':
        return AdministrativePenaltyNRCEDDetailComponent;
      case 'AdministrativeSanctionLNG':
        return AdministrativeSanctionLNGDetailComponent;
      case 'AdministrativeSanctionNRCED':
        return AdministrativeSanctionNRCEDDetailComponent;
      case 'WarningLNG':
        return WarningLNGDetailComponent;
      case 'WarningNRCED':
        return WarningNRCEDDetailComponent;
      case 'ConstructionPlanLNG':
        return ConstructionPlanLNGDetailComponent;
      case 'ManagementPlanLNG':
        return ManagementPlanLNGDetailComponent;
      default:
        return null;
    }
  }
}
