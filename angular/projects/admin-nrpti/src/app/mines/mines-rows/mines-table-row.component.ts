import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TableRowComponent } from 'nrpti-angular-components';
import { Entity } from '../../../../../common/src/app/models/master/common-models/entity';

@Component({
  selector: 'tr[app-mines-table-row]',
  templateUrl: './mines-table-row.component.html',
  styleUrls: ['./mines-table-row.component.scss']
})
export class MinesTableRowComponent extends TableRowComponent implements OnInit {
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
      case 'Mine':
        this.router.navigate(['mines', 'mines', this.rowData._id, 'detail']);
        break;
      default:
        break;
    }
  }

  edit(event: Event) {
    event.stopPropagation();

    switch (this.rowData._schemaName) {
      case 'Mine':
        this.router.navigate(['mines', 'mines', this.rowData._id, 'edit']);
        break;
      default:
        break;
    }
  }
}
