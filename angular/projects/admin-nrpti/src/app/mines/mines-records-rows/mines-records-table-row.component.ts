import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FactoryService } from '../../services/factory.service';
import { TableRowComponent } from 'nrpti-angular-components';
import { Router,ActivatedRoute } from '@angular/router';
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
    switch (this.rowData._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', this.rowData._id, 'edit']);
        break;
      case 'Inspection':
        this.router.navigate(['records', 'inspections', this.rowData._id, 'edit']);
        break;
      case 'Certificate':
        this.router.navigate(['records', 'certificates', this.rowData._id, 'edit']);
        break;
      case 'Permit':
        this.router.navigate(['records', 'permits', this.rowData._id, 'edit']);
        break;
      case 'Agreement':
        this.router.navigate(['records', 'agreements', this.rowData._id, 'edit']);
        break;
      case 'SelfReport':
        this.router.navigate(['records', 'self-reports', this.rowData._id, 'edit']);
        break;
      case 'RestorativeJustice':
        this.router.navigate(['records', 'restorative-justices', this.rowData._id, 'edit']);
        break;
      case 'Ticket':
        this.router.navigate(['records', 'tickets', this.rowData._id, 'edit']);
        break;
      case 'AdministrativePenalty':
        this.router.navigate(['records', 'administrative-penalties', this.rowData._id, 'edit']);
        break;
      case 'AdministrativeSanction':
        this.router.navigate(['records', 'administrative-sanctions', this.rowData._id, 'edit']);
        break;
      case 'Warning':
        this.router.navigate(['records', 'warnings', this.rowData._id, 'edit']);
        break;
      case 'ConstructionPlan':
        this.router.navigate(['records', 'construction-plans', this.rowData._id, 'edit']);
        break;
      case 'ManagementPlan':
        this.router.navigate(['records', 'management-plans', this.rowData._id, 'edit']);
        break;
      case 'CourtConviction':
        this.router.navigate(['records', 'court-convictions', this.rowData._id, 'edit']);
        break;
      default:
        break;
    }
  }
}
