import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '../../shared.module';
import { CommonModule as NrptiCommonModule } from '../../../../../common/src/app/common.module';
import { GlobalModule } from 'nrpti-angular-components';

// Components
import { DocumentsComponent } from './documents.component';
import { ComplianceTableRowsComponent } from '../compliance/compliance-rows/compliance-table-rows.component';
import { AuthorizationsTableRowsComponent } from '../authorizations/authorizations-rows/authorizations-table-rows.component';
import { PlansTableRowsComponent } from '../plans/plans-rows/plans-table-rows.component';
import { NationsTableRowsComponent } from '../nations/nations-rows/nations-table-rows.component';

@NgModule({
  imports: [
    CommonModule,
    GlobalModule,
    NrptiCommonModule,
    FormsModule,
    NgbModule,
    RouterModule,
    SharedModule,
    GlobalModule
  ],
  declarations: [
    DocumentsComponent,
    ComplianceTableRowsComponent,
    AuthorizationsTableRowsComponent,
    PlansTableRowsComponent,
    NationsTableRowsComponent
  ],
  exports: [DocumentsComponent]
})
export class DocumentsModule {}
