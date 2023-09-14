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
  agencies$: Observable<{ [key: string]: string }> = of({"Kyle": "Williams"}); // Initialize agencies as an Observable

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
      // Only update the selected agency if the new agency input is not empty
      this.agencies$.subscribe(agencies => {
        agencies[this.selectedAgency] = this.newAgency;
        this.selectedAgency = this.newAgency; // Update the selected value
        this.newAgency = ''; // Clear the input field
        this.choiceMade = true;
      });
    }
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
        this.agencies$ = of(agencies); // Assign the agencies object as an Observable
        console.log("IS IT IN THE CONSOLE?")
        alert(JSON.stringify(this.agencies$))
      })
      .catch(error => {
        console.error('API call error:', error);
      });
    this.logger.level = 0;
  }
}
