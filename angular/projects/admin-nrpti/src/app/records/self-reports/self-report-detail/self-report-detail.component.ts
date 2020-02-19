import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { SelfReport } from '../../../../../../common/src/app/models/master/self-report';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';

@Component({
  selector: 'app-self-report-detail',
  templateUrl: './self-report-detail.component.html',
  styleUrls: ['./self-report-detail.component.scss']
})
export class SelfReportDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public legislationString = '';

  constructor(public route: ActivatedRoute, public router: Router, public changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load SelfReport");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      this.data = {
        _master: new SelfReport(record),
        flavourData:
          (record.flavours &&
            record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
          []
      };

      this.populateTextFields();

      this.changeDetectionRef.detectChanges();
    });
  }

  populateTextFields() {
    if (this.data && this.data._master && this.data._master.legislation) {
      this.legislationString = CommonUtils.buildLegislationString(this.data._master.legislation);
    }
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'self-reports', this.data._master._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
