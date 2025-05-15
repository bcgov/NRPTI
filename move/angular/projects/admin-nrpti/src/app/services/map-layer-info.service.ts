import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MapLayerInfoService {
  constructor(
    public apiService: ApiService,
    public http: HttpClient
  ) {}

  /**
   * @param {string} application targeted application eg. 'LNG'
   * @param {*} mapInfo object payload of mapinfo data
   * @returns {Promise<any>}
   * @memberof MapLayerInfoService
   */
  public createMapLayerInfo(application: string, mapInfo: any): Promise<any> {
    if (!mapInfo) {
      throw Error('MapLayerInfoService - createMapLayerInfo - missing required mapInfo param');
    }

    if (!application) {
      throw Error('MapLayerInfoService - createMapLayerInfo - missing required application param');
    }

    const payload = {
      application: application,
      data: mapInfo
    };
    const queryString = 'map-info/';
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, payload, {}).toPromise();
  }

  /**
   * @param {*} mapInfo - mapinfo model object containing fields to update
   * @returns {Promise<any>}
   * @memberof MapLayerInfoService
   */
  public updateMapLayerInfo(mapInfo: any): Promise<any> {
    if (!mapInfo || !mapInfo._id) {
      throw Error('MapLayerInfoService - updateMapLayerInfo - missing required mapInfo param');
    }

    const queryString = `map-info/${mapInfo._id}`;
    return this.http.put<any>(`${this.apiService.pathAPI}/${queryString}`, mapInfo, {}).toPromise();
  }

  /**
   * @param {string} mapInfoId - objectId string of object to delete
   * @returns {Promise<any>}
   * @memberof MapLayerInfoService
   */
  public deleteMapLayerInfo(mapInfoId: string): Promise<any> {
    if (!mapInfoId) {
      throw Error('MapLayerInfoService - deleteMapLayerInfo - missing required mapInfo param');
    }

    const queryString = `map-info/${mapInfoId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }
}
