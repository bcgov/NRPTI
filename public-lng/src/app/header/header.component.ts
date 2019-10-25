import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public project: string;
  constructor(public router: Router) {
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const r = /\/project\/(\d)\//;
        const match = r.exec(location.pathname) || [];
        this.project = (proj => {
          switch (proj) {
            case '1':
              return 'LNG Canada';
            case '2':
              return 'Coastal GasLink';
            default:
              return 'Projects';
          }
        })(match[1]);
      }
    });
  }
}
