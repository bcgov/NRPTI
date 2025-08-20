import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Agreement } from '../../../../../../common/src/app/models/master/agreement';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordDetailComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';
import { FactoryService } from '../../../services/factory.service';

@Component({
  standalone: false,
  selector: 'app-agreement-detail',
  templateUrl: './agreement-detail.component.html',
  styleUrls: ['./agreement-detail.component.scss']
})
export class AgreementDetailComponent extends RecordDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService
  ) {
    super(factoryService);
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load Agreement");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      // TODO: (NRPTI-1351) I refactored the following to resolve the issue with records serving up no data.
      // This logic is duplicate across the record detail components
      // this.data = {
      //   _master: new Agreement(record),
      //   flavourData:
      //     (record.flavours &&
      //       record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
      //     []
      // };

      this.data = {}
      const inspection = new Agreement(record);
      this.data._master = inspection;
      this.data.flavourData = [];
      if (record?.flavours.length > 0) {
        const data = record.flavours.map(flavourRecord => {
          return this.data.flavourData.append(RecordUtils.getRecordModelInstance(flavourRecord));
        })
        this.data.flavourData.append(data)
      }

      this.disableEdit();

      this.changeDetectionRef.detectChanges();
    });
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'agreements', this.data._master._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
