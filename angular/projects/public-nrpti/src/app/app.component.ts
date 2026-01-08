import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IBreadcrumb, LoadingScreenService, StoreService } from 'nrpti-angular-components';
import { FactoryService } from './services/factory.service';

@Component({
  standalone: false,
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
    private factoryService: FactoryService,
    private storeService: StoreService,
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
      this.updateMines();
    });
  }

  private updateMines() {
    this.factoryService.getMines().subscribe((mineResults: any[]) => {
      this.setStoreServiceItem('mines', mineResults[0].data.searchResults);
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
}
