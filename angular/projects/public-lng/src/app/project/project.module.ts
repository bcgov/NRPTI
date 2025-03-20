import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { GlobalModule } from 'nrpti-angular-components';
import { SharedModule } from '../shared.module';
import { DocumentsModule } from './documents/documents.module';
import { ExplorePanelComponent } from '../explore-panel/explore-panel.component';
import { DateInputComponent } from '../explore-panel/date-input/date-input.component';

// Components
import { ProjectComponent } from './project.component';
import { OverviewComponent } from './overview/overview.component';
import { BackgroundComponent } from './background/background.component';
import { AuthorizationsComponent } from './authorizations/authorizations.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { NationsComponent } from './nations/nations.component';
import { PlansComponent } from './plans/plans.component';

@NgModule({
  imports: [CommonModule, FormsModule, NgbModule, RouterModule, DocumentsModule, GlobalModule, SharedModule],
  declarations: [
    ProjectComponent,
    OverviewComponent,
    BackgroundComponent,
    AuthorizationsComponent,
    ComplianceComponent,
    NationsComponent,
    ExplorePanelComponent,
    DateInputComponent,
    PlansComponent
  ]
})
export class ProjectModule {}
