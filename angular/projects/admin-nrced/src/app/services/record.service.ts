import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';

import { ApiService, IRecordQueryParamSet } from './api.service';
import { Record } from '../models/record';
import { mergeMap, catchError } from 'rxjs/operators';
import flatten from 'lodash.flatten';

/**
 * Provides methods for retrieving and working with records.
 *
 * @export
 * @class RecordService
 */
@Injectable({ providedIn: 'root' })
export class RecordService {
  constructor(public api: ApiService) {}

  /**
   * Return the record for the given id.
   *
   * @param {IRecordQueryParamSet} queryParamSet query parameter set.
   * @returns {Observable<Record>} An observable that emits the matching record or null if none found.
   * @memberof RecordService
   */
  public getbyId(queryParamSet: IRecordQueryParamSet = null): Observable<Record> {
    return this.api.getRecords(queryParamSet).pipe(
      mergeMap((records: Record[]) => {
        if (!(records && records.length)) {
          return of(null);
        }

        return of(records[0]);
      }),
      catchError(this.api.handleError)
    );
  }

  /**
   * Return all records that match the provided filters.
   *
   * @param {IRecordQueryParamSet[]} queryParamSet array of query parameter sets.
   * @returns {Observable<Record[]>} total results from all query param sets. Not guaranteed to be unique.
   * @memberof RecordService
   */
  public getAll(queryParamSets: IRecordQueryParamSet[] = null): Observable<Record[]> {
    let observables: Array<Observable<Record[]>>;

    if (queryParamSets && queryParamSets.length) {
      observables = queryParamSets.map(queryParamSet => this.api.getRecords(queryParamSet));
    } else {
      observables = [this.api.getRecords()];
    }

    return combineLatest(...observables).pipe(
      mergeMap((results: Record[][]) => {
        const flattenedResults = flatten(results);
        if (!flattenedResults || !flattenedResults.length) {
          return of([] as Record[]);
        }

        return of(flattenedResults);
      }),
      catchError(this.api.handleError)
    );
  }

  /**
   * Get a count of all records that match the provided filters.
   *
   * @param {IRecordQueryParamSet[]} queryParamSet array of query parameter sets.
   * @returns {Observable<number>} total results from all query param sets. Not guaranteed to be unique.
   * @memberof RecordService
   */
  public getCount(queryParamSets: IRecordQueryParamSet[] = null): Observable<number> {
    let observables: Array<Observable<number>>;

    if (queryParamSets && queryParamSets.length) {
      observables = queryParamSets.map(queryParamSet => this.api.getRecordsCount(queryParamSet));
    } else {
      observables = [this.api.getRecordsCount()];
    }

    return combineLatest(observables, (...args: number[]) => args.reduce((sum, arg) => (sum += arg))).pipe(
      catchError(this.api.handleError)
    );
  }
}
