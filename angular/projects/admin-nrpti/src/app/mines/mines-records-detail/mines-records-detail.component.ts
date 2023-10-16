import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { CollectionBCMI } from '../../../../../common/src/app/models/bcmi';
import { AgencyDataService } from '../../../../../global/src/lib/utils/agency-data-service';
import { FactoryService } from '../../services/factory.service';
@Component({
  selector: 'app-mines-records-detail',
  templateUrl: './mines-records-detail.component.html',
  styleUrls: ['./mines-records-detail.component.scss']
})
export class MinesRecordDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public record: any;
  public collections: [CollectionBCMI];
  public lastEditedSubText = null;
  public disableEdit = false;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService
  ) { }

  isDisableEdit() {
    if (this.record && this.record.sourceSystemRef === 'core') {
      this.disableEdit = true;
    }
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.record) {
        alert("Uh-oh, couldn't load record");
        this.router.navigate(['/']);
        return;
      }

      this.record = res.record[0] &&
        res.record[0].data &&
        res.record[0].data.searchResults &&
        res.record[0].data.searchResults[0];

      this.collections = res.collections[0] &&
        res.collections[0].data &&
        res.collections[0].data.searchResults;

      this.populateTextFields();
      this.isDisableEdit();

      this.changeDetectionRef.detectChanges();
    });
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesAddEditComponent
   */
  populateTextFields() {
    if (this.record && this.record.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${moment(this.record.dateUpdated).format('MMMM DD, YYYY')}`;
    } else {
      this.lastEditedSubText = `Published on ${moment(this.record.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  navigateToEditPage() {
    this.router.navigate(['../edit'], {relativeTo: this.route});
  }

  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
