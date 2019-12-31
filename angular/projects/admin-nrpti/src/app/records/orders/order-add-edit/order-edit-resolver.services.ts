import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'nrpti-angular-components';
import { ApiService } from '../../../services/api.service';

@Injectable()
export class OrderEditResolver implements Resolve<Observable<object>> {
  constructor(private apiService: ApiService, private searchService: SearchService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const orderId = route.paramMap.get('orderId');
    return this.searchService.getItem(this.apiService.pathAPI, orderId, 'Order');
  }
}
