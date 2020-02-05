import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class AdministrativePenaltyResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const administrativePenaltyId = route.paramMap.get('administrativePenaltyId');
    return this.factoryService.getRecord(administrativePenaltyId, 'AdministrativePenaltyNRCED');
  }
}
