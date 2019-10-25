import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { Application } from 'app/models/application';
import { UrlService } from 'app/services/url.service';

@Component({
  templateUrl: './marker-popup.component.html',
  styleUrls: ['./marker-popup.component.scss']
})
export class MarkerPopupComponent implements OnInit, OnDestroy {
  public id: string;
  public app: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(public urlService: UrlService) {}

  public ngOnInit() {}

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // show Details panel for this app
  public showDetails() {
    this.urlService.save('id', this.app._id);
    this.urlService.setFragment('details');
  }
}
