import { Component, OnInit, OnDestroy } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

import { Utils as GlobalUtils } from 'nrpti-angular-components';

@Component({
  standalone: false,
  selector: 'tr[app-compliance-table-rows]',
  templateUrl: './compliance-table-rows.component.html',
  styleUrls: ['./compliance-table-rows.component.scss']
})
export class ComplianceTableRowsComponent extends TableRowComponent implements OnInit, OnDestroy {
  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor() {
    super();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  displayName(agency) {
    return GlobalUtils.displayNameFull(agency);
  }

  convertAcronyms(acronym) {
    return GlobalUtils.convertAcronyms(acronym);
  }
}
