import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
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
import { HomeComponent } from 'app/home/home.component';
import { ImportComponent } from 'app/import/import.component';

// services
import { ApiService } from './services/api.service';
import { RecordService } from './services/record.service';
import { DocumentService } from './services/document.service';
import { FactoryService } from './services/factory.service';
import { KeycloakService } from './services/keycloak.service';

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
    ConfirmComponent,
    HeaderComponent,
    FooterComponent,
    NotAuthorizedComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
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
    RecordService,
    DocumentService,
    FactoryService,
    CanActivateGuard,
    CanDeactivateGuard
  ],
  entryComponents: [ConfirmComponent, HomeComponent, ImportComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
