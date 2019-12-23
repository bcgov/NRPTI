import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { TableObject } from 'nrpti-angular-components';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'tbody[app-records-table-rows]',
  templateUrl: './records-table-rows.component.html',
  styleUrls: ['./records-table-rows.component.scss']
})
export class RecordsTableRowsComponent implements OnInit, OnDestroy {
  @Input() data: TableObject;

  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router) {}

  async ngOnInit() {}

  goToItem(item) {
    switch (item._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', item._id, 'detail']);
        break;
      case 'Inspection':
        // TODO
        break;
      default:
      // TODO
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  edit(item) {
    switch (item._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', item._id, 'edit']);
        break;
      case 'Inspection':
        // TODO
        break;
      default:
      // TODO
    }
  }
}
