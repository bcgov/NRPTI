import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class WarningResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const warningId = route.paramMap.get('warningId');
    return this.factoryService.getRecord(warningId, 'WarningNRCED', true);
  }
}
