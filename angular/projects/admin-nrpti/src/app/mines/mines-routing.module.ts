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

// other
import { Utils } from 'nrpti-angular-components';

const routes: Routes = [
  {
    path: 'mines',
    data: {
      breadcrumb: 'Mines List'
    },
    children: [
      // mines
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
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MinesListResolver, MinesResolver, Utils]
})
export class MinesRoutingModule {}
