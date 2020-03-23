import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';

@Injectable()
export class TicketResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const ticketId = route.paramMap.get('ticketId');
    return this.factoryService.getRecord(ticketId, 'TicketNRCED', true);
  }
}
