import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordsListComponent } from './records-list/records-list.component';
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
            path: 'details',
            component: RecordDetailComponent,
            data: {
              breadcrumb: null
            }
          },
          {
            path: '',
            redirectTo: 'details',
            pathMatch: 'full'
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
