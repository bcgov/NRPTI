import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';

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
export class RecordsTableRowComponent extends TableRowComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('detailsComponentContainer', { read: ViewContainerRef }) toggleView: ViewContainerRef;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public dropdownItems = ['Edit', 'Delete'];

  public displayDetailsComponent = false;
  public componentRef: ComponentRef<any>;
  public dynamicDescriptionLabel = 'Description';

  public entityString = '';
  public description = '';

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

  setDynamicDescriptionText() {
    // change Description field text if different from defaults
    if (this.rowData) {
      // change field label
      if (this.rowData.recordType === 'Order') {
        this.dynamicDescriptionLabel = 'Order Type';
      } else if (
        this.rowData.recordType === 'Court Conviction' ||
        this.rowData.recordType === 'Restorative Justice' ||
        this.rowData.recordType === 'Ticket'
      ) {
        this.dynamicDescriptionLabel = 'Offence';
      } else {
        this.dynamicDescriptionLabel = this.tableData.columns[3].name;
      }

      // change field text
      if (
        this.rowData._schemaName === 'AdministrativePenaltyNRCED' ||
        this.rowData._schemaName === 'CourtConvictionNRCED' ||
        this.rowData._schemaName === 'RestorativeJusticeNRCED' ||
        this.rowData._schemaName === 'TicketNRCED'
      ) {
        if (this.rowData.legislation && this.rowData.legislation[0] && this.rowData.legislation[0].offence) {
          this.description = this.rowData.legislation[0].offence || '-';
        }
      } else {
        if (
          this.rowData.legislation &&
          this.rowData.legislation[0] &&
          this.rowData.legislation[0].legislationDescription
        ) {
          this.description = this.rowData.legislation[0].legislationDescription || '-';
        }
      }
    }
  }

  ngAfterViewInit() {
    if (this.rowData.autofocus) {
      this.insertDetailsComponent();
      // Small delay on the scroll to let DOM load
      setTimeout(() => {
        document.getElementById(this.rowData._id).scrollIntoView();
      }, 10);
    }
  }

  populateTextFields() {
    if (this.rowData && this.rowData.issuedTo) {
      this.entityString = new Entity(this.rowData.issuedTo).getEntityNameString();
    } else {
      this.entityString = 'Unpublished'; // if the issuedTo object is completely missing (redacted) show 'Unpublished'
    }
    this.setDynamicDescriptionText();
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
