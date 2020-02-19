import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IBreadcrumb, StoreService } from 'nrpti-angular-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public currentWindowWidth = window.innerWidth;
  public showSideContent = this.currentWindowWidth > 768 ? true : false;
  public userClosedSideContent = false;

  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;

  constructor(
    private router: Router,
    private storeService: StoreService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    this.storeService.stateChange.subscribe((state: object) => {
      if (state && state.hasOwnProperty('userClosedSideContent')) {
        this.userClosedSideContent = state['userClosedSideContent'];
      }

      if (state && state.hasOwnProperty('showSideContent')) {
        this.showSideContent = state['showSideContent'];
      }

      this._changeDetectionRef.detectChanges();
    });
  }

  public navigateBreadcrumb(breadcrumbData) {
    this.router.navigate([breadcrumbData.url]);
  }

  @HostListener('window:resize', []) onResize() {
    this.screenSizeChanged();
  }

  public screenSizeChanged() {
    const newWindowWidth = window.innerWidth;

    // only trigger auto open/close behaviour if the user hasn't manually closed the side content
    if (!this.userClosedSideContent) {
      if (this.currentWindowWidth > 768 && newWindowWidth <= 768) {
        // window size changed from large to small: hide the side content
        this.showSideContent = false;
        this.storeService.setItem({ showSideContent: false });
      } else if (this.currentWindowWidth <= 768 && newWindowWidth > 768) {
        // window size changes from small to large: show the side content
        this.showSideContent = true;
        this.storeService.setItem({ showSideContent: true });
      }

      this._changeDetectionRef.detectChanges();
    }

    this.currentWindowWidth = window.innerWidth;
  }
}
