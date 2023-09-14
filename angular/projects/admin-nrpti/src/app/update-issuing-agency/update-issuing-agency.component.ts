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
  agencyList: string[] = ["-Select-"]; // Use a string array for agencyList
  updatedData: any = {
    "agencies": []
  };
  constructor(
    private issuingAgencyService: IssuingAgencyService,
    private logger: LoggerService
  ) {}

  onSelected(value: string): void {
    this.selectedAgency = value;
    this.choiceMade = true;
  }
  putRecords(agencyCode: any, agencyName: any){
    this.issuingAgencyService.updateAgency(agencyCode, agencyName)
  }
  updateSelectedAgency(): void {
    if (this.newAgency.trim() !== '') {
      // Find the agency code that matches the selected agency name
      const matchingCode = Object.keys(this.agencies).find(
        key => this.agencies[key] === this.selectedAgency
      );
      if (matchingCode) {
        // Update the agencyList with the new value at the same index
        const index = this.agencyList.indexOf(this.selectedAgency);
        if (index !== -1) {
          this.agencyList[index] = this.newAgency;
        }
        // Update the selectedAgency with the new value
        this.selectedAgency = this.newAgency;
        // Clear the input field
        this.newAgency = '';
        this.choiceMade = true;
        // Update the updatedData object to match the desired layout
        this.updatedData.agencies.push({
          "agencyCode": matchingCode,
          "agencyName": this.selectedAgency
        });
        this.putRecords(matchingCode, this.selectedAgency);
        this.updatedData.agencies = []
      }
    }
  }

  ngOnInit(): void {
    this.issuingAgencyService.getIssuingAgencies()
      .then(response => {
        const agencies = {};
        if (response && Array.isArray(response)) {
          response.forEach(agency => {
            agencies[agency.agencyCode] = agency.agencyName;
          });
        }
        this.agencies = agencies; // Assign the agencies object as an Observable
        for (const key in agencies) {
          if (agencies.hasOwnProperty(key)) {
            this.agencyList.push(agencies[key]);
          }
        }
      })
      .catch(error => {
        console.error('API call error:', error);
      });
    this.logger.level = 0;
  }
}
