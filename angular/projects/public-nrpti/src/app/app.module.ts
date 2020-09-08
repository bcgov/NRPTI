import { NgModule, ApplicationRef, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { Overlay, CloseScrollStrategy } from '@angular/cdk/overlay';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../common/src/app/common.module';
import { SharedModule } from './shared.module';
import { AppRoutingModule } from './app-routing.module';
import { RecordsModule } from './records/records.module';

// components
import { AppComponent } from './app.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';

// services
import { ApiService } from './services/api.service';
import { DocumentService } from './services/document.service';
import { FactoryService } from './services/factory.service';
import { ConfigService } from 'nrpti-angular-components';

export function overlayScrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}

export function initConfig(configService: ConfigService) {
  return () => configService.init();
}

@NgModule({
  declarations: [AppComponent, HomeComponent, ConfirmComponent, HeaderComponent, FooterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ScrollingModule,
    GlobalModule,
    CommonModule,
    SharedModule,
    RecordsModule,
    AppRoutingModule, // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    NgbModule.forRoot(),
    NgxPaginationModule,
    BootstrapModalModule.forRoot({ container: document.body })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ConfigService],
      multi: true
    },
    {
      // Tells mat-autocomplete select box to close when the page is scrolled. Aligns with default select box behaviour.
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: overlayScrollFactory,
      deps: [Overlay]
    },
    ApiService,
    DocumentService,
    FactoryService
  ],
  entryComponents: [ConfirmComponent, HomeComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
