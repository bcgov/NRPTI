import { Component } from '@angular/core';
import { StoreService } from 'nrpti-angular-components';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent {
  public loading = true;

  constructor(private storeService: StoreService) {}

  toggleSideNav() {
    this.storeService.toggleSideNav();
  }
}
