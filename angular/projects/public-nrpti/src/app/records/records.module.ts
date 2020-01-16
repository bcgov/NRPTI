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

// resolvers
import { RecordsListResolver } from './records-list/records-list-resolver';
import { OrderResolver } from './orders/order-detail/order-resolver';

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
  declarations: [RecordsListComponent, RecordsTableRowComponent, OrderDetailComponent],
  providers: [RecordsListResolver, OrderResolver],
  entryComponents: [RecordsTableRowComponent],
  exports: []
})
export class RecordsModule {}
