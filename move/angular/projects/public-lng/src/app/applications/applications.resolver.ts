import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { MapLayerInfoService } from '../services/map-layer-info.service';
import { ApiService } from '../services/api';

@Injectable()
export class MapLayerInfoResolver implements Resolve<void> {
  constructor(
    private apiService: ApiService,
    private mapLayerInfoService: MapLayerInfoService
  ) {}
  async resolve() {
    await this.mapLayerInfoService.fetchData(this.apiService.apiPath, '', ['MapLayerInfo'], [], 1, 100, '-dateAdded');
  }
}
