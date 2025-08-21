import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ManagementPlan } from '../../../../../../common/src/app/models/master';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';
import { AgencyDataService } from '../../../../../../../projects/global/src/lib/utils/agency-data-service';
import { FactoryService } from '../../../services/factory.service';

@Component({
  standalone: false,
  selector: 'app-management-plan-detail',
  templateUrl: './management-plan-detail.component.html',
  styleUrls: ['./management-plan-detail.component.scss']
})
export class ManagementPlanDetailComponent extends RecordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService
  ) {
    super();
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load ManagementPlan");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      // TODO: (NRPTI-1351) I refactored the following to resolve the issue with records serving up no data.
      // This logic is duplicate across the record detail components
      // this.data = {
      //   _master: new ManagementPlan(record),
      //   flavourData:
      //     (record.flavours &&
      //       record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
      //     []
      // };

      this.data = {}
      const inspection = new ManagementPlan(record);
      this.data._master = inspection;
      this.data.flavourData = [];
      if (record?.flavours.length > 0) {
        const data = record.flavours.map(flavourRecord => {
          return this.data.flavourData.push(RecordUtils.getRecordModelInstance(flavourRecord));
        })
        this.data.flavourData.push(data)
      }

      this.changeDetectionRef.detectChanges();
    });
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'management-plans', this.data._master._id, 'edit']);
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
