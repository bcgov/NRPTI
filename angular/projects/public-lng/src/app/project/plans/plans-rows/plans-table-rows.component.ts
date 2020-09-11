import { Component, OnInit, OnDestroy } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

import { Utils as GlobalUtils } from 'nrpti-angular-components';

@Component({
  selector: 'tr[app-plans-table-rows]',
  templateUrl: './plans-table-rows.component.html',
  styleUrls: ['./plans-table-rows.component.scss']
})
export class PlansTableRowsComponent extends TableRowComponent implements OnInit, OnDestroy {
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
