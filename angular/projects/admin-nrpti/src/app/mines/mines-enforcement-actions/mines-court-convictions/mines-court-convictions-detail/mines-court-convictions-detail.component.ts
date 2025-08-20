import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourtConviction } from '../../../../../../../common/src/app/models/master/court-conviction';
import { takeUntil } from 'rxjs/operators';
import { CourtConvictionDetailComponent } from '../../../../records/court-convictions/court-conviction-detail/court-conviction-detail.component';
import { RecordUtils } from '../../../../records/utils/record-utils';
import { FactoryService } from '../../../../services/factory.service';
import { StoreService } from 'nrpti-angular-components';
import { AgencyDataService } from '../../../../../../../global/src/lib/utils/agency-data-service';

@Component({
  standalone: false,
  selector: 'app-mines-court-convictions-detail',
  templateUrl: './mines-court-convictions-detail.component.html',
  styleUrls: ['../../../../records/court-convictions/court-conviction-detail/court-conviction-detail.component.scss']
})
export class MinesCourtConvictionsDetailComponent extends CourtConvictionDetailComponent implements OnInit {
  public mine = [];
  public mineType = '';

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public changeDetectionRef: ChangeDetectorRef,
    public factoryService: FactoryService,
    private storeService: StoreService
  ) {
    super(route, router, changeDetectionRef, factoryService);
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (!res || !res.record) {
        alert("Uh-oh, couldn't load mines CourtConviction");
        this.router.navigate(['mines', 'enforcement-actions']);
        return;
      }

      const record = res.record[0] && res.record[0].data;

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
      const inspection = new CourtConviction(record);
      this.data._master = inspection;
      this.data.flavourData = [];
      if (record?.flavours.length > 0) {
        const data = record.flavours.map(flavourRecord => {
          return this.data.flavourData.append(RecordUtils.getRecordModelInstance(flavourRecord));
        })
        this.data.flavourData.append(data)
      }

      const mines = this.storeService.getItem('mines') || [];
      this.mine = mines.filter(elem => elem._sourceRefId === this.data._master.mineGuid);

      const unlistedType = this.data._master.unlistedMineType;
      if (this.mine.length === 0 && !unlistedType) {
        this.mineType = '';
      } else if (this.mine.length === 0 && unlistedType) {
        this.mineType = unlistedType;
      } else {
        this.mineType = this.mine[0].type;
      }

      this.populateTextFields();
      this.disableEdit();

      this.changeDetectionRef.detectChanges();
    });
  }

  displayName(agency) {
    const agencyDataService = new AgencyDataService(this.factoryService);
    return agencyDataService.displayNameFull(agency);
  }

  navigateToEditPage() {
    this.router.navigate(['mines', 'enforcement-actions', 'court-convictions', this.data._master._id, 'edit']);
  }
}
