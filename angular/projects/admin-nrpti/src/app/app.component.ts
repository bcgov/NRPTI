import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';
import { IBreadcrumb, StoreService } from 'nrpti-angular-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    // Subscribe to the NavigationEnd event
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(event => {
        // Set breadcrumbs
        const root: ActivatedRoute = this.activatedRoute.root;
        this.breadcrumbs = this.storeService.getBreadcrumbs(root);
        this.activeBreadcrumb = this.breadcrumbs.pop();
        this.changeDetectionRef.detectChanges();
      });
  }
}
