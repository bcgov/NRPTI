import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class InspectionResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const inspectionId = route.paramMap.get('inspectionId');
    return this.factoryService.getRecords(
      null,
      ['InspectionNRCED', 'InspectionLNG'],
      null,
      null,
      null,
      null,
      {
        _master: inspectionId
      },
      null,
      null
    );
  }
}
