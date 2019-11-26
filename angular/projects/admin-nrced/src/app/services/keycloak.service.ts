import { Injectable } from '@angular/core';
import { JwtUtil } from '../utils/jwt-utils';
import { Observable } from 'rxjs';

declare let Keycloak: any;

@Injectable()
export class KeycloakService {
  private keycloakAuth: any;
  private keycloakUrl: string;
  private keycloakRealm: string;

  constructor() {
    switch (window.location.origin) {
      case 'http://localhost:4200':
      case 'https://admin-nrced-dev.pathfinder.gov.bc.ca':
        // Local, Dev, Master
        this.keycloakUrl = 'https://sso-dev.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = '3l5nw6dk';
        break;
      case 'https://admin-nrced-test.pathfinder.gov.bc.ca':
        // Test
        this.keycloakUrl = 'https://sso-test.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = '3l5nw6dk';
        break;
      default:
        // Prod
        this.keycloakUrl = 'https://sso.pathfinder.gov.bc.ca/auth';
        this.keycloakRealm = '3l5nw6dk';
    }
  }

  init(): Promise<any> {
    // Bootup KC
    return new Promise((resolve, reject) => {
      const config = {
        url: this.keycloakUrl,
        realm: this.keycloakRealm,
        clientId: 'nrpti-admin'
      };

      // console.log('KC Auth init.');

      this.keycloakAuth = new Keycloak(config);

      this.keycloakAuth.onAuthSuccess = () => {
        // console.log('onAuthSuccess');
      };

      this.keycloakAuth.onAuthError = () => {
        // console.log('onAuthError');
      };

      this.keycloakAuth.onAuthRefreshSuccess = () => {
        // console.log('onAuthRefreshSuccess');
      };

      this.keycloakAuth.onAuthRefreshError = () => {
        // console.log('onAuthRefreshError');
      };

      this.keycloakAuth.onAuthLogout = () => {
        // console.log('onAuthLogout');
      };

      // Try to get refresh tokens in the background
      this.keycloakAuth.onTokenExpired = () => {
        this.keycloakAuth
          .updateToken()
          .success(refreshed => {
            console.log('KC refreshed token?:', refreshed);
          })
          .error(err => {
            console.log('KC refresh error:', err);
          });
      };

      // Initialize.
      this.keycloakAuth
        .init({})
        .success(auth => {
          // console.log('KC Refresh Success?:', this.keycloakAuth.authServerUrl);
          console.log('KC Success:', auth);
          if (!auth) {
            this.keycloakAuth.login({ idpHint: 'idir' });
          } else {
            resolve();
          }
        })
        .error(err => {
          console.log('KC error:', err);
          reject();
        });
    });
  }

  /**
   * Check if the current user is logged in and has admin access.
   *
   * @returns {boolean} true if the user has access, false otherwise.
   * @memberof KeycloakService
   */
  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const jwt = JwtUtil.decodeToken(token);

    if (!(jwt && jwt.realm_access && jwt.realm_access.roles)) {
      return false;
    }

    return jwt.realm_access.roles.includes('sysadmin');
  }

  /**
   * Returns the current keycloak auth token.
   *
   * @returns {string} keycloak auth token.
   * @memberof KeycloakService
   */
  getToken(): string {
    return this.keycloakAuth.token;
  }

  /**
   * Returns an observable that emits when the auth token has been refreshed.
   * Call {@link KeycloakService#getToken} to fetch the updated token.
   *
   * @returns {Observable<string>}
   * @memberof KeycloakService
   */
  refreshToken(): Observable<any> {
    return new Observable(observer => {
      this.keycloakAuth
        .updateToken(30)
        .success(refreshed => {
          console.log('KC refreshed token?:', refreshed);
          observer.next();
          observer.complete();
        })
        .error(err => {
          console.log('KC refresh error:', err);
          observer.error();
        });

      return { unsubscribe() {} };
    });
  }
}
