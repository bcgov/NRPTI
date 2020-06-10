import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';
import { Mine } from '../../../../common/src/app/models/bcmi/mine';
import { of } from 'rxjs';

@Injectable()
export class MinesResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const mineId = route.paramMap.get('mineId');

    const schemaName = 'Mine';

    if (mineId === null) {
      return of(new Mine({_schemaName: schemaName}));
    }

    return this.factoryService.getRecord(mineId, schemaName);
  }
}
