import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CommonComponent } from './common.component';

@NgModule({
  declarations: [CommonComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [CommonComponent]
})
export class CommonModule {}
