import {
  Component,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  Injector,
  OnInit
} from '@angular/core';

import { TableObject } from './table-object';
import { ITableMessage } from './table-row-component';

@Component({
  standalone: false,
  selector: 'lib-table-template',
  templateUrl: './table-template.component.html',
  styleUrls: ['./table-template.component.scss'],
})
export class TableTemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: TableObject;

  @Input() messageIn: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();
  @Output() messageOut: EventEmitter<ITableMessage> = new EventEmitter<ITableMessage>();

  constructor(public injector: Injector) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (!changes.firstChange && changes['data'].currentValue) {
      this.data.options = changes['data'].currentValue.options;
      this.data.items = changes['data'].currentValue.items;
      this.data.columns = changes['data'].currentValue.columns;
      this.data.dataset = changes['data'].currentValue.dataset;
      this.data.currentPage = changes['data'].currentValue.currentPage;
      this.data.pageSizeOptions = changes['data'].currentValue.pageSizeOptions;
      this.data.pageSize = changes['data'].currentValue.pageSize;
      this.data.sortBy = changes['data'].currentValue.sortBy;
      this.data.totalListItems = changes['data'].currentValue.totalListItems;
    }
  }

  public onSort(property: string) {
    this.messageOut.emit({ label: 'columnSort', data: property });
  }

  onMessageOut(msg: ITableMessage) {
    this.messageOut.emit(msg);
  }

  onUpdatePageNumber(pageNum) {
    this.messageOut.emit({ label: 'pageNum', data: pageNum });
  }

  onUpdatePageSize(pageSize) {
    this.messageOut.emit({ label: 'pageSize', data: pageSize });
  }

  ngOnDestroy() {}
}
