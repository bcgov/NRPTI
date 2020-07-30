import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';
import { SchemaLists } from '../../../../common/src/app/utils/record-constants';

@Injectable()
export class MinesRecordResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const recordId = route.paramMap.get('recordId');

    const and = {};
    const or = {};
    const nor = {};

    and['_id'] = recordId;

    return this.factoryService.getRecords(
      '',
      SchemaLists.bcmiRecordTypes,
      [],
      1,
      25,
      '-dateAdded',
      and,
      true,
      or,
      [],
      nor
    );
  }
}
