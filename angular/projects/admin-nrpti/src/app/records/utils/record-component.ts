import { Input } from '@angular/core';

import { FactoryService } from '../../services/factory.service';
import { Constants } from '../../utils/constants/misc';

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

export class RecordDetailComponent extends RecordComponent {
  public showEdit = true;

  constructor(public factoryService: FactoryService) {
    super();
  }

  protected disableEdit() {
    const record = this.data._master;

    // Disable edit button if user is in a limited role and record does not have the same write role
    for (const role of Constants.ApplicationLimitedRoles) {
      if (this.factoryService.userOnlyInLimitedRole(role) && !record.write.includes(role)) {
        this.showEdit = false;
      }
    }

    if (record.sourceSystemRef === 'core') {
      this.showEdit = false;
    }
  }
}
