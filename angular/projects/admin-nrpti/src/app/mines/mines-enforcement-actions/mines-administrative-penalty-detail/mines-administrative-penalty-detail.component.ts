import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativePenalty } from '../../../../../../common/src/app/models/master/administrative-penalty';
import { takeUntil } from 'rxjs/operators';
import { AdministrativePenaltyDetailComponent } from '../../../records/administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { RecordUtils } from '../../../records/utils/record-utils';
import { FactoryService } from '../../../services/factory.service';
import { StoreService, Utils } from 'nrpti-angular-components';

@Component({
  selector: 'app-mines-administrative-penalty-detail',
  templateUrl: './mines-administrative-penalty-detail.component.html',
  styleUrls: ['../../../records/administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component.scss']
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

      this.data = {
        _master: new AdministrativePenalty(record),
        flavourData:
          (record.flavours &&
            record.flavours.map(flavourRecord => RecordUtils.getRecordModelInstance(flavourRecord))) ||
          []
      };

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
    return Utils.displayNameFull(agency);
  }

  navigateToEditPage() {
    this.router.navigate(['mines', 'enforcement-actions', 'administrative-penalties', this.data._master._id, 'edit']);
  }
}
