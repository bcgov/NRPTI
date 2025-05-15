import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '../shared.module';

// Components
import { ApplicationsComponent } from './applications.component';
import { AppMapComponent } from './app-map/app-map.component';
import { MarkerPopupComponent } from './app-map/marker-popup/marker-popup.component';

@NgModule({
  imports: [CommonModule, FormsModule, NgbModule, RouterModule, SharedModule],
  declarations: [ApplicationsComponent, AppMapComponent, MarkerPopupComponent]
})
export class ApplicationsModule {}
