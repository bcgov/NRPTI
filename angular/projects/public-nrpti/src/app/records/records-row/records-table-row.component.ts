import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

import { FactoryService } from '../../services/factory.service';
import { RecordUtils } from '../../utils/record-utils';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tr[app-records-table-row]',
  templateUrl: './records-table-row.component.html',
  styleUrls: ['./records-table-row.component.scss']
})
export class RecordsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy {
  @ViewChild('toggleView', { read: ViewContainerRef }) toggleView: ViewContainerRef;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public dropdownItems = ['Edit', 'Delete'];

  public toggleComponent = false;
  public componentRef: ComponentRef<any>;

  constructor(public factoryService: FactoryService) {
    super();
  }

  ngOnInit() {
    this.messageIn.pipe(takeUntil(this.ngUnsubscribe)).subscribe(msg => {
      if (msg.label === 'rowClicked' && msg.data._id === this.rowData._id) {
        this.toggleOn();
      } else {
        this.toggleOff();
      }
    });
  }

  downloadDocument() {}

  rowClicked() {
    this.messageOut.emit({ label: 'rowClicked', data: this.rowData });
  }

  toggleOn() {
    if (!this.componentRef) {
      const componentType = RecordUtils.getRecordDetailComponent(this.rowData._schemaName);
      if (componentType) {
        this.componentRef = this.factoryService.injectComponentIntoView(this.toggleView, componentType);
        this.componentRef.instance.data = this.rowData;

        this.toggleComponent = true;
      }
    }
  }

  toggleOff() {
    this.toggleComponent = false;

    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
