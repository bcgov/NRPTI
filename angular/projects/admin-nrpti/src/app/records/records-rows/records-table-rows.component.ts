import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

import { TableObject } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

@Component({
  selector: 'tbody[app-records-table-rows]',
  templateUrl: './records-table-rows.component.html',
  styleUrls: ['./records-table-rows.component.scss']
})
export class RecordsTableRowsComponent implements OnInit, OnDestroy {
  @Input() data: TableObject;
  @Output() itemClicked: EventEmitter<any> = new EventEmitter();
  @Output() itemSelected: EventEmitter<any> = new EventEmitter();

  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  async ngOnInit() {}

  goToItem(activity) {
    console.log('activity:', activity);
    // this.router.navigate(['/project-pins', activity._id, 'edit']);
  }

  onItemClicked(item) {
    console.log('itemClicked:', item);
    this.itemClicked.emit(item);
  }

  onItemSelected(item) {
    console.log('itemSelected?:', item);
    this.itemSelected.emit(item);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
