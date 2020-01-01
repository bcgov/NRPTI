import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

import { TableObject } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

@Component({
  selector: 'tbody[app-authorizations-table-rows]',
  templateUrl: './authorizations-table-rows.component.html',
  styleUrls: ['./authorizations-table-rows.component.scss']
})
export class AuthorizationsTableRowsComponent implements OnInit, OnDestroy {
  @Input() data: TableObject;
  @Output() itemClicked: EventEmitter<any> = new EventEmitter();
  @Output() itemSelected: EventEmitter<any> = new EventEmitter();

  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  async ngOnInit() {
  }

  onItemClicked(item) {
    console.log('itemClicked:', item);
    this.itemClicked.emit(item);
  }

  onItemSelected(item) {
    console.log('itemSelected:', item);
    this.itemSelected.emit(item);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
