import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// modules
import { GlobalModule } from 'nrpti-angular-components';

// components
import { CommonComponent } from './common.component';

// services

@NgModule({
  declarations: [CommonComponent],
  imports: [BrowserModule, GlobalModule],
  providers: [],
  exports: [CommonComponent]
})
export class CommonModule {}
