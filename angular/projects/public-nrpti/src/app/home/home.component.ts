import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FactoryService } from '../services/factory.service';
import { AgencyDataService } from '../../../../global/src/lib/utils/agency-data-service-nrced';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  agencyDataService: AgencyDataService;
  constructor(public route: ActivatedRoute, private factoryService: FactoryService) {}

  async ngOnInit() {
    debugger;
    this.agencyDataService = new AgencyDataService(this.factoryService);
  }

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
}
