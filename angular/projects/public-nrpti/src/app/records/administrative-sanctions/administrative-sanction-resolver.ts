import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class AdministrativeSanctionResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const administrativeSanctionId = route.paramMap.get('administrativeSanctionId');
    return this.factoryService.getRecord(administrativeSanctionId, 'AdministrativeSanctionNRCED', true);
  }
}
