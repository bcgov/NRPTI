import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  constructor(
    public apiService: ApiService,
    public http: HttpClient
  ) {}

  public createCollection(collection: any): Promise<any> {
    if (!collection) {
      throw Error('CollectionService - createCollection - missing required collection param');
    }

    const queryString = 'collection/';
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, collection, {}).toPromise();
  }

  public editCollection(collection: any): Promise<any> {
    if (!collection) {
      throw Error('CollectionService - createCollection - missing required collection param');
    }
    if (!collection._id) {
      throw Error('CollectionService - createCollection - missing required collectionId param');
    }

    const queryString = `collection/${collection._id}`;
    return this.http.put<any>(`${this.apiService.pathAPI}/${queryString}`, collection, {}).toPromise();
  }

  public deleteCollection(collectionId: string): Promise<any> {
    if (!collectionId) {
      throw Error('RecordService - deleteCollection - missing required collectionId param');
    }
    const queryString = `collection/${collectionId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
