import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { FactoryService } from '../../services/factory.service';
import { TableRowComponent } from 'nrpti-angular-components';
import { Router } from '@angular/router';
import { Entity } from '../../../../../common/src/app/models/master/common-models/entity';
import { Constants } from '../../utils/constants/misc';

@Component({
  selector: 'tr[app-records-table-row]',
  templateUrl: './records-table-row.component.html',
  styleUrls: ['./records-table-row.component.scss']
})
export class RecordsTableRowComponent extends TableRowComponent implements OnInit {
  public dropdownItems = ['Edit', 'Delete'];

  public entityString = '';

  public disableRow = false;
  public showEdit = true;

  constructor(private router: Router,
              public changeDetectionRef: ChangeDetectorRef,
              public factoryService: FactoryService) {
    super();
  }

  ngOnInit() {
    this.populateTextFields();
    this.disableEdit();
    this.changeDetectionRef.detectChanges();
  }

  populateTextFields() {
    if (this.rowData && this.rowData.issuedTo) {
      this.entityString = new Entity(this.rowData.issuedTo).getEntityNameString();
    }
  }

  private disableEdit() {
    if (this.factoryService.userOnlyWFRole() && !this.rowData.write.includes(Constants.ApplicationRoles.ADMIN_WF)) {
      this.showEdit = false;
    }
  }

  private getSchemaRoute(schemaName) {
    switch (schemaName) {
      case 'Order':
        return 'orders';
      case 'Inspection':
        return 'inspections';
      case 'Certificate':
        return 'certificates';
      case 'Permit':
        return 'permits';
      case 'Agreement':
        return 'agreements';
      case 'SelfReport':
        return 'self-reports';
      case 'RestorativeJustice':
        return 'restorative-justices';
      case 'Ticket':
        return 'tickets';
      case 'AdministrativePenalty':
        return 'administrative-penalties';
      case 'AdministrativeSanction':
        return 'administrative-sanctions';
      case 'Warning':
        return 'warnings';
      case 'ConstructionPlan':
        return 'construction-plans';
      case 'ManagementPlan':
        return 'management-plans';
      case 'CourtConviction':
        return 'court-convictions';
      case 'CertificateAmendment':
        return 'certificate-amendments';
      case 'Correspondence':
        return 'correspondences';
      case 'Report':
        return 'reports';
      case 'DamSafetyInspection':
        return 'dam-safety-inspections';
      case 'AnnualReport':
        return 'annual-reports';
      default:
        return 'no-route';
    }
  }

  @HostListener('click') onItemClicked() {
    this.routeToRecordsPage('detail');
  }

  edit() {
    this.routeToRecordsPage('edit');
  }

  private routeToRecordsPage(type) {
    this.router.navigate(['records', this.getSchemaRoute(this.rowData._schemaName), this.rowData._id, type]);
  }
}
