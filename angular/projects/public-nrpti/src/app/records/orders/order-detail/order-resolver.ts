import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../../services/factory.service';

@Injectable()
export class OrderResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const orderId = route.paramMap.get('orderId');
    return this.factoryService.getRecord(orderId, 'OrderNRCED', true);
  }
}
