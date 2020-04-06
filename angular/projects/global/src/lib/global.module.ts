import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// modules
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// components
import { ButtonSpinnerComponent } from './components/buttons/button-spinner/button-spinner.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { PageSizePickerComponent } from './components/page-size-picker/page-size-picker.component';
import { PageCountDisplayComponent } from './components/page-count-display/page-count-display.component';
import { TableTemplateComponent } from './components/table-template/table-template.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';

// directives
import { TableRowDirective } from './components/table-template/table-row.directive';
import { AutoGrowTextAreaDirective } from './directives/auto-grow-textarea/auto-grow-textarea.directive';
import { DigitOnlyDirective } from './directives/digit-only/digit-only.directive';

// services
import { ExportService } from './services/export.service';
import { StoreService } from './services/store.service';
import { SearchService } from './services/search.service';
import { InjectComponentService } from './services/inject-component.service';

// utils
import { TableTemplateUtils } from './components/table-template/table-template-utils';
import { LoadingScreenService } from './services/loading-screen.service';

/**
 * Primary module for the library.
 *
 * @publicApi
 * @export
 * @class GlobalModule
 */
@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, NgbModule.forRoot(), NgxPaginationModule],
  declarations: [
    ButtonSpinnerComponent,
    TableRowDirective,
    TableTemplateComponent,
    BreadcrumbComponent,
    PageSizePickerComponent,
    PageCountDisplayComponent,
    DatePickerComponent,
    AutoGrowTextAreaDirective,
    DigitOnlyDirective
  ],
  providers: [
    ExportService,
    StoreService,
    SearchService,
    TableTemplateUtils,
    InjectComponentService,
    LoadingScreenService
  ],
  exports: [
    ButtonSpinnerComponent,
    TableRowDirective,
    TableTemplateComponent,
    BreadcrumbComponent,
    PageSizePickerComponent,
    PageCountDisplayComponent,
    DatePickerComponent,
    AutoGrowTextAreaDirective,
    DigitOnlyDirective
  ]
})
export class GlobalModule {}
