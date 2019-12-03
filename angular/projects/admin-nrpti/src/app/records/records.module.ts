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
import { RecordsAddEditComponent } from './records-add-edit/records-add-edit.component';
import { RecordsTableRowsComponent } from './records-rows/records-table-rows.component';

// resolvers
import { RecordsListResolver } from '../records/records-list/records-list-resolver';
import { SearchService } from '../services/search.service';

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
  declarations: [RecordsListComponent, RecordsAddEditComponent, RecordsTableRowsComponent],
  providers: [RecordsListResolver, SearchService],
  exports: []
})
export class RecordsModule {}
