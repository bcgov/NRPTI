import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { LoadingScreenService } from 'nrpti-angular-components';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isNavMenuOpen = false;
  public routerSnapshot = null;
  public showNotificationProjects = false;
  public showMineDetails = false;
  public showProjectDetailsSubItems = false;
  public currentMineId = '';
  public mainRoute = '';
  public mainRouteId = '';
  public currentMenu = '';

  constructor(
    private router: Router,
    private loadingScreenService: LoadingScreenService
  ) {
    this.router.events
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(event => {
        this.routerSnapshot = event;
        this.SetActiveSidebarItem();
      });
  }

  SetActiveSidebarItem() {
    const urlArray = this.routerSnapshot.url.split('/');

    // The first element will be empty, so shift in order to remove it.
    urlArray.shift();
    const [mainRoute, mainRouteId, currentMenu] = urlArray;

    this.mainRoute = mainRoute;
    this.mainRouteId = mainRouteId;
    this.currentMenu = currentMenu && currentMenu.split(';')[0];

    if (mainRoute === 'mines') {
      if (mainRouteId) {
        this.showMineDetails = true;
      } else {
        this.showMineDetails = false;
      }
    } else {
      this.showMineDetails = false;
    }

    if ( mainRoute === 'mines' ) {
      if (mainRouteId) {
        this.currentMineId = mainRouteId;
        try {
          this.currentMenu = currentMenu;
          this.currentMenu = currentMenu.split(';')[0];
        } catch (e) {
          // When coming from search, it's blank.
        }
        this.showMineDetails = true;
      }
    } else {
      this.currentMineId = mainRoute;
      this.showMineDetails = false;
    }
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }

  activateLoading(path) {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.router.navigate(path);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
