import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { ApplicationsComponent } from './applications/applications.component';
import { FaqComponent } from './faq/faq.component';
import { HomeComponent } from './home/home.component';
import { AuthorizationsComponent } from './project/authorizations/authorizations.component';
import { ComplianceComponent } from './project/compliance/compliance.component';
import { NationsComponent } from './project/nations/nations.component';
import { OverviewComponent } from './project/overview/overview.component';
import { BackgroundComponent } from './project/background/background.component';
import { PlansComponent } from './project/plans/plans.component';
import { ProjectComponent } from './project/project.component';
import { ComplianceResolver } from './project/compliance/compliance-resolver';
import { AuthorizationsResolver } from './project/authorizations/authorizations-resolver';
import { PlansResolver } from './project/plans/plans-resolver';
import { NationsResolver } from './project/nations/nations-resolver';
import { MapLayerInfoResolver } from './applications/applications.resolver';

const routes: Routes = [
  {
    path: 'project/:id',
    component: ProjectComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'background', component: BackgroundComponent },
      {
        path: 'authorizations',
        component: AuthorizationsComponent,
        resolve: {
          records: AuthorizationsResolver
        }
      },
      {
        path: 'compliance',
        component: ComplianceComponent,
        resolve: {
          records: ComplianceResolver
        }
      },
      {
        path: 'plans',
        component: PlansComponent,
        resolve: {
          records: PlansResolver
        }
      },
      {
        path: 'nations',
        component: NationsComponent,
        resolve: {
          records: NationsResolver
        }
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' }
    ]
  },
  {
    path: 'map',
    component: ApplicationsComponent,
    resolve: { data: MapLayerInfoResolver }
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  {
    path: 'connect',
    component: ContactComponent
  },
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    })
  ],
  providers: [ComplianceResolver, AuthorizationsResolver, PlansResolver, NationsResolver, MapLayerInfoResolver],
  exports: [RouterModule]
})
export class AppRoutingModule {}
