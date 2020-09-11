import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { Overlay, CloseScrollStrategy } from '@angular/cdk/overlay';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';

// modules
import { GlobalModule } from 'nrpti-angular-components';
import { CommonModule } from '../../../common/src/app/common.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { RecordsModule } from './records/records.module';
import { NewsModule } from './news/news.module';
import { MinesModule } from './mines/mines.module';
import { CommunicationsModule } from './communications/communications.module';

// components
import { AppComponent } from './app.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { HomeComponent } from './home/home.component';
import { ImportComponent } from './import/import.component';
import { ImportCSVComponent } from './import/import-csv/import-csv.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ImportTableRowsComponent } from './import/import-rows/import-table-rows.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';

// services
import { ApiService } from './services/api.service';
import { DocumentService } from './services/document.service';
import { FactoryService } from './services/factory.service';
import { KeycloakService } from './services/keycloak.service';
import { RecordService } from './services/record.service';
import { TaskService } from './services/task.service';
import { ConfigService , LoggerService } from 'nrpti-angular-components';
import { NewsService } from './services/news.service';

// resolvers
import { ImportListResolver } from './import/import-list-resolver';
import { NewsResolver } from './news/news-resolver';
import { NewsListResolver } from './news/news-list.resolver';
import { CommunicationsResolver } from './communications/communications.resolver';

// guards
import { CanActivateGuard } from './guards/can-activate-guard.service';
import { CanDeactivateGuard } from './guards/can-deactivate-guard.service';

// utils
import { TokenInterceptor } from './utils/token-interceptor';
import { RecordUtils } from './records/utils/record-utils';
import { CollectionService } from './services/collection.service';


export function initConfig(configService: ConfigService) {
  return () => configService.init();
}

export function keycloakFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

export function overlayScrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ImportComponent,
    ImportCSVComponent,
    ToggleButtonComponent,
    ConfirmComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NotAuthorizedComponent,
    ImportTableRowsComponent
  ],
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
    NewsModule,
    MinesModule,
    CommunicationsModule,
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
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: keycloakFactory,
      deps: [KeycloakService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
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
    FactoryService,
    RecordService,
    NewsService,
    CollectionService,
    LoggerService,
    TaskService,
    ImportListResolver,
    NewsResolver,
    NewsListResolver,
    CommunicationsResolver,
    CanActivateGuard,
    CanDeactivateGuard,
    RecordUtils,
  ],
  entryComponents: [ConfirmComponent, HomeComponent, ImportComponent, ImportTableRowsComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
