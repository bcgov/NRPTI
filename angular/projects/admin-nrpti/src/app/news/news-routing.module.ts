import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// guards
import { CanActivateGuard } from '../guards/can-activate-guard.service';
import { CanDeactivateGuard } from '../guards/can-deactivate-guard.service';

// news
import { NewsResolver } from './news-resolver';
import { NewsListResolver } from './news-list.resolver';
import { NewsListComponent } from './news-list.component';
import { NewsAddEditComponent } from './news-add-edit/news-add-edit.component';
import { NewsDetailComponent } from './news-detail/news-detail.component';

// other
import { Utils } from 'nrpti-angular-components';

const routes: Routes = [
  {
    path: 'news',
    data: {
      breadcrumb: 'News List'
    },
    children: [
      // news
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: NewsListComponent,
        canActivate: [CanActivateGuard],
        resolve: {
          records: NewsListResolver
        }
      },
      {
        path: ':newsType/add',
        component: NewsAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add News',
          cock: 'yes'
        },
        resolve: {
          record: NewsResolver
        }
      },
      {
        path: ':newsType/:newsId',
        data: {
          breadcrumb: 'News Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: NewsDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              record: NewsResolver
            }
          },
          {
            path: 'edit',
            component: NewsAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit News'
            },
            resolve: {
              record: NewsResolver
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    NewsResolver,
    Utils
  ]
})
export class NewsRoutingModule {}
