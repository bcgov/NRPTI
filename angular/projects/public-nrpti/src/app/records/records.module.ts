// modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { SearchFiltersComponent } from './records-list/search-filters/search-filters.component';
import { RecordsTableRowComponent } from './records-row/records-table-row.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { RestorativeJusticeDetailComponent } from './restorative-justices/restorative-justice-detail/restorative-justice-detail.component';
import { AdministrativePenaltyDetailComponent } from './administrative-penalties/administrative-penalty-detail/administrative-penalty-detail.component';
import { AdministrativeSanctionDetailComponent } from './administrative-sanctions/administrative-sanction-detail/administrative-sanction-detail.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { WarningDetailComponent } from './warnings/warning-detail/warning-detail.component';
import { CourtConvictionDetailComponent } from './court-convictions/court-conviction-detail/court-conviction-detail.component';

// resolvers
import { RecordsListResolver } from './records-list/records-list-resolver';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    SearchFiltersComponent,
    RecordsTableRowComponent,
    OrderDetailComponent,
    InspectionDetailComponent,
    RestorativeJusticeDetailComponent,
    AdministrativePenaltyDetailComponent,
    AdministrativeSanctionDetailComponent,
    TicketDetailComponent,
    WarningDetailComponent,
    CourtConvictionDetailComponent
  ],
  providers: [RecordsListResolver],
  entryComponents: [
    AdministrativePenaltyDetailComponent,
    AdministrativeSanctionDetailComponent,
    CourtConvictionDetailComponent,
    InspectionDetailComponent,
    OrderDetailComponent,
    RecordsTableRowComponent,
    RestorativeJusticeDetailComponent,
    TicketDetailComponent,
    WarningDetailComponent
  ],
  exports: []
})
export class RecordsModule {}
