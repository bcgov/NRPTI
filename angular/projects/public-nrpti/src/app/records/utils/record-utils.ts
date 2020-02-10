import { Type } from '@angular/core';
import { OrderDetailComponent } from '../orders/order-detail/order-detail.component';
import { InspectionDetailComponent } from '../inspections/inspection-detail/inspection-detail.component';
import { RestorativeJusticeDetailComponent } from '../restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { AdministrativePenaltyDetailComponent } from '../administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativeSanctionDetailComponent } from '../administrative-sanctions/administrative-sanction-detail/administrative-sanction-detail.component';
import { TicketDetailComponent } from '../tickets/ticket-detail/ticket-detail.component';

export class RecordUtils {
  /**
   * Given a record type, return the matching detail component type, or null if no matching component found.
   *
   * @static
   * @param {string} recordType
   * @returns {Type<TableRowComponent>}
   * @memberof RecordUtils
   */
  static getRecordDetailComponent(recordType: string): Type<any> {
    if (!recordType) {
      return null;
    }

    switch (recordType) {
      case 'OrderNRCED':
        return OrderDetailComponent;
      case 'InspectionNRCED':
        return InspectionDetailComponent;
      case 'RestorativeJusticeNRCED':
        return RestorativeJusticeDetailComponent;
      case 'AdministrativePenaltyNRCED':
        return AdministrativePenaltyDetailComponent;
      case 'AdministrativeSanctionNRCED':
        return AdministrativeSanctionDetailComponent;
      case 'TicketNRCED':
        return TicketDetailComponent;
      default:
        return null;
    }
  }
}
