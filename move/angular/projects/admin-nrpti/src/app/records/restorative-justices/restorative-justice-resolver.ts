import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FactoryService } from '../../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class RestorativeJusticeResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const restorativeJusticeId = route.paramMap.get('restorativeJusticeId');
    return this.factoryService.getRecordWithFlavours(restorativeJusticeId, 'RestorativeJustice');
  }
}
