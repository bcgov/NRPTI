import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { RestorativeJustice } from '../../../../../../common/src/app/models/master/restorative-justice';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';

@Component({
  selector: 'app-restorative-justice-detail',
  templateUrl: './restorative-justice-detail.component.html',
  styleUrls: ['./restorative-justice-detail.component.scss']
})
export class RestorativeJusticeDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(public route: ActivatedRoute, public router: Router, public changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load RestorativeJustice");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      this.data = {
        _master: new RestorativeJustice(record),
        flavourData:
          (record.flavours &&
            record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
          []
      };

      this.changeDetectionRef.detectChanges();
    });
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'restorative-justices', this.data._master._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
