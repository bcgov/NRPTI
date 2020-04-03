import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Subject } from 'rxjs';

import { FactoryService } from '../../services/factory.service';
import { RecordUtils } from '../utils/record-utils';
import { takeUntil } from 'rxjs/operators';
import { Entity } from '../../../../../common/src/app/models/master/common-models/entity';

@Component({
  selector: 'tr[app-records-table-row]',
  templateUrl: './records-table-row.component.html',
  styleUrls: ['./records-table-row.component.scss']
})
export class RecordsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy {
  @ViewChild('detailsComponentContainer', { read: ViewContainerRef }) toggleView: ViewContainerRef;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public dropdownItems = ['Edit', 'Delete'];

  public displayDetailsComponent = false;
  public componentRef: ComponentRef<any>;

  public entityString = 'Unpublished'; // if the issuedTo object is completely missing (redacted) show 'Unpublished'

  constructor(public factoryService: FactoryService) {
    super();
  }

  ngOnInit() {
    // listen for messages sent from parent
    this.messageIn.pipe(takeUntil(this.ngUnsubscribe)).subscribe(msg => {
      if (msg.label === 'rowClicked' && msg.data._id === this.rowData._id) {
        this.insertDetailsComponent();
      } else {
        this.removeDetailsComponent();
      }
    });

    this.populateTextFields();
  }

  populateTextFields() {
    if (this.rowData && this.rowData.issuedTo) {
      this.entityString = new Entity(this.rowData.issuedTo).getEntityNameString();
    }
  }

  downloadDocument() {}

  rowClicked() {
    this.messageOut.emit({ label: 'rowClicked', data: this.rowData });

    // we know this component details are going to be shown, don't wait for parents messageIn event to insert it.
    this.insertDetailsComponent();
  }

  /**
   * Resolves and injects the detail component for the record type.
   *
   * @memberof RecordsTableRowComponent
   */
  insertDetailsComponent() {
    if (!this.componentRef) {
      const componentType = RecordUtils.getRecordDetailComponent(this.rowData._schemaName);
      if (componentType) {
        this.componentRef = this.factoryService.injectComponentIntoView(this.toggleView, componentType);
        this.componentRef.instance.data = this.rowData;

        this.displayDetailsComponent = true;
      }
    }
  }

  /**
   * Removes and destroys the previously injected detail component.
   *
   * @memberof RecordsTableRowComponent
   */
  removeDetailsComponent() {
    this.displayDetailsComponent = false;

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
