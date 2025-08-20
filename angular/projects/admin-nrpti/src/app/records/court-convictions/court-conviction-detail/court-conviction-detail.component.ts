import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { CourtConviction } from '../../../../../../common/src/app/models/master/court-conviction';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordDetailComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { FactoryService } from '../../../services/factory.service';
import { AgencyDataService } from '../../../../../../../projects/global/src/lib/utils/agency-data-service';

@Component({
  standalone: false,
  selector: 'app-court-conviction-detail',
  templateUrl: './court-conviction-detail.component.html',
  styleUrls: ['./court-conviction-detail.component.scss']
})
export class CourtConvictionDetailComponent extends RecordDetailComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  public legislationString = '';

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
        alert("Uh-oh, couldn't load CourtConviction");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      // TODO: (NRPTI-1351) I refactored the following to resolve the issue with records serving up no data.
      // This logic is duplicate across the record detail components
      // this.data = {
      //   _master: new CourtConviction(record),
      //   flavourData:
      //     (record.flavours &&
      //       record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
      //     []
      // };

      this.data = {}
      const inspection = new Correspondence(record);
      this.data._master = inspection;
      this.data.flavourData = [];
      if (record?.flavours.length > 0) {
        const data = record.flavours.map(flavourRecord => {
          return this.data.flavourData.append(RecordUtils.getRecordModelInstance(flavourRecord));
        })
        this.data.flavourData.append(data)
      }

      this.populateTextFields();
      this.disableEdit();

      this.changeDetectionRef.detectChanges();
    });
  }

  populateTextFields() {
    if (this.data && this.data._master && this.data._master.legislation) {
      this.legislationString = CommonUtils.buildLegislationString(this.data._master.legislation, this.factoryService);
    }
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'court-convictions', this.data._master._id, 'edit']);
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
