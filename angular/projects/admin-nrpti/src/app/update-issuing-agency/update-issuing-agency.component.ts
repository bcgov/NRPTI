import { Component, OnInit } from '@angular/core';
//import utils from 'esri/widgets/smartMapping/support/utils';
import { ApplicationAgencyList } from '../../../../global/src/lib/utils/utils';
@Component({
  selector: 'app-update-issuing-agency',
  templateUrl: './update-issuing-agency.component.html',
  styleUrls: ['./update-issuing-agency.component.scss']
})
export class UpdateIssuingAgencyComponent implements OnInit {
  public loading = false;
  selectedAgency = 'Select an Agency'; // Set the initial selected value
  choiceMade = false;
  newAgency = ''; // Initialize the new agency input field

  agencies: {} = ApplicationAgencyList;

  onSelected(value: string): void {
    this.selectedAgency = value;
    this.choiceMade = true;
  }

  updateSelectedAgency(): void {
    if (this.newAgency.trim() !== '') {
      // Only update the selected agency if the new agency input is not empty
      this.agencies[this.selectedAgency] = this.newAgency;
      this.selectedAgency = this.newAgency; // Update the selected value
      this.newAgency = ''; // Clear the input field
      this.choiceMade = true;
    }
  }

  ngOnInit(): void {
    console.log('UpdateIssuingAgencyComponent.ngOnInit()');
  }
}
