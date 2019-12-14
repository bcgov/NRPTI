import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import { IBreadcrumb } from 'nrpti-angular-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;
  constructor(private router: Router) {
    this.breadcrumbs = [];
  }

  public navigateBreadcrumb(breadcrumbData) {
    if (breadcrumbData.params) {
      this.router.navigate([breadcrumbData.url, breadcrumbData.params]);
    } else {
      this.router.navigate([breadcrumbData.url]);
    }
  }
}
