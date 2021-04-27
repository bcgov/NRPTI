import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FactoryService } from '../../services/factory.service';
import { TableRowComponent } from 'nrpti-angular-components';
import { Router, ActivatedRoute } from '@angular/router';
import { Entity } from '../../../../../common/src/app/models/master/common-models/entity';

@Component({
  selector: 'tr[app-mines-records-table-row]',
  templateUrl: './mines-records-table-row.component.html',
  styleUrls: ['./mines-records-table-row.component.scss']
})
export class MinesRecordsTableRowComponent extends TableRowComponent implements OnInit {
  public entityString = '';
  public disableEdit = false;

  @ViewChild('rowCheckBox') rowCheckBox: ElementRef;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService
  ) {
    super();
  }

  ngOnInit() {
    this.populateTextFields();
    this.isDisableEdit();
    this.changeDetectionRef.detectChanges();
  }

  public isPublished() {
    return this.rowData.read.includes('public');
  }
  public getAttributeValue(attribute) {
    return this.rowData[attribute] || '-';
  }

  private isDisableEdit() {
    if (this.rowData && this.rowData.sourceSystemRef === 'core') {
      this.disableEdit = true;
    }
  }
  /**
   * Listen for clicks on the row.
   *
   * Note: Other click handlers will need to call `$event.stopPropagation()` to prevent their click events from
   * bubbling up to this listener.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  @HostListener('click') onItemClicked() {
    this.goToDetails();
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  populateTextFields() {
    if (this.rowData && this.rowData.issuedTo) {
      this.entityString = new Entity(this.rowData.issuedTo).getEntityNameString();
    }
  }

  public updateCheckbox(rowData) {
    rowData.rowSelected = !rowData.rowSelected;
    this.rowSelectionChange();
  }

  public rowSelectionChange() {
    if (this.rowData.rowSelected) {
      this.messageOut.emit({ label: 'rowSelected', data: this.rowData });
    } else {
      this.messageOut.emit({ label: 'rowUnselected', data: this.rowData });
    }
  }

  /**
   * Navigate to record details page.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  goToDetails() {
    this.router.navigate([this.rowData._id, 'detail'], {relativeTo: this.route});
  }

  /**
   * Navigate to record edit page.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  goToEdit() {
    this.router.navigate([this.rowData._id, 'edit'], {relativeTo: this.route});
  }
}
