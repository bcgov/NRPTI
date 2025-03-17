import { Component, OnInit, OnDestroy } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

import { Utils as GlobalUtils } from 'nrpti-angular-components';

@Component({
  standalone: false,
  selector: 'tr[app-authorizations-table-rows]',
  templateUrl: './authorizations-table-rows.component.html',
  styleUrls: ['./authorizations-table-rows.component.scss']
})
export class AuthorizationsTableRowsComponent extends TableRowComponent implements OnInit, OnDestroy {
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
    console.log(agency);
    return GlobalUtils.displayNameFull(agency);
  }

  convertAcronyms(acronym) {
    return GlobalUtils.convertAcronyms(acronym);
  }
}
