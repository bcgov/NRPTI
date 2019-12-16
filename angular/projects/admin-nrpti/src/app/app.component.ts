import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import { IBreadcrumb, StoreService } from 'nrpti-angular-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @HostBinding('class.sidebarcontrol')
  isOpen = false;

  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;
  constructor(
    private router: Router,
    private storeService: StoreService
    ) {
    this.breadcrumbs = [];
  }

  public navigateBreadcrumb(breadcrumbData) {
    if (breadcrumbData.params) {
      this.router.navigate([breadcrumbData.url, breadcrumbData.params]);
    } else {
      this.router.navigate([breadcrumbData.url]);
    }
  }

  ngOnInit() {
    this.storeService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }
}
