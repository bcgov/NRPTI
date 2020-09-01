import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  constructor(public apiService: ApiService, public http: HttpClient) { }

  public deleteCollection(collectionId: string): Promise<any> {
    if (!collectionId) {
      throw Error('RecordService - deleteCollection - missing required collectionId param');
    }
    const queryString = `collection/${collectionId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
