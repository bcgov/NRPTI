import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'tr[app-records-table-row]',
  templateUrl: './records-table-row.component.html',
  styleUrls: ['./records-table-row.component.scss']
})
export class RecordsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy {
  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router) {
    super();
  }

  ngOnInit() {}

  @HostListener('click') onItemClicked() {
    switch (this.rowData._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', this.rowData._id, 'detail']);
        break;
      case 'Inspection':
        // TODO
        break;
      default:
      // TODO
    }
  }

  edit() {
    switch (this.rowData._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', this.rowData._id, 'edit']);
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
}
