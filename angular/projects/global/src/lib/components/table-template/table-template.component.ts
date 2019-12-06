import {
  Component,
  Input,
  OnInit,
  ComponentFactoryResolver,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges
} from '@angular/core';

import { TableDirective } from './table.directive';
import { TableObject } from './table-object';
import { ITableComponent } from './table.component';

@Component({
  selector: 'lib-table-template',
  templateUrl: './table-template.component.html',
  styleUrls: ['./table-template.component.scss']
})
export class TableTemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: TableObject;
  @ViewChild(TableDirective) tableHost: TableDirective;

  @Output() pageNumUpdate: EventEmitter<any> = new EventEmitter();
  @Output() itemClicked: EventEmitter<any> = new EventEmitter();
  @Output() itemSelected: EventEmitter<any> = new EventEmitter();
  @Output() columnSort: EventEmitter<any> = new EventEmitter();

  interval: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (!changes.firstChange && changes['data'].currentValue) {
      this.data.component = changes['data'].currentValue.component;
      this.data.items = changes['data'].currentValue.items;
      this.data.columns = changes['data'].currentValue.columns;
      this.data.dataset = changes['data'].currentValue.dataset;
      this.data.currentPage = changes['data'].currentValue.currentPage;
      this.data.filter = changes['data'].currentValue.filter;
      this.data.keywords = changes['data'].currentValue.keywords;
      this.data.pageSize = changes['data'].currentValue.pageSize;
      this.data.sortBy = changes['data'].currentValue.sortBy;
      this.data.totalListItems = changes['data'].currentValue.totalListItems;
      this.loadComponent();
    }
  }

  public sort(property: string) {
    this.columnSort.emit(property);
  }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data.component);

    const viewContainerRef = this.tableHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as ITableComponent).data = this.data;

    // Don't subscribe if it doesn't exist.
    if (componentRef.instance.itemSelected) {
      componentRef.instance.itemSelected.subscribe(msg => {
        this.itemSelected.emit(msg);
      });
    }

    if (componentRef.instance.itemClicked) {
      componentRef.instance.itemClicked.subscribe(msg => {
        this.itemClicked.emit(msg);
      });
    }
  }

  updatePageNumber(pageNum) {
    this.pageNumUpdate.emit(pageNum);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
