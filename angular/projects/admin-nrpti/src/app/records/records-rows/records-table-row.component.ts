import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';

import { TableRowComponent } from 'nrpti-angular-components';
import { Router } from '@angular/router';
import { Entity } from '../../../../../common/src/app/models/master/common-models/entity';

@Component({
  selector: 'tr[app-records-table-row]',
  templateUrl: './records-table-row.component.html',
  styleUrls: ['./records-table-row.component.scss']
})
export class RecordsTableRowComponent extends TableRowComponent implements OnInit {
  public dropdownItems = ['Edit', 'Delete'];

  public entityString = '';

  constructor(private router: Router, public changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.populateTextFields();

    this.changeDetectionRef.detectChanges();
  }

  populateTextFields() {
    if (this.rowData && this.rowData.issuedTo) {
      this.entityString = new Entity(this.rowData.issuedTo).getEntityNameString();
    }
  }

  @HostListener('click') onItemClicked() {
    switch (this.rowData._schemaName) {
      case 'Order':
        this.router.navigate(['records', 'orders', this.rowData._id, 'detail']);
        break;
      case 'Inspection':
        this.router.navigate(['records', 'inspections', this.rowData._id, 'detail']);
        break;
      case 'Certificate':
        this.router.navigate(['records', 'certificates', this.rowData._id, 'detail']);
        break;
      case 'Permit':
        this.router.navigate(['records', 'permits', this.rowData._id, 'detail']);
        break;
      case 'Agreement':
        this.router.navigate(['records', 'agreements', this.rowData._id, 'detail']);
        break;
      case 'SelfReport':
        this.router.navigate(['records', 'self-reports', this.rowData._id, 'detail']);
        break;
      case 'RestorativeJustice':
        this.router.navigate(['records', 'restorative-justices', this.rowData._id, 'detail']);
        break;
      case 'Ticket':
        this.router.navigate(['records', 'tickets', this.rowData._id, 'detail']);
        break;
      case 'AdministrativePenalty':
        this.router.navigate(['records', 'administrative-penalties', this.rowData._id, 'detail']);
        break;
      case 'AdministrativeSanction':
        this.router.navigate(['records', 'administrative-sanctions', this.rowData._id, 'detail']);
        break;
      case 'Warning':
        this.router.navigate(['records', 'warnings', this.rowData._id, 'detail']);
        break;
      case 'ConstructionPlan':
        this.router.navigate(['records', 'construction-plans', this.rowData._id, 'detail']);
        break;
      case 'ManagementPlan':
        this.router.navigate(['records', 'management-plans', this.rowData._id, 'detail']);
        break;
      case 'CourtConviction':
        this.router.navigate(['records', 'court-convictions', this.rowData._id, 'detail']);
        break;
      default:
      // TODO
    }
  }

  edit() {
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
