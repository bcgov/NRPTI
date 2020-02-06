import { Component, OnInit } from '@angular/core';
import { StoreService } from 'nrpti-angular-components';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent implements OnInit {
  isOpen = true;

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.storeService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  toggleSideNav() {
    this.storeService.toggleSideNav();
  }
}
