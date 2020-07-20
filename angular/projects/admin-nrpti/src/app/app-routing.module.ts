import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { HomeComponent } from './home/home.component';
import { ImportComponent } from './import/import.component';
import { ImportListResolver } from './import/import-list-resolver';
import { NewsResolver } from './news/news-resolver';
import { NewsListComponent } from './news/news-list.component';

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
    path: 'news',
    pathMatch: 'full',
    component: NewsListComponent,
    resolve: {
      records: NewsResolver
    },
    data: {
      breadcrumb: 'News'
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
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'corrected' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
