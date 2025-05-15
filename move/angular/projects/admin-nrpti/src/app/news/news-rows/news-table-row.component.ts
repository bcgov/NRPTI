import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'tr[app-news-table-row]',
  templateUrl: './news-table-row.component.html',
  styleUrls: ['./news-table-row.component.scss']
})
export class NewsTableRowComponent extends TableRowComponent implements OnInit {
  public dropdownItems = ['Edit', 'Delete'];

  constructor(
    private router: Router,
    public changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {}

  @HostListener('click') onItemClicked() {
    const type = this.rowData._schemaName.split('Activity')[1].toLowerCase();
    this.router.navigate(['news', type, this.rowData._id, 'detail']);
  }
}
