import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class CourtConvictionResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const courtConvictionId = route.paramMap.get('courtConvictionId');
    return this.factoryService.getRecord(courtConvictionId, 'CourtConvictionNRCED');
  }
}
