import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StoreService } from 'nrpti-angular-components';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent implements OnInit {
  public showSideContent = window.innerWidth > 768 ? true : false;
  public userClosedSideContent = false;

  constructor(private storeService: StoreService, private _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.storeService.stateChange.subscribe((state: object) => {
      if (state && state.hasOwnProperty('showSideContent')) {
        this.showSideContent = state['showSideContent'];
      }

      this._changeDetectionRef.detectChanges();
    });
  }

  toggleSideContent() {
    this.userClosedSideContent = this.showSideContent;
    this.showSideContent = !this.showSideContent;

    this.storeService.setItem({ showSideContent: this.showSideContent });
    this.storeService.setItem({ userClosedSideContent: this.userClosedSideContent });

    this._changeDetectionRef.detectChanges();
  }
}
