import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// guards
import { CanActivateGuard } from '../guards/can-activate-guard.service';

// mines
import { MinesListResolver } from './mines-list-resolver';
import { MinesListComponent } from './mines-list/mines-list.component';

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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [MinesListResolver, Utils]
})
export class MinesRoutingModule {}
