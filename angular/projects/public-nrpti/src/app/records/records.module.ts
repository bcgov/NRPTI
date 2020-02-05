// modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule as NrptiCommonModule } from '../../../../common/src/app/common.module';
import { SharedModule } from '../shared.module';
import { RecordsRoutingModule } from './records-routing.module';

// components
import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsTableRowComponent } from './records-row/records-table-row.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { RestorativeJusticeDetailComponent } from './restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { AdministrativePenaltyDetailComponent } from './administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativeSanctionDetailComponent } from './administrative-sanctions/administrative-sanction-detail/administrative-sanction-detail.component';

// resolvers
import { RecordsListResolver } from './records-list/records-list-resolver';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    GlobalModule,
    NrptiCommonModule,
    SharedModule,
    NgxPaginationModule,
    NgbModule.forRoot(),
    InlineSVGModule.forRoot(),
    RecordsRoutingModule
  ],
  declarations: [
    RecordsListComponent,
    RecordsTableRowComponent,
    OrderDetailComponent,
    InspectionDetailComponent,
    RestorativeJusticeDetailComponent,
    AdministrativePenaltyDetailComponent,
    AdministrativeSanctionDetailComponent
  ],
  providers: [RecordsListResolver],
  entryComponents: [RecordsTableRowComponent],
  exports: []
})
export class RecordsModule {}
