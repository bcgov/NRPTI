import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchResults } from '../models/search';

/**
 * Service to search against NRPTI API.
 *
 * @export
 * @class SearchService
 */
// @dynamic
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public isError = false;

  constructor(private http: HttpClient) {}

  getItem(pathAPI: string, _id: string, schema: string): Observable<SearchResults[]> {
    const queryString = `search?dataset=Item&_id=${_id}&_schemaName=${schema}`;
    return this.http.get<SearchResults[]>(`${pathAPI}/${queryString}`, {}).pipe(
      map(res => {
        const allResults = [] as any;
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          allResults.push(r);
        });
        if (allResults.length === 1) {
          return allResults[0];
        } else {
          return {};
        }
      })
    );
  }

  // getFullList(schema: string): Observable<any> {
  //   return this.api.getFullDataSet(schema);
  // }

  getSearchResults(
    pathAPI: string,
    keys: string,
    dataset: string,
    fields: any[],
    pageNum: number = 1,
    pageSize: number = 10,
    sortBy: string = null,
    queryModifier: object = {},
    populate: boolean = false,
    filter: object = {}
  ): Observable<any[]> {
    if (sortBy === '') {
      sortBy = null;
    }
    let queryString = `search?dataset=${dataset}`;
    if (fields && fields.length > 0) {
      fields.map(item => {
        queryString += `&${item.name}=${item.value}`;
      });
    }
    if (keys) {
      queryString += `&keywords=${keys}`;
    }
    if (pageNum !== null) {
      queryString += `&pageNum=${pageNum - 1}`;
    }
    if (pageSize !== null) {
      queryString += `&pageSize=${pageSize}`;
    }
    if (sortBy !== '' && sortBy !== null) {
      queryString += `&sortBy=${sortBy}`;
    }
    if (populate !== null) {
      queryString += `&populate=${populate}`;
    }
    if (queryModifier !== {}) {
      Object.keys(queryModifier).map(key => {
        queryModifier[key].split(',').map(item => {
          queryString += `&and[${key}]=${item}`;
        });
      });
    }
    if (filter !== {}) {
      Object.keys(filter).map(key => {
        filter[key].split(',').map(item => {
          queryString += `&or[${key}]=${item}`;
        });
      });
    }
    queryString += `&fields=${this.buildValues(fields)}`;
    return this.http.get<SearchResults[]>(`${pathAPI}/${queryString}`, {}).pipe(
      map(res => {
        const allResults = [] as any;
        res.forEach(item => {
          const r = new SearchResults({ type: item._schemaName, data: item });
          allResults.push(r);
        });
        return allResults;
      })
    );
  }

  private buildValues(collection: any[]): string {
    let values = '';
    collection.forEach(item => {
      values += item + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }
}
