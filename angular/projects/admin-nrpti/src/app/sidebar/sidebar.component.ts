import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';
import { StoreService } from 'nrpti-angular-components';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isNavMenuOpen = false;
  public routerSnapshot = null;
  public showNotificationProjects = false;
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public currentProjectId = '';
  public currentMenu = '';

  @HostBinding('class.is-toggled')
  isOpen = false;

  constructor(
    private router: Router,
    private storeService: StoreService
  ) {

    this.router.events.pipe(
      takeUntil(this.ngUnsubscribe),
      filter(event => event instanceof NavigationEnd)
      )
      .subscribe(event => {
        this.routerSnapshot = event;
        this.SetActiveSidebarItem();
      });
  }

  ngOnInit() {
    this.storeService.change.pipe(
      takeUntil(this.ngUnsubscribe))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });
  }

  SetActiveSidebarItem() {
    let urlArray = this.routerSnapshot.url.split('/');
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
