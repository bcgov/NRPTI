import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';

// modules
import { SharedModule } from './shared.module';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '../../../common/src/app/common.module';
import { GlobalModule } from 'nrpti-angular-components';

// components
import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

// services
import { ApiService } from './services/api';
import { AuthenticationService } from './services/authentication.service';
import { RecordService } from './services/record.service';
import { DocumentService } from './services/document.service';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { KeycloakService } from './services/keycloak.service';
import { ExportService } from './services/export.service';

// feature modules
import { TokenInterceptor } from './utils/token-interceptor';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';

export function kcFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    ConfirmComponent,
    HeaderComponent,
    FooterComponent,
    NotAuthorizedComponent,
    ListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    CommonModule,
    GlobalModule,
    AppRoutingModule, // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    NgbModule.forRoot(),
    NgxPaginationModule,
    BootstrapModalModule.forRoot({ container: document.body })
  ],
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: kcFactory,
      deps: [KeycloakService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    ApiService,
    AuthenticationService,
    RecordService,
    DocumentService,
    CanDeactivateGuard,
    ExportService
  ],
  entryComponents: [ConfirmComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
