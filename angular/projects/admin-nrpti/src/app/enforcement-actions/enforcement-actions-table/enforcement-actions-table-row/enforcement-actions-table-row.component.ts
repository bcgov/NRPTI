import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { TableRowComponent } from 'nrpti-angular-components';
import { FactoryService } from '../../../services/factory.service';

@Component({
  selector: 'tr[app-enforcement-actions-table-row]',
  templateUrl: './enforcement-actions-table-row.component.html',
  styleUrls: ['./enforcement-actions-table-row.component.scss']
})
export class EnforcementActionsTableRowComponent extends TableRowComponent implements OnInit {
  public isPublished = false;
  public factoryService: FactoryService;

  constructor(
    public changeDetectionRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.isPublished = this.isRecordPublished();
    this.changeDetectionRef.detectChanges();
  }

  public getAttributeValue(attribute) {
    return this.rowData[attribute] || '-';
  }

  goToDetails() {
    // to be implemented
  }

  goToEdit() {
    // to be implemented
  }

  publish() {
    // to be implemented
  }

  unPublish() {
    // to be implemented
  }

  isRecordPublished(): boolean {
    return this.rowData && this.rowData.read && this.rowData.read.includes('public');
  }

  @HostListener('click') onItemClicked() {
    this.goToDetails();
  }
}
