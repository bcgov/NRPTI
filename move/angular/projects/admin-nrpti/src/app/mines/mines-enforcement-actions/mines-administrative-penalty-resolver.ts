import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FactoryService } from '../../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class MinesAdministrativePenaltyResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const administrativePenaltyId = route.paramMap.get('recordId');
    return this.factoryService.getRecordWithFlavours(administrativePenaltyId, 'AdministrativePenalty');
  }
}
