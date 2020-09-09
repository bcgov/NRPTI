import { Component, OnInit, OnDestroy } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

import { Utils as GlobalUtils } from 'nrpti-angular-components';

@Component({
  selector: 'tr[app-authorizations-table-rows]',
  templateUrl: './authorizations-table-rows.component.html',
  styleUrls: ['./authorizations-table-rows.component.scss']
})
export class AuthorizationsTableRowsComponent extends TableRowComponent implements OnInit, OnDestroy {
  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor() {
    super();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  convertAcronyms(acronym) {
    return GlobalUtils.convertAcronyms(acronym);
  }
}
