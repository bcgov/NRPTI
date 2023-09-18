import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Inspection } from '../../../../../../common/src/app/models/master/inspection';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordDetailComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { FactoryService } from '../../../services/factory.service';
import { IssuingAgencyService } from '../../../services/issuingagency.service';

@Component({
  selector: 'app-inspection-detail',
  templateUrl: './inspection-detail.component.html',
  styleUrls: ['./inspection-detail.component.scss']
})
export class InspectionDetailComponent extends RecordDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public legislationString = '';

  public issuingAgencyMap = {};

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    private issuingAgencyService: IssuingAgencyService
  ) {
    super(factoryService);
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load Inspection");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;

      this.data = {
        _master: new Inspection(record),
        flavourData:
          (record.flavours &&
            record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
          []
      };

      this.populateTextFields();
      this.disableEdit();

      this.changeDetectionRef.detectChanges();
      this.getIssuingAgencyList();
    });
  }

  populateTextFields() {
    if (this.data && this.data._master && this.data._master.legislation) {
      this.legislationString = CommonUtils.buildLegislationString(this.data._master.legislation);
    }
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'inspections', this.data._master._id, 'edit']);
  }

  displayName(agency) {
    return this.issuingAgencyMap[agency];
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getIssuingAgencyList = () => {
    this.issuingAgencyService
      .getIssuingAgencies()
      .then(response => {
        if (response && Array.isArray(response)) {
          this.issuingAgencyMap = response.reduce((result, item) => {
            result[item.agencyCode] = item.agencyName;
            return result;
          }, {});
        }
      })
      .catch(error => {
        console.error('API call error:', error);
      });
  };
}
