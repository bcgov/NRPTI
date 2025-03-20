import { Component, OnInit } from '@angular/core';
import { PageTypes } from '../../utils/page-types.enum';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  public pageType: PageTypes = PageTypes.PLANS;

  public id: string;
  public text: string[];

  public showpanel = true;
  public filters = [
    {
      displayName: 'Government Agency',
      textFilters: [
        {
          displayName: 'EAO',
          altDisplayName: 'Environmental Assessment Office',
          fieldName: 'issuingAgency'
        },
        {
          displayName: 'BC Energy Regulator',
          fieldName: 'issuingAgency'
        }
      ]
    },
    {
      displayName: 'Document Type',
      textFilters: [
        {
          displayName: 'Management Plan',
          fieldName: 'recordType'
        },
        {
          displayName: 'Construction Plan',
          fieldName: 'recordType'
        }
      ]
    }
  ];

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.text = this.dataService.getText(this.id, this.pageType);
    });
  }

  ngOnInit() {}

  togglePanel() {
    this.showpanel = !this.showpanel;
  }

  filterChange(event) {
    // Generate new route keeping old params
    // tslint:disable-next-line: prefer-const
    const newParams = {};

    // save default set of params, tack on new ones.
    this.route.params.subscribe(params => {
      // Filter out the incoming params (remove them entirely)
      Object.keys(params).forEach(p => {
        if (Object.keys(event).includes(p)) {
          // We will be overriding this param later.
        } else {
          // Existing param we should save.
          newParams[p] = params[p];
        }
      });

      Object.keys(event).forEach(item => {
        if (!event || event[item] === undefined || event[item] === null || event[item].length === 0) {
          // console.log('skipping:', e);
        } else {
          newParams[item] = event[item];
        }
      });

      this.router.navigate(['/project', this.id, this.pageType, newParams]);
    });
  }
}
