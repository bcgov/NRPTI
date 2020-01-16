import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CanActivateGuard } from '../guards/can-activate-guard.service';
import { RecordsListComponent } from './records-list/records-list.component';
import { RecordsResolver } from './records-resolver';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { OrderAddEditComponent } from './orders/order-add-edit/order-add-edit.component';
import { CanDeactivateGuard } from '../guards/can-deactivate-guard.service';
import { OrderResolver } from './orders/order-resolver';

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
          records: RecordsResolver
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
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: OrderResolver
            }
          },
          {
            path: 'edit',
            component: OrderAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit'
            },
            resolve: {
              records: OrderResolver
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
  providers: [RecordsResolver, OrderResolver]
})
export class RecordsRoutingModule {}
