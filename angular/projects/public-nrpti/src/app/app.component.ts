import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IBreadcrumb, LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;

  public mainLoading = false;
  public bodyLoading = false;

  constructor(
    private router: Router,
    private loadingScreenService: LoadingScreenService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    this.breadcrumbs = [];
  }

  public navigateBreadcrumb(breadcrumbData) {
    this.router.navigate([breadcrumbData.url]);
  }

  ngOnInit() {
    this.loadingScreenService.stateChange.subscribe(loadingObj => {
      switch (loadingObj.location) {
        case 'main':
          this.mainLoading = loadingObj.state;
          break;
        case 'body':
          this.bodyLoading = loadingObj.state;
          break;
        default:
          break;
      }
      this._changeDetectionRef.detectChanges();
    });
  }
}
