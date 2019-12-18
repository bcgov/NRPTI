import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// modules
import { NgxPaginationModule } from 'ngx-pagination';

// components
import { ButtonSpinnerComponent } from './components/buttons/button-spinner/button-spinner.component';
import { TableTemplateComponent } from './components/table-template/table-template.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { PageSizePickerComponent } from './components/page-size-picker/page-size-picker.component';
import { PageCountDisplayComponent } from './components/page-count-display/page-count-display.component';

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
  declarations: [
    ButtonSpinnerComponent,
    TableDirective,
    TableTemplateComponent,
    BreadcrumbComponent,
    PageSizePickerComponent,
    PageCountDisplayComponent
  ],
  providers: [ExportService, StoreService, SearchService, TableTemplateUtils],
  exports: [
    ButtonSpinnerComponent,
    TableTemplateComponent,
    BreadcrumbComponent,
    PageSizePickerComponent,
    PageCountDisplayComponent
  ]
})
export class GlobalModule {}
