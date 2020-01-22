import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// guards
import { CanActivateGuard } from '../guards/can-activate-guard.service';
import { CanDeactivateGuard } from '../guards/can-deactivate-guard.service';

// records
import { RecordsResolver } from './records-resolver';
import { RecordsListComponent } from './records-list/records-list.component';

// orders
import { OrderResolver } from './orders/order-resolver';
import { OrderAddEditComponent } from './orders/order-add-edit/order-add-edit.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';

// inspections
import { InspectionResolver } from './inspections/inspection-resolver';
import { InspectionDetailComponent } from './inspections/inspection-detail/inspection-detail.component';
import { InspectionAddEditComponent } from './inspections/inspection-add-edit/inspection-add-edit.component';

// other
import { Utils } from 'nrpti-angular-components';

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
        path: 'orders/add',
        component: OrderAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Order'
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
              breadcrumb: 'Edit Order'
            },
            resolve: {
              record: OrderResolver
            }
          }
        ]
      },
      {
        path: 'inspections/add',
        component: InspectionAddEditComponent,
        canActivate: [CanActivateGuard],
        data: {
          breadcrumb: 'Add Inspection'
        }
      },
      {
        path: 'inspections/:inspectionId',
        data: {
          breadcrumb: 'Inspection Details'
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
            canActivate: [CanActivateGuard],
            data: {
              breadcrumb: null
            },
            resolve: {
              records: InspectionResolver
            }
          },
          {
            path: 'edit',
            component: InspectionAddEditComponent,
            canActivate: [CanActivateGuard],
            canDeactivate: [CanDeactivateGuard],
            data: {
              breadcrumb: 'Edit Inspection'
            },
            resolve: {
              record: InspectionResolver
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
  providers: [RecordsResolver, OrderResolver, InspectionResolver, Utils]
})
export class RecordsRoutingModule { }
