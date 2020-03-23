import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import 'rxjs/add/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../../services/factory.service';

@Injectable()
export class InspectionResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const inspectionId = route.paramMap.get('inspectionId');
    return this.factoryService.getRecord(inspectionId, 'InspectionNRCED', true);
  }
}
