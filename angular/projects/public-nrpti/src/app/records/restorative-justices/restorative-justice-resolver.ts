import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class RestorativeJusticeResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const restorativeJusticeId = route.paramMap.get('restorativeJusticeId');
    return this.factoryService.getRecord(restorativeJusticeId, 'RestorativeJusticeNRCED', true);
  }
}
