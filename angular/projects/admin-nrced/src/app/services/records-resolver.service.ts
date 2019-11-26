import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Record } from '../models/record';
import { FactoryService } from './factory.service';

@Injectable({ providedIn: 'root' })
export class RecordsResolverService implements Resolve<Record> {
  constructor(public factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Record> {
    return this.factoryService.getRecord(route.paramMap.get('id'));
  }
}
