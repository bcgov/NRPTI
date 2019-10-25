import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from 'app/contact/contact.component';
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
import { ProjectsComponent } from './projects/projects.component';

const routes: Routes = [
  {
    path: 'projects',
    component: ProjectsComponent
  },
  {
    path: 'project/:id',
    component: ProjectComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'background', component: BackgroundComponent },
      { path: 'authorizations', component: AuthorizationsComponent },
      { path: 'compliance', component: ComplianceComponent },
      { path: 'plans', component: PlansComponent },
      { path: 'nations', component: NationsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview' }
    ]
  },
  {
    path: 'map',
    component: ApplicationsComponent
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
