import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FactoryService } from '../../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class AdministrativeSanctionResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const administrativeSanctionId = route.paramMap.get('administrativeSanctionId');
    return this.factoryService.getRecordWithFlavours(administrativeSanctionId, 'AdministrativeSanction');
  }
}
