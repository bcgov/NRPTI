import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FactoryService } from '../../services/factory.service';
import { LoadingScreenService } from 'nrpti-angular-components';
import moment from 'moment';
import { MiscUtils } from '../../utils/constants/misc';

@Component({
  selector: 'app-mines-detail',
  templateUrl: './mines-detail.component.html',
  styleUrls: ['./mines-detail.component.scss']
})
export class MinesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public mine = null;
  public canPublish = false;
  public isPublished = false;
  public lastEditedSubText = null;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    public changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.mine) {
        alert("Uh-oh, couldn't load Mine");
        this.router.navigate(['mines']);
        return;
      }

      this.mine = res.mine[0] && res.mine[0].data && new Mine(res.mine[0].data);

      MiscUtils.updateBreadcrumbLabel(this.mine, this.route.root);

      this.isPublished = this.isRecordPublished();
      this.canPublish = this.checkCanPublish();

      this.populateTextFields();

      this.loadingScreenService.setLoadingState(false, 'main');

      this.changeDetectionRef.detectChanges();
    });
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesAddEditComponent
   */
  populateTextFields() {
    if (this.mine && this.mine.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${moment(this.mine.dateUpdated).format('MMMM DD, YYYY')}`;
    } else {
      this.lastEditedSubText = `Added on ${moment(this.mine.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  isRecordPublished(): boolean {
    return this.mine && this.mine.read && this.mine.read.includes('public');
  }

  checkCanPublish(): boolean {
    return (
      this.mine &&
      this.mine.name &&
      this.mine.description &&
      this.mine.summary &&
      this.mine.type &&
      this.mine.status &&
      this.mine.permitNumber &&
      this.mine.commodities &&
      this.mine.commodities.length > 0 &&
      this.mine.permittee &&
      this.mine.location &&
      this.mine.location.coordinates &&
      this.mine.location.coordinates.length > 0
    );
  }

  async publish() {
    try {
      const response = await this.factoryService.publishMine(this.mine._id);
      if (!response) {
        return;
      }

      if (response.code === 409) {
        // object was already published
        alert('Mine is already published.');
        return;
      }

      this.mine = new Mine(response);
      this.isPublished = this.isRecordPublished();

      this.changeDetectionRef.detectChanges();
    } catch (error) {
      alert(`Failed to publish mine. ${error.error}`);
    }
  }

  async unPublish() {
    try {
      const response = await this.factoryService.unPublishMine(this.mine._id);
      if (!response) {
        return;
      }

      if (response.code === 409) {
        // object was already unpublished
        alert('Mine is already unpublished.');
        return;
      }
      this.mine = new Mine(response);
      this.isPublished = this.isRecordPublished();

      this.changeDetectionRef.detectChanges();
    } catch (error) {
      alert(`Failed to unpublish mine. ${error.error}`);
    }
  }

  togglePublish(): void {
    this.canPublish = this.checkCanPublish();
    if (this.canPublish) {
      this.isPublished ? this.unPublish() : this.publish();
    }
  }

  navigateToEditPage() {
    this.router.navigate(['mines', this.mine._id, 'edit']);
  }

  ngOnDestroy() {
    this.loadingScreenService.setLoadingState(false, 'main');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
