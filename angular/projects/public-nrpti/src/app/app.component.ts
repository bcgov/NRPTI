import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IBreadcrumb } from 'nrpti-angular-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;
  constructor(private router: Router) {
    this.breadcrumbs = [];
  }

  public navigateBreadcrumb(breadcrumbData) {
    this.router.navigate([breadcrumbData.url]);
  }

  ngOnInit() {}
}
