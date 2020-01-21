import { Type } from '@angular/core';
import {
  Order,
  OrderLNG,
  OrderNRCED,
  Inspection,
  InspectionLNG,
  InspectionNRCED
} from '../../../../../common/src/app/models';
import { OrderNRCEDDetailComponent } from '../orders/order-nrced-detail/order-nrced-detail.component';
import { OrderLNGDetailComponent } from '../orders/order-lng-detail/order-lng-detail.component';
import { InspectionNRCEDDetailComponent } from '../inspections/inspection-nrced-detail/inspection-nrced-detail.component';
import { InspectionLNGDetailComponent } from '../inspections/inspection-lng-detail/inspection-lng-detail.component';
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
      default:
        return null;
    }
  }
}
