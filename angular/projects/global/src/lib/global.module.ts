import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// modules
import { NgxPaginationModule } from 'ngx-pagination';

// components
import { GlobalComponent } from './global.component';
import { ButtonSpinnerComponent } from './components/buttons/button-spinner/button-spinner.component';
import { TableTemplateComponent } from './components/table-template/table-template.component';

// directives
import { TableDirective } from './components/table-template/table.directive';

// services
import { ExportService } from './services/export.service';
import { StoreService } from './services/store.service';
import { SearchService } from './services/search.service';

// utils
import { TableTemplateUtils } from './components/table-template/table-template-utils';

/**
 * Primary module for the library.
 *
 * @publicApi
 * @export
 * @class GlobalModule
 */
@NgModule({
  imports: [BrowserModule, NgxPaginationModule],
  declarations: [GlobalComponent, ButtonSpinnerComponent, TableDirective, TableTemplateComponent],
  providers: [ExportService, StoreService, SearchService, TableTemplateUtils],
  exports: [GlobalComponent, ButtonSpinnerComponent, TableTemplateComponent]
})
export class GlobalModule {}
