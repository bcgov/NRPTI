import { Input } from '@angular/core';

/**
 * Record components.
 *
 * @export
 * @class TableRowComponent
 */
export class RecordComponent {
  /**
   * The specific data used by the component.
   *
   * @type {*}
   * @memberof RecordComponent
   */
  @Input() data: any;
}
