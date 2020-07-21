import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class MinesCollectionResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const collectionId = route.paramMap.get('collectionId');
    return this.factoryService.getRecord(collectionId, 'CollectionBCMI', true);
  }
}
