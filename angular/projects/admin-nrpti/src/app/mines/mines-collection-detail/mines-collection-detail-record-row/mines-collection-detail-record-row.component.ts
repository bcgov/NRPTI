import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';

import { TableRowComponent } from 'nrpti-angular-components';

@Component({
  selector: 'tr[app-mines-collection-record-table-row]',
  templateUrl: './mines-collection-detail-record-row.component.html',
  styleUrls: ['./mines-collection-detail-record-row.component.scss']
})
export class MinesCollectionRecordTableRowComponent extends TableRowComponent implements OnInit {

  constructor(
    public changeDetectionRef: ChangeDetectorRef,
    public route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
  }

  @HostListener('click') onItemClicked() {
    const url = this.router.url.substr(0, this.router.url.lastIndexOf("/collections"));
    window.open(`${url}/records/${this.rowData._id}/detail`, '_blank');
  }

  formatDate(date: Date): string {
    return moment(date).format('MMMM DD, YYYY');
  }
}
