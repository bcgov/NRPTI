import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Permit } from '../../../../../../common/src/app/models/master';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';

@Component({
  selector: 'app-permit-detail',
  templateUrl: './permit-detail.component.html',
  styleUrls: ['./permit-detail.component.scss']
})
export class PermitDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(public route: ActivatedRoute, public router: Router, public changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load Permit");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      this.data = {
        _master: new Permit(record),
        flavourData:
          (record.flavours &&
            record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
          []
      };

      this.changeDetectionRef.detectChanges();
    });
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'permits', this.data._master._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
