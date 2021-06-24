import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Permit } from '../../../../../../common/src/app/models/master';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordDetailComponent } from '../../utils/record-component';
import { RecordUtils } from '../../utils/record-utils';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { FactoryService } from '../../../services/factory.service';
import { StoreService } from 'nrpti-angular-components';


@Component({
  selector: 'app-permit-detail',
  templateUrl: './permit-detail.component.html',
  styleUrls: ['./permit-detail.component.scss']
})
export class PermitDetailComponent extends RecordDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public legislationString = '';
  public mine = [];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    private storeService: StoreService,
  ) {
    super(factoryService);
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.records) {
        alert("Uh-oh, couldn't load Permit");
        this.router.navigate(['/']);
        return;
      }

      const record = res.records[0] && res.records[0].data;
      const mines = this.storeService.getItem('mines');
      this.data = {
        _master: new Permit(record),
        flavourData:
          (record.flavours &&
            record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
          []
      };

      this.mine = mines.filter(elem => elem._sourceRefId === this.data._master.mineGuid);
      this.populateTextFields();
      this.disableEdit();

      this.changeDetectionRef.detectChanges();
    });
  }

  populateTextFields() {
    if (this.data && this.data._master && this.data._master.legislation) {
      this.legislationString = CommonUtils.buildLegislationString(this.data._master.legislation);
    }
  }

  navigateToEditPage() {
    this.router.navigate(['records', 'permits', this.data._master._id, 'edit']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
