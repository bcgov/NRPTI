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
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public currentProjectId = '';
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
    // urlArray[0] will be empty so we use shift to get rid of it.
    urlArray.shift();
    this.currentMenu = urlArray[0];
  }

  toggleDropdown() {
    this.showProjectDetailsSubItems = !this.showProjectDetailsSubItems;
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
