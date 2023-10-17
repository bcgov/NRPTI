import { Component, OnInit, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IBreadcrumb, StoreService, LoadingScreenService } from 'nrpti-angular-components';
import { FactoryService } from './services/factory.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { interval } from 'rxjs/internal/observable/interval';
import { takeWhile, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from './services/toast.service';
import { Constants } from './utils/constants/misc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private alive = true;
  public currentWindowWidth = window.innerWidth;
  public showSideContent = this.currentWindowWidth > 768 ? true : false;
  public userClosedSideContent = false;

  mineSubscription: Subscription;
  epicProjectSubscription: Subscription;
  toastSubscription: Subscription;

  public breadcrumbs: IBreadcrumb[];
  public activeBreadcrumb: IBreadcrumb;

  public mainLoading = false;
  public bodyLoading = false;

  constructor(
    private router: Router,
    private loadingScreenService: LoadingScreenService,
    private factoryService: FactoryService,
    private storeService: StoreService,
    private _changeDetectionRef: ChangeDetectorRef,
    private toastr: ToastrService,
    private toastService: ToastService
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    if (this.mineSubscription) {
      this.mineSubscription.unsubscribe();
    }

    if (this.epicProjectSubscription) {
      this.epicProjectSubscription.unsubscribe();
    }

    this.storeService.stateChange.subscribe((state: object) => {
      if (state && state.hasOwnProperty('userClosedSideContent')) {
        this.userClosedSideContent = state['userClosedSideContent'];
      }

      if (state && state.hasOwnProperty('showSideContent')) {
        this.showSideContent = state['showSideContent'];
      }

      this._changeDetectionRef.detectChanges();
    });
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

    // Subscribe to updates on specific models
    this.updateMines();
    this.updateEpicProjects();
    this.watchForToast();
  }

  private watchForToast() {
    // tslint:disable-next-statement
    const self = this;
    this.toastSubscription = this.toastService.messages.subscribe(messages => {
      messages.forEach(msg => {
        switch (msg.type) {
          case Constants.ToastTypes.SUCCESS:
            {
              this.toastr.success(msg.body, msg.title);
            }
            break;
          case Constants.ToastTypes.WARNING:
            {
              this.toastr.warning(msg.body, msg.title);
            }
            break;
          case Constants.ToastTypes.INFO:
            {
              this.toastr.info(msg.body, msg.title);
            }
            break;
          case Constants.ToastTypes.ERROR:
            {
              this.toastr.error(msg.body, msg.title);
            }
            break;
        }
        // Remove message from memory
        self.toastService.removeMessage(msg.guid);
      });
    });
  }

  private updateMines() {
    // Fetch initially
    const minesSub = this.factoryService.searchService
      .getSearchResults(this.factoryService.apiService.pathAPI, '', ['MineBCMI'], [], 1, 100000, '+name')
      .subscribe((mineResults: any[]) => {
        this.setStoreServiceItem('mines', mineResults[0].data.searchResults);
        minesSub.unsubscribe();
      });

    // Update every 4 hours
    this.mineSubscription = interval(1000 * 60 * 60 * 4)
      .pipe(
        takeWhile(() => this.alive),
        switchMap(() =>
          this.factoryService.searchService.getSearchResults(
            this.factoryService.apiService.pathAPI,
            '',
            ['MineBCMI'],
            [],
            1,
            100000,
            '+name'
          )
        )
      )
      .subscribe((mineResults: any[]) => {
        this.setStoreServiceItem('mines', mineResults[0].data.searchResults);
      });
  }

  private updateEpicProjects() {
    // Fetch initially
    const epicSub = this.factoryService.searchService
      .getSearchResults(this.factoryService.apiService.pathAPI, '', ['EPICProject'], [], 1, 100000, '+name')
      .subscribe((epicProjectResults: any[]) => {
        this.setStoreServiceItem('epicProjects', epicProjectResults[0].data.searchResults);
        epicSub.unsubscribe();
      });

    // Update every 4 hours
    this.epicProjectSubscription = interval(1000 * 60 * 60 * 4)
      .pipe(
        takeWhile(() => this.alive),
        switchMap(() =>
          this.factoryService.searchService.getSearchResults(
            this.factoryService.apiService.pathAPI,
            '',
            ['EPICProject'],
            [],
            1,
            100000,
            '+name'
          )
        )
      )
      .subscribe((epicProjectResults: any[]) => {
        this.setStoreServiceItem('epicProjects', epicProjectResults[0].data.searchResults);
      });
  }

  // Sets a store service list item, but unshifts a null-based element first.
  private setStoreServiceItem(key, list) {
    // First unshift an item into the list.
    list.unshift({ _id: null, name: 'None' });

    // Set the object in the store service
    const newObject = { [key]: list };
    this.storeService.setItem(newObject);
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

  ngOnDestroy() {
    this.alive = false;
    this.toastSubscription.unsubscribe();
  }
}
