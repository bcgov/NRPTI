import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import moment from 'moment';

import { TableRowComponent } from 'nrpti-angular-components';

@Component({
  selector: 'tr[app-mines-collection-record-table-row]',
  templateUrl: './mines-collection-detail-record-row.component.html',
  styleUrls: ['./mines-collection-detail-record-row.component.scss']
})
export class MinesCollectionRecordTableRowComponent extends TableRowComponent implements OnInit {

  constructor(public changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
  }

  @HostListener('click') onItemClicked() {
    // TODO: Not sure how the link information for the record is going to be returned yet. Redirect here once known.
  }

  formatDate(date: Date): string {
    return moment(date).format('MMMM DD, YYYY');
  }
}
