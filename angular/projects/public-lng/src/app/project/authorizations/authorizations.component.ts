import { Component, OnInit } from '@angular/core';
import { PageTypes } from '../../utils/page-types.enum';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.component.html',
  styleUrls: ['./authorizations.component.scss']
})
export class AuthorizationsComponent implements OnInit {
  public pageType: PageTypes = PageTypes.AUTHORIZATIONS;

  public id: string;
  public text: string[];

  public showpanel = true;
  public filters = [{
    'displayName': 'Government Agency',
    'textFilters': [
      {
        'displayName': 'Environmental Assessment Office',
        'fieldName': '_master.issuingAgency'
      },
      {
        'displayName': 'BC Oil and Gas Commission',
        'fieldName': '_master.issuingAgency'
      }
    ]
  }];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
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
    let newParams = {};

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
        if (!event || (event[item] === undefined || event[item] === null)
                   || (event[item].length === 0)
        ) {
          // console.log('skipping:', e);
        } else {
          newParams[item] = event[item];
        }
      });

      this.router.navigate([
        '/project',
        this.id,
        this.pageType,
        newParams
      ]);
    });
  }
}
