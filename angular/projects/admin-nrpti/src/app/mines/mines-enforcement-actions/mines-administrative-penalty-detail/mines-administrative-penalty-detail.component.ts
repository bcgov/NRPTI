import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativePenalty } from '../../../../../../common/src/app/models/master/administrative-penalty';
import { takeUntil } from 'rxjs/operators';
import { AdministrativePenaltyDetailComponent } from '../../../records/administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { RecordUtils } from '../../../records/utils/record-utils';
import { FactoryService } from '../../../services/factory.service';
import { StoreService } from 'nrpti-angular-components';
import { AgencyDataService } from '../../../../../../global/src/lib/utils/agency-data-service';

@Component({
  standalone: false,
  selector: 'app-mines-administrative-penalty-detail',
  templateUrl: './mines-administrative-penalty-detail.component.html',
  styleUrls: [
    '../../../records/administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component.scss' // eslint-disable-line max-len
  ]
})
export class MinesAdministrativePenaltyDetailComponent extends AdministrativePenaltyDetailComponent implements OnInit {
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
        alert("Uh-oh, couldn't load mines AdministrativePenalty");
        this.router.navigate(['mines', 'enforcement-actions']);
        return;
      }

      const record = res.record[0] && res.record[0].data;

      // TODO: (NRPTI-1351) I refactored the following to resolve the issue with records serving up no data.
      // This logic is duplicate across the record detail components
      // this.data = {
      //   _master: new AdministrativePenalty(record),
      //   flavourData:
      //     (record.flavours &&
      //       record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
      //     []
      // };

      this.data = {}
      const inspection = new AdministrativePenalty(record);
      this.data._master = inspection;
      this.data.flavourData = [];
      if (record?.flavours.length > 0) {
        const data = record.flavours.map(flavourRecord => {
          return this.data.flavourData.push(RecordUtils.getRecordModelInstance(flavourRecord));
        })
        this.data.flavourData.push(data)
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
    this.router.navigate(['mines', 'enforcement-actions', 'administrative-penalties', this.data._master._id, 'edit']);
  }
}
