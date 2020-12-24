import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MineService {
  constructor(public apiService: ApiService, public http: HttpClient) { }

  public createMine(mine: any): Promise<any> {
    if (!mine) {
      throw Error('MineService - createMine - missing required mine param');
    }

    const queryString = 'mine/';
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, mine, {}).toPromise();
  }

  public editMine(mine: any): Promise<any> {
    if (!mine || !mine._id) {
      throw Error('MineService - createMine - missing required mine param');
    }

    const queryString = `mine/${mine._id}`;
    return this.http.put<any>(`${this.apiService.pathAPI}/${queryString}`, mine, {}).toPromise();
  }

  public deleteMine(mineId: string): Promise<any> {
    if (!mineId) {
      throw Error('MineService - deleteMine - missing required mineId param');
    }

    const queryString = `mine/${mineId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }

  public publishMine(mineId: any): Promise<any> {
    if (!mineId) {
      throw Error('MineService - publishMine - missing required mineId param');
    }
    const queryString = `mine/${mineId}/publish`;
    return this.http.put<any>(`${this.apiService.pathAPI}/${queryString}`, null, {}).toPromise();
  }
  public unPublishMine(mineId: any): Promise<any> {
    if (!mineId) {
      throw Error('MineService - unPublishMine - missing required mineId param');
    }
    const queryString = `mine/${mineId}/unpublish`;
    return this.http.put<any>(`${this.apiService.pathAPI}/${queryString}`, null, {}).toPromise();
  }
}
