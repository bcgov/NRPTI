import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class MinesRecordCollectionResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const recordId = route.paramMap.get('recordId');

    const and = {};
    const or = {};
    const nor = {};
    const _in = {};

    _in['records'] = recordId;

    return this.factoryService.getRecords(
      '',
      ['CollectionBCMI'],
      [],
      1,
      25,
      '-dateAdded',
      and,
      false,
      or,
      [],
      nor,
      _in
    );
  }
}
