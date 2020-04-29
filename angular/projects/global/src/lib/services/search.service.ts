import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchResults } from '../models/search';
import { Utils } from '../utils/utils';

/**
 * Service to search against NRPTI API.
 *
 * @export
 * @class SearchService
 */
// @dynamic
@Injectable()
export class SearchService {
  constructor(private http: HttpClient) { }

  /**
   * Fetches a record based on its _id.  May return multiple items.
   *
   * @param {string} pathAPI
   * @param {string} _id
   * @param {string} schema
   * @returns {Observable<SearchResults[]>} Array of items
   * @memberof SearchService
   */
  getItem(pathAPI: string, _id: string, schema: string, populate?: boolean): Observable<SearchResults[]> {
    let queryString = `search?dataset=Item&_id=${_id}&_schemaName=${schema}`;
    populate && (queryString += `&populate=${populate}`);
    return this.http.get<SearchResults[]>(`${pathAPI}/${queryString}`, {}).pipe(
      map(res => {
        if (!res || !res.length) {
          return [] as SearchResults[];
        }

        return res.map(item => new SearchResults({ _schemaName: item._schemaName, data: item }));
      })
    );
  }

  getSearchResults(
    pathAPI: string,
    keys: string,
    dataset: string[],
    fields: any[],
    pageNum: number = 1,
    pageSize: number = 10,
    sortBy: string = null,
    queryModifier: object = {},
    populate: boolean = false,
    filter: object = {},
    subset: string[] = [],
  ): Observable<SearchResults[]> {
    let queryString = `search?dataset=${dataset}`;
    if (fields && fields.length > 0) {
      fields.map(item => {
        queryString += `&${item.name}=${item.value}`;
      });
    }
    if (keys) {
      queryString += `&keywords=${keys}`;
      // Subset does not apply if there are no keywords
      if (subset) {
        queryString += `&subset=${subset}`;
      }
    }
    if (pageNum && pageNum > 0) {
      queryString += `&pageNum=${pageNum - 1}`;
    }
    if (pageSize && pageSize > 0) {
      queryString += `&pageSize=${pageSize}`;
    }
    if (sortBy) {
      queryString += `&sortBy=${sortBy}`;
    }
    if (populate) {
      queryString += `&populate=${populate}`;
    }
    if (queryModifier && queryModifier !== {}) {
      Object.keys(queryModifier).map(key => {
        queryModifier[key].split(',').map(item => {
          queryString += `&and[${key}]=${item}`;
        });
      });
    }
    if (filter && filter !== {}) {
      Object.keys(filter).map(key => {
        filter[key].split(',').map(item => {
          queryString += `&or[${key}]=${item}`;
        });
      });
    }
    if (fields) {
      queryString += `&fields=${Utils.convertArrayIntoPipeString(fields)}`;
    }

    return this.http.get<SearchResults[]>(`${pathAPI}/${queryString}`, {}).pipe(
      map(res => {
        if (!res || !res.length) {
          return [] as SearchResults[];
        }

        return res.map(item => new SearchResults({ type: item._schemaName, data: item }));
      })
    );
  }
}
