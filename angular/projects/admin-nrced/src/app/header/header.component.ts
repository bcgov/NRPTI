import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';
import { JwtUtil } from '../utils/jwt-utils';
import { KeycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('toggleNav', [
      state('navClosed', style({ height: '0' })),
      state('navOpen', style({ height: '*' })),
      transition('navOpen => navClosed', [animate('0.2s')]),
      transition('navClosed => navOpen', [animate('0.2s')])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  isNavMenuOpen = false;
  welcomeMsg: string;
  // private _api: ApiService;
  public jwt: {
    username: string;
    realm_access: {
      roles: string[];
    };
    scopes: string[];
  };

  constructor(public api: ApiService, private keycloakService: KeycloakService, public router: Router) {
    // this._api = api;
    router.events.subscribe(() => {
      const token = this.keycloakService.getToken();
      // TODO: Change this to observe the change in the _api.token
      if (token) {
        const jwt = JwtUtil.decodeToken(token);
        this.welcomeMsg = jwt ? 'Hello ' + jwt.displayName : 'Login';
        this.jwt = jwt;
      } else {
        this.welcomeMsg = 'Login';
        this.jwt = null;
      }
    });
  }

  ngOnInit() {
    // Make sure they have the right role.
    if (!this.keycloakService.isValidForSite()) {
      this.router.navigate(['/not-authorized']);
    }
  }

  renderMenu(route: string) {
    // Sysadmin's get administration.
    if (route === 'administration') {
      return (
        this.jwt &&
        this.jwt.realm_access &&
        this.jwt.realm_access.roles.find(x => x === 'sysadmin') &&
        this.jwt.username === 'admin'
      );
    }
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }
}
