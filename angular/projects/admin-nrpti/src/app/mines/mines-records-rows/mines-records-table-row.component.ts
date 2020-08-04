import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
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

    this.changeDetectionRef.detectChanges();
  }

  public isPublished() {
    if (this.rowData && this.rowData.flavours && this.rowData.flavours.find(f => f._schemaName.endsWith('BCMI'))) {
      return this.rowData.flavours.find(f => f._schemaName.endsWith('BCMI')).read.includes('public');
    } else {
      return false;
    }
  }
  public getAttributeValue(attribute) {
    let attributeValue = '-';

    if (this.rowData && this.rowData.flavours && this.rowData.flavours.find(f => f._schemaName.endsWith('BCMI'))) {

      const flavour = this.rowData.flavours.find(f => f._schemaName.endsWith('BCMI'));
      attributeValue = flavour[attribute] || '-';

    } else {
      attributeValue = this.rowData[attribute] || '-';
    }

    return attributeValue;
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

  /**
   * Emit message when row checkbox is toggled.
   *
   * @param {*} event checkbox event
   * @param {*} rowData entire row data object
   * @memberof MinesRecordsTableRowComponent
   */
  onRowCheckboxUpdate(event, rowData) {
    if (event.checked) {
      this.messageOut.emit({ label: 'rowSelected', data: rowData });
    } else {
      this.messageOut.emit({ label: 'rowUnselected', data: rowData });
    }
  }

  /**
   * Navigate to record details page.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  goToDetails() {
    this.router.navigate([this.rowData._id, 'detail'], { relativeTo: this.route });
  }

  /**
   * Navigate to record edit page.
   *
   * @memberof MinesRecordsTableRowComponent
   */
  goToEdit() {
    this.router.navigate([this.rowData._id, 'edit'], { relativeTo: this.route });
  }
}
