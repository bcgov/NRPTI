import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { FactoryService } from '../services/factory.service';

@Component({
  standalone: false,
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
export class HeaderComponent {
  isNavMenuOpen = false;
  welcomeMsg: string;

  isAuthenticated: boolean;
  environment: string;

  constructor(public factoryService: FactoryService, public router: Router) {
    router.events.subscribe(() => {
      this.isAuthenticated = this.factoryService.isAuthenticated();
      this.welcomeMsg = this.factoryService.getWelcomeMessage();
    });

    this.environment = this.factoryService.getEnvironment();
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }
}
