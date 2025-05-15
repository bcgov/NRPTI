import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { Application } from '../../../models/application';
import { UrlService } from '../../../services/url.service';

@Component({
  standalone: false,
  templateUrl: './marker-popup.component.html',
  styleUrls: ['./marker-popup.component.scss']
})
export class MarkerPopupComponent implements OnInit, OnDestroy {
  public id: string;
  public app: Application = null;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

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
