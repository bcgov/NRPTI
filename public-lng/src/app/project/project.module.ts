import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from 'app/shared.module';
import { DocumentsModule } from './documents/documents.module';

// Components
import { ProjectComponent } from './project.component';
import { OverviewComponent } from './overview/overview.component';
import { BackgroundComponent } from './background/background.component';
import { AuthorizationsComponent } from './authorizations/authorizations.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { NationsComponent } from './nations/nations.component';
import { PlansComponent } from './plans/plans.component';

@NgModule({
  imports: [CommonModule, FormsModule, NgbModule.forRoot(), RouterModule, DocumentsModule, SharedModule],
  declarations: [
    ProjectComponent,
    OverviewComponent,
    BackgroundComponent,
    AuthorizationsComponent,
    ComplianceComponent,
    NationsComponent,
    PlansComponent
  ],
  entryComponents: []
})
export class ProjectModule {}
