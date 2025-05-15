import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class LngMapInfoResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(): Observable<object> {
    return this.factoryService.getRecords('', ['MapLayerInfo'], [], 1, 10, '-dateAdded', {}, false, {}, [], {});
  }
}
