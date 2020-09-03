import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';

@Injectable()
export class CommunicationsResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const application = route.params && route.params.application ? route.params.application : 'BCMI';
    return this.factoryService.getCommunicationPackage(application);
  }
}
