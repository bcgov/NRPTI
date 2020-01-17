import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class OrderResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const orderId = route.paramMap.get('orderId');
    return this.factoryService.getRecord(orderId, 'Order');
  }
}
