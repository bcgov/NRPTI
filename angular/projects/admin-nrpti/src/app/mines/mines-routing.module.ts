import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// guards
import { CanActivateGuard } from '../guards/can-activate-guard.service';
import { CanDeactivateGuard } from '../guards/can-deactivate-guard.service';
// mines
import { MinesListResolver } from './mines-list-resolver';
import { MinesListComponent } from './mines-list/mines-list.component';
import { MinesDetailComponent } from './mines-detail/mines-detail.component';
import { MinesAddEditComponent } from './mines-add-edit/mines-add-edit.component';
import { MinesResolver } from './mines-resolver';
import { MinesRecordsListComponent } from './mines-records-list/mines-records-list.component';
import { MinesRecordsListResolver } from './mines-records-list-resolver';
import { MinesCollectionDetailComponent } from './mines-collection-detail/mines-collection-detail.component';
import { MinesCollectionResolver } from './mines-collection-resolver';
// other
import { Utils } from 'nrpti-angular-components';
import { MinesCollectionsListComponent } from './mines-collections-list/mines-collections-list.component';
import { MinesCollectionsListResolver } from './mines-collections-list-resolver';

const routes: Routes = [
  {
    path: 'mines',
    data: {
      breadcrumb: 'Mines List'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: MinesListComponent,
        canActivate: [CanActivateGuard],
        resolve: {
          mines: MinesListResolver
        }
      },
      {
        path: ':mineId',
        data: {
          breadcrumb: 'Mine Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: MinesDetailComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              mine: MinesResolver
            }
          },
          {
            path: 'edit',
            component: MinesAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Mine'
            },
            resolve: {
              mine: MinesResolver
            }
          },
          {
            path: 'records',
            component: MinesRecordsListComponent,
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: 'Mine Records'
            },
            resolve: {
              records: MinesRecordsListResolver,
              mine: MinesResolver
            }
          },
          {
            path: 'collections',
            data: {
              breadcrumb: 'Mine Collections'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: MinesCollectionsListComponent,
                canActivate: [CanActivateGuard],
                resolve: {
                  collections: MinesCollectionsListResolver,
                  mine: MinesResolver
                }
              },
              {
                path: ':collectionId',
                data: {
                  breadcrumb: 'Collection Details'
                },
                children: [
                  {
                    path: '',
                    redirectTo: 'detail',
                    pathMatch: 'full'
                  },
                  {
                    path: 'detail',
                    component: MinesCollectionDetailComponent,
                    canActivate: [CanActivateGuard],
                    data: {
                      breadcrumb: null
                    },
                    resolve: {
                      collection: MinesCollectionResolver
                    }
                  }
                ]
              }
            ]
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
    MinesListResolver,
    MinesResolver,
    MinesRecordsListResolver,
    MinesCollectionsListResolver,
    MinesCollectionResolver,
    Utils
  ]
})
export class MinesRoutingModule {}
