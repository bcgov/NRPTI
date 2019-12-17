import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { HomeComponent } from './home/home.component';
import { ImportComponent } from './import/import.component';
import { ImportListResolver } from './import/import-list-resolver';

const routes: Routes = [
  {
    path: 'not-authorized',
    pathMatch: 'full',
    component: NotAuthorizedComponent
  },
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'imports',
    pathMatch: 'full',
    component: ImportComponent,
    resolve: {
      records: ImportListResolver
    },
    data: {
      breadcrumb: 'Imports'
    }
  },
  {
    // wildcard default route
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
