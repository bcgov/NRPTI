import { Component, Input, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';

import { TableObject } from 'nrpti-angular-components';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'tbody[app-records-table-rows]',
  templateUrl: './records-table-rows.component.html',
  styleUrls: ['./records-table-rows.component.scss']
})
export class RecordsTableRowsComponent implements OnInit, OnDestroy {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router) {}

  async ngOnInit() {}

  goToItem(activity) {
    // console.log('activity:', activity);
    this.router.navigate(['/project-pins', activity._id, 'edit']);
  }

  selectItem(item) {
    console.log('selecting item:', item);
    // item.checkbox = !item.checkbox;

    // let count = 0;
    // this.contacts.map(row => {
    //   if (row.checkbox === true) {
    //     count++;
    //   }
    // });
    // this.selectedCount.emit(count);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
