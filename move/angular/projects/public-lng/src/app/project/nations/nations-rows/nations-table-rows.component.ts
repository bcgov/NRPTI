import { Component, OnInit, OnDestroy } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

@Component({
  standalone: false,
  selector: 'tr[app-nations-table-rows]',
  templateUrl: './nations-table-rows.component.html',
  styleUrls: ['./nations-table-rows.component.scss']
})
export class NationsTableRowsComponent extends TableRowComponent implements OnInit, OnDestroy {
  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor() {
    super();
  }

  async ngOnInit() {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
