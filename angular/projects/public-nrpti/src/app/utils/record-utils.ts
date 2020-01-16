import { OrderDetailComponent } from '../records/orders/order-detail/order-detail.component';
import { Type } from '@angular/core';

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
      case 'Order':
        return OrderDetailComponent;
      case 'Inspection':
        return null;
      default:
        return null;
    }
  }
}
