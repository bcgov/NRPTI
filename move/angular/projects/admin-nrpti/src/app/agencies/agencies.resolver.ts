import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AgenciesResolver implements Resolve<Observable<object>> {
  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    return null;
  }
}
