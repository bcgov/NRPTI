import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsAddEditComponent } from './records-add-edit/records-add-edit.component';
import { CanActivateGuard } from '../guards/can-activate-guard.service';
import { RecordsListResolver } from './records-list/records-list-resolver';
import { RecordDetailComponent } from './record-detail/record-detail.component';

const routes: Routes = [
  {
    path: 'records',
    data: {
      breadcrumb: 'Records List'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: RecordsListComponent,
        canActivate: [CanActivateGuard],
        resolve: {
          records: RecordsListResolver
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
            redirectTo: 'details',
            pathMatch: 'full'
          },
          {
            path: 'details',
            component: RecordDetailComponent,
            data: {
              breadcrumb: null
            }
          },
          {
            path: 'edit',
            component: RecordsAddEditComponent,
            data: {
              breadcrumb: 'Edit'
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
  providers: [RecordsListResolver]
})
export class RecordsRoutingModule {}
