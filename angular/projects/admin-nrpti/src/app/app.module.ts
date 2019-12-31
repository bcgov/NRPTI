import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';

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
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { HomeComponent } from './home/home.component';
import { ImportComponent } from './import/import.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ImportTableRowsComponent } from './import/import-rows/import-table-rows.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';

// services
import { ApiService } from './services/api.service';
import { DocumentService } from './services/document.service';
import { FactoryService } from './services/factory.service';
import { KeycloakService } from './services/keycloak.service';

// resolvers
import { ImportListResolver } from './import/import-list-resolver';

// guards
import { CanActivateGuard } from './guards/can-activate-guard.service';
import { CanDeactivateGuard } from './guards/can-deactivate-guard.service';

// utils
import { TokenInterceptor } from './utils/token-interceptor';

export function keycloakFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ImportComponent,
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
    ApiService,
    DocumentService,
    FactoryService,
    ImportListResolver,
    CanActivateGuard,
    CanDeactivateGuard
  ],
  entryComponents: [ConfirmComponent, HomeComponent, ImportComponent, ImportTableRowsComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
