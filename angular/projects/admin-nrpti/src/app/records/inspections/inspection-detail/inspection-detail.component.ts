import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Inspection } from '../../../../../../common/src/app/models/master/inspection';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';

@Component({
  selector: 'app-inspection-detail',
  templateUrl: './inspection-detail.component.html',
  styleUrls: ['./inspection-detail.component.scss']
})
export class InspectionDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(public route: ActivatedRoute, public router: Router, public changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load Inspection");
        this.router.navigate(['/']);
        return;
      }

      const records = res.records[0] && res.records[0].data && res.records[0].data.searchResults;

      this.data = {
        _master: records && records[0] && new Inspection(records[0]._master),
        flavourData: records.map(record => RecordUtils.getRecordModelInstance(record)) || []
      };

      this.changeDetectionRef.detectChanges();
    });
  }

  navigateToEditPage() {
    // TODO enable this route when the edit page is ready
    // this.router.navigate(['records', 'inspections', this.data._master._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
