import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(public apiService: ApiService, public http: HttpClient) { }

  public createNews(news: any): Promise<any> {
    if (!news) {
      throw Error('NewsService - createNews - missing required news param');
    }

    const queryString = 'news/';
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, news, {}).toPromise();
  }

  public editNews(news: any): Promise<any> {
    if (!news) {
      throw Error('NewsService - createNews - missing required news param');
    }
    if (!news._id) {
      throw Error('NewsService - createNews - missing required newsId param');
    }

    const queryString = `news/${news._id}`;
    return this.http.put<any>(`${this.apiService.pathAPI}/${queryString}`, news, {}).toPromise();
  }

  public deleteNews(newsId: string): Promise<any> {
    if (!newsId) {
      throw Error('RecordService - deleteNews - missing required newsId param');
    }

    const queryString = `news/${newsId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
