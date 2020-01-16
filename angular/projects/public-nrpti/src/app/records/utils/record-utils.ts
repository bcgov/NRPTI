import { OrderDetailComponent } from '../orders/order-detail/order-detail.component';
import { Type } from '@angular/core';
import { InspectionDetailComponent } from '../inspections/inspection-detail/inspection-detail.component';

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
      default:
        return null;
    }
  }
}
