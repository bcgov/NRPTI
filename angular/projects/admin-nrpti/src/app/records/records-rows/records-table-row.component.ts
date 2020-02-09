import { Component, HostListener } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Router } from '@angular/router';

@Component({
  selector: 'tr[app-records-table-row]',
  templateUrl: './records-table-row.component.html',
  styleUrls: ['./records-table-row.component.scss']
})
export class RecordsTableRowComponent extends TableRowComponent {
  public dropdownItems = ['Edit', 'Delete'];

  constructor(private router: Router) {
    super();
  }

  @HostListener('click') onItemClicked() {
    switch (this.rowData._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', this.rowData._id, 'detail']);
        break;
      case 'Inspection':
        this.router.navigate(['records', 'inspections', this.rowData._id, 'detail']);
        break;
      case 'Certificate':
        this.router.navigate(['records', 'certificates', this.rowData._id, 'detail']);
        break;
      case 'Permit':
        this.router.navigate(['records', 'permits', this.rowData._id, 'detail']);
        break;
      case 'Agreement':
        this.router.navigate(['records', 'agreements', this.rowData._id, 'detail']);
        break;
      case 'SelfReport':
        this.router.navigate(['records', 'self-reports', this.rowData._id, 'detail']);
      case 'RestorativeJustice':
        this.router.navigate(['records', 'restorative-justices', this.rowData._id, 'detail']);
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
        this.router.navigate(['records', 'inspections', this.rowData._id, 'edit']);
        break;
      case 'Certificate':
        this.router.navigate(['records', 'certificates', this.rowData._id, 'edit']);
        break;
      case 'Permit':
        this.router.navigate(['records', 'permits', this.rowData._id, 'edit']);
        break;
      case 'Agreement':
        this.router.navigate(['records', 'agreements', this.rowData._id, 'edit']);
        break;
      case 'SelfReport':
        this.router.navigate(['records', 'self-reports', this.rowData._id, 'edit']);
        break;
      case 'RestorativeJustice':
        this.router.navigate(['records', 'restorative-justices', this.rowData._id, 'edit']);
        break;
      default:
        break;
    }
  }
}
