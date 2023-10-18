import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AgencyDataService } from '../../../../../projects/global/src/lib/utils/agency-data-service-nrced';
import { FactoryService } from '../services/factory.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(public route: ActivatedRoute,
    public factoryService: FactoryService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.route.params.subscribe(params => {
      // scroll to the div specified in the 'div' param
      if (params && params.div) {
        this.scrollTo(params.div);
      }
    });
  }

  scrollTo(div) {
    const element = document.querySelector('#' + div);
    if (element) {
      element.scrollIntoView();
    }
  }
  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
  }
}
