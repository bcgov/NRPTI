import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ApiService } from './api.service';
import { Document } from '../models/document';

/**
 * Provides methods for retrieving and working with documents.
 *
 * @export
 * @class DocumentService
 */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(public api: ApiService) {}

  /**
   * Return all documents that match the provided filters.
   *
   * @param {IRecordQueryParamSet[]} queryParamSet array of query parameter sets.
   * @returns {Observable<Document[]>} total results from all query param sets. Not guaranteed to be unique.
   * @memberof DocumentService
   */
  public getAll(/* queryParamSets: IDocumentQueryParamSet[] */): Observable<Document[]> {
    return of([] as Document[]);
  }

  /**
   * Get a count of all documents that match the provided filters.
   *
   * @param {IRecordQueryParamSet[]} queryParamSet array of query parameter sets.
   * @returns {Observable<number>} total results from all query param sets. Not guaranteed to be unique.
   * @memberof DocumentService
   */
  public getCount(/* queryParamSets: IDocumentQueryParamSet[] */): Observable<number> {
    return of(0);
  }
}
