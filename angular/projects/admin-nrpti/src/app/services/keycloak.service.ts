import { Injectable } from '@angular/core';
import { ConfigService, LoggerService } from 'nrpti-angular-components';
import { JwtUtil } from '../utils/jwt-utils';
import { Observable } from 'rxjs';
import { Constants } from '../utils/constants/misc';

declare let Keycloak: any;

@Injectable()
export class KeycloakService {
  private keycloakAuth: any;
  private keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;
  private menus: {} = {};

  constructor(private configService: ConfigService, private logger: LoggerService) {}

  async init() {
    // Load up the config service data
    this.keycloakEnabled = this.configService.config['KEYCLOAK_ENABLED'];
    this.keycloakUrl = this.configService.config['KEYCLOAK_URL'];
    this.keycloakRealm = this.configService.config['KEYCLOAK_REALM'];

    if (this.keycloakEnabled) {
      // Bootup KC
      const keycloak_client_id = this.configService.config['KEYCLOAK_CLIENT_ID'];

      return new Promise<void>((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: !keycloak_client_id ? 'nrpti-4869' : keycloak_client_id
        };

        // console.log('KC Auth init.');

        this.keycloakAuth = new Keycloak(config);

        this.keycloakAuth.onAuthSuccess = () => {
          // console.log('onAuthSuccess');
          this.refreshMenuCache();
        };

        this.keycloakAuth.onAuthError = () => {
          // console.log('onAuthError');
        };

        this.keycloakAuth.onAuthRefreshSuccess = () => {
          // console.log('onAuthRefreshSuccess');
          this.refreshMenuCache();
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
              this.logger.log(`KC refreshed token?: ${refreshed}`);
              this.refreshMenuCache();
            })
            .error(err => {
              this.logger.log(`KC refresh error: ${err}`);
            });
        };

        // Initialize.
        this.keycloakAuth
          .init({
            pkceMethod: 'S256',
          })
          .success(auth => {
            // console.log('KC Refresh Success?:', this.keycloakAuth.authServerUrl);
            this.logger.log(`KC Success: ${auth}`);
            if (!auth) {
              this.keycloakAuth.login({ idpHint: 'idir' });
            } else {
              resolve();
            }
          })
          .error(err => {
            this.logger.log(`KC error: ${err}`);
            reject();
          });
      });
    }
  }

  refreshMenuCache() {
    const token = this.getToken();
    if (token) {
      const jwt = JwtUtil.decodeToken(token);
      const roles = (jwt && jwt.client_roles) || [];
      this.buildMenuCache(roles);
      this.buildAddRecordDropdownCache(roles);
    }
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

    if (!(jwt && jwt.client_roles)) {
      return false;
    }

    // Make sure they have at least one instance of including a role in the ROLE array
    return Object.keys(Constants.ApplicationRoles).some(role => {
      return jwt.client_roles.includes(Constants.ApplicationRoles[role]);
    });
  }

  buildMenuCache(roles) {
    // Build the menu cache
    this.menus[Constants.Menus.ALL_MINES] =
      roles.includes(Constants.ApplicationRoles.ADMIN) || roles.includes(Constants.ApplicationRoles.ADMIN_BCMI);

    this.menus[Constants.Menus.ALL_RECORDS] = true; // Everyone gets this.

    this.menus[Constants.Menus.NEWS_LIST] =
      roles.includes(Constants.ApplicationRoles.ADMIN) || roles.includes(Constants.ApplicationRoles.ADMIN_LNG);

    this.menus[Constants.Menus.ANALYTICS] = false; // Nobody gets this.

    this.menus[Constants.Menus.MAP] = false; // Nobody gets this.

    this.menus[Constants.Menus.ENTITIES] = false; // Nobody gets this.

    this.menus[Constants.Menus.IMPORTS] =
      roles.includes(Constants.ApplicationRoles.ADMIN) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_LNG) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_NRCED) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_BCMI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC);

    this.menus[Constants.Menus.COMMUNICATIONS] =
      roles.includes(Constants.ApplicationRoles.ADMIN) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_LNG) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_NRCED) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_BCMI);

    this.menus[Constants.Menus.UPDATE_ISSUING_AGENCY] =
      roles.includes(Constants.ApplicationRoles.ADMIN)
  }

  buildAddRecordDropdownCache(roles) {
    const recordTypes = Constants.RecordTypes;

    const inBaseAdminRole = role => {
      return (
        roles.includes(Constants.ApplicationRoles.ADMIN) ||
        roles.includes(Constants.ApplicationRoles.ADMIN_LNG) ||
        roles.includes(Constants.ApplicationRoles.ADMIN_NRCED) ||
        roles.includes(Constants.ApplicationRoles.ADMIN_BCMI)
      );
    };

    this.menus[recordTypes.ADMINISTRATIVE_PENALTY] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WF) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.ADMINISTRATIVE_SANCTION] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.AGREEMENT] = inBaseAdminRole(roles);

    this.menus[recordTypes.ANNUAL_REPORT] = inBaseAdminRole(roles);

    this.menus[recordTypes.CERTIFICATE] = inBaseAdminRole(roles);

    this.menus[recordTypes.CERTIFICATE_AMENDMENT] = inBaseAdminRole(roles);

    this.menus[recordTypes.CONSTRUCTION_PLAN] = inBaseAdminRole(roles);

    this.menus[recordTypes.COURT_CONVICTION] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.CORRESPONDENCE] = inBaseAdminRole(roles);

    this.menus[recordTypes.DAM_SAFETY_INSPECTION] = inBaseAdminRole(roles);

    this.menus[recordTypes.INSPECTION] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.MANAGEMENT_PLAN] = inBaseAdminRole(roles);

    this.menus[recordTypes.ORDER] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WF) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.PERMIT] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.RESTORATIVE_JUSTICE] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.REPORT] = inBaseAdminRole(roles);

    this.menus[recordTypes.COMPLIANCE_SELF_REPORT] = inBaseAdminRole(roles);

    this.menus[recordTypes.TICKET] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);

    this.menus[recordTypes.WARNING] =
      inBaseAdminRole(roles) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_AGRI) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_EPD) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_COS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ENV_BCPARKS) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_ALC) ||
      roles.includes(Constants.ApplicationRoles.ADMIN_WLRS);
  }

  isMenuEnabled(menuName) {
    return this.menus[menuName];
  }

  isRecordAddEditEnabled(recordAddName) {
    return this.menus[recordAddName];
  }

  /**
   * Returns the current keycloak auth token.
   *
   * @returns {string} keycloak auth token.
   * @memberof KeycloakService
   */
  getToken(): string {
    return this.keycloakAuth && this.keycloakAuth.token;
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
          this.logger.log(`KC refreshed token?: ${refreshed}`);
          observer.next();
          observer.complete();
        })
        .error(err => {
          this.logger.log(`KC refresh error: ${err}`);
          observer.error();
        });

      return { unsubscribe() {} };
    });
  }
}
