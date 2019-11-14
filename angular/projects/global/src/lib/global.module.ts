import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// modules

// components
import { GlobalComponent } from './global.component';

// services
import { ExportService } from './services/export.service';
import { ButtonSpinnerComponent } from './buttons/button-spinner/button-spinner.component';

/**
 *
 *
 * @publicApi
 * @export
 * @class GlobalModule
 */
@NgModule({
  imports: [BrowserModule],
  declarations: [GlobalComponent, ButtonSpinnerComponent],
  providers: [ExportService],
  exports: [GlobalComponent, ButtonSpinnerComponent]
})
export class GlobalModule {}
