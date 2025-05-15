import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { FactoryService } from '../services/factory.service';

/**
 * Guards routes against unauthenticated access.
 *
 * Note: To use this guard, apply to all applicable routes all ...routing.module.ts files.
 *
 * See: https://angular.io/api/router/CanActivate
 *
 * @export
 * @class CanActivateGuard
 * @implements {CanActivate}
 */
@Injectable()
export class CanActivateGuard implements CanActivate {
  constructor(
    public factoryService: FactoryService,
    public router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.factoryService.isAuthenticated()) {
      this.router.navigate(['/not-authorized']);
      return false;
    }

    return true;
  }
}
