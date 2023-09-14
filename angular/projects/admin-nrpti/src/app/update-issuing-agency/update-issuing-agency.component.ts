import { Component, OnInit } from '@angular/core';
import { IssuingAgencyService } from '../services/issuingagency.service';
import { LoggerService } from 'nrpti-angular-components';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-update-issuing-agency',
  templateUrl: './update-issuing-agency.component.html',
  styleUrls: ['./update-issuing-agency.component.scss']
})
export class UpdateIssuingAgencyComponent implements OnInit {
  public loading = false;
  selectedAgency: string = ''; // Initialize the selectedAgency
  choiceMade = false;
  newAgency: string = ''; // Initialize the new agency input field
  agencies: { [key: string]: string } = {"Kyle": "Williams"};
  agencyList = []

  constructor(
    private issuingAgencyService: IssuingAgencyService,
    private logger: LoggerService
  ) {}

  onSelected(value: string): void {
    this.selectedAgency = value;
    this.choiceMade = true;
  }

  updateSelectedAgency(): void {
    if (this.newAgency.trim() !== '') {

        this.agencies[this.selectedAgency] = this.newAgency;
        this.selectedAgency = this.newAgency; // Update the selected value
        this.newAgency = ''; // Clear the input field
        this.choiceMade = true;
      };
      alert(this.agencies)
    }


  ngOnInit(): void {
    this.issuingAgencyService.getIssuingAgencies()
      .then(response => {
        const agencies = {};
        if (response && Array.isArray(response)) {
          response.forEach(agency => {
            agencies[agency._id] = agency.agencyName;
          });
        }
        this.agencies = agencies; // Assign the agencies object as an Observable
        console.log("IS IT IN THE CONSOLE?")
        alert(JSON.stringify(this.agencies))

        for (const key in agencies) {
          if (agencies.hasOwnProperty(key)) {
            this.agencyList.push(agencies[key]);
          }
        }
        alert(this.agencyList)

      })
      .catch(error => {
        console.error('API call error:', error);
      });
    this.logger.level = 0;
  }
}
