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
import { MinesCollectionsListComponent } from './mines-collections-list/mines-collections-list.component';
import { MinesCollectionsListResolver } from './mines-collections-list-resolver';
import { MinesCollectionDetailComponent } from './mines-collection-detail/mines-collection-detail.component';
import { MinesCollectionsAddEditComponent } from './mines-collections-add-edit/mines-collections-add-edit.component';
import { MinesCollectionResolver } from './mines-collection-resolver';
import { MinesRecordDetailComponent } from './mines-records-detail/mines-records-detail.component';
import { MinesRecordResolver } from './mines-record-resolver';
import { MinesRecordCollectionResolver } from './mines-record-collection-resolver';
import { MinesRecordsEditComponent } from './mines-records-edit/mines-records-edit.component';
// other
import { Utils } from 'nrpti-angular-components';
import { EnforcementActionsComponent } from '../enforcement-actions/enforcement-actions.component';
import { EnforcementActionsResolver } from '../enforcement-actions/enforcement-actions-resolver';
import { MinesAdministrativePenaltyResolver } from './mines-enforcement-actions/mines-administrative-penalty-resolver';

import { MinesAdministrativePenaltyAddEditComponent } from './mines-enforcement-actions/mines-administrative-penalty-add-edit/mines-administrative-penalty-add-edit.component';
import { MinesAdministrativePenaltyDetailComponent } from './mines-enforcement-actions/mines-administrative-penalty-detail/mines-administrative-penalty-detail.component';


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
        path: 'enforcement-actions',
        data: {
          breadcrumb: 'Enforcement Actions'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: EnforcementActionsComponent,
            resolve: {
              records: EnforcementActionsResolver,
            },
          },
          {
            path: 'administrative-penalties',
            data: {
              breadcrumb: 'Administrative Penalty'
            },
            children: [
              {
                path: 'add',
                pathMatch: 'full',
                component: MinesAdministrativePenaltyAddEditComponent,
                canActivate: [CanActivateGuard],
                data: {
                  breadcrumb: 'Add Administrative Penalty'
                },
                resolve: {
                  mines: MinesListResolver,
                  record: MinesAdministrativePenaltyResolver
                }
              },
              {
                path: ':recordId',
                data: {
                  breadcrumb: 'Record Detail'
                },
                children: [
                  {
                    path: '',
                    redirectTo: 'detail',
                    pathMatch: 'full'
                  },
                  {
                    path: 'detail',
                    component: MinesAdministrativePenaltyDetailComponent,
                    canActivate: [CanActivateGuard],
                    data: {
                      breadcrumb: null
                    },
                    resolve: {
                      mines: MinesListResolver,
                      record: MinesAdministrativePenaltyResolver
                    }
                  },
                  {
                    path: 'edit',
                    component: MinesAdministrativePenaltyAddEditComponent,
                    canActivate: [CanActivateGuard],
                    data: {
                      breadcrumb: 'Edit Administrative Penalty'
                    },
                    resolve: {
                      mines: MinesListResolver,
                      record: MinesAdministrativePenaltyResolver
                    }
                  }
                ]
              }
            ]
          }
        ]
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
            data: {
              breadcrumb: 'Mine Records'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: MinesRecordsListComponent,
                canActivate: [CanActivateGuard],
                resolve: {
                  records: MinesRecordsListResolver
                },
              },
              {
                path: 'add',
                component: MinesRecordsEditComponent,
                canActivate: [CanActivateGuard],
                data: {
                  breadcrumb: 'Add Record'
                }
              },
              {
                path: ':recordId',
                data: {
                  breadcrumb: 'Record Details'
                },
                children: [
                  {
                    path: '',
                    redirectTo: 'detail',
                    pathMatch: 'full'
                  },
                  {
                    path: 'detail',
                    component: MinesRecordDetailComponent,
                    canActivate: [CanActivateGuard],
                    data: {
                      breadcrumb: null
                    },
                    resolve: {
                      record: MinesRecordResolver,
                      collections: MinesRecordCollectionResolver,
                    }
                  },
                  {
                    path: 'edit',
                    component: MinesRecordsEditComponent,
                    canActivate: [CanActivateGuard],
                    data: {
                      breadcrumb: 'Edit Record'
                    },
                    resolve: {
                      record: MinesRecordResolver,
                      collection: MinesRecordCollectionResolver
                    }
                  }
                ]
              }
            ]
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
                path: 'add',
                component: MinesCollectionsAddEditComponent,
                canActivate: [CanActivateGuard],
                data: {
                  breadcrumb: 'Add Collection'
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
                  },
                  {
                    path: 'edit',
                    component: MinesCollectionsAddEditComponent,
                    canActivate: [CanActivateGuard],
                    data: {
                      breadcrumb: 'Edit Collection'
                    },
                    resolve: {
                      collection: MinesCollectionResolver
                    }
                  }
                ]
              }
            ]
          }
        ],
        resolve: {
          mine: MinesResolver
        }
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
    MinesRecordResolver,
    MinesRecordCollectionResolver,
    MinesAdministrativePenaltyResolver,
    Utils
  ]
})
export class MinesRoutingModule { }
