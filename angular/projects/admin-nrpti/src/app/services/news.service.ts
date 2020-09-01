import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  public deleteNews(newsId: string): Promise<any> {
    if (!newsId) {
      throw Error('RecordService - deleteNews - missing required newsId param');
    }

    const queryString = `news/${newsId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
