import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsListResolver } from './records-list/records-list-resolver';

import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { OrderResolver } from './orders/order-detail/order-resolver';

import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { InspectionResolver } from './inspections/inspection-detail/inspection-resolver';

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
        path: 'orders/:orderId',
        data: {
          breadcrumb: 'Order Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: OrderDetailComponent,
            resolve: {
              records: OrderResolver
            },
            data: {
              breadcrumb: null
            }
          }
        ]
      },
      {
        path: 'inspections/:inspectionId',
        data: {
          breadcrumb: 'Order Details'
        },
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            component: InspectionDetailComponent,
            resolve: {
              records: InspectionResolver
            },
            data: {
              breadcrumb: null
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
  providers: [RecordsListResolver, OrderResolver]
})
export class RecordsRoutingModule {}
