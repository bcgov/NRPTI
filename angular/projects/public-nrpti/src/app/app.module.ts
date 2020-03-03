import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { HomeComponent } from './home/home.component';

// services
import { ApiService } from './services/api.service';
import { DocumentService } from './services/document.service';
import { FactoryService } from './services/factory.service';

@NgModule({
  declarations: [AppComponent, HomeComponent, ConfirmComponent, HeaderComponent, FooterComponent],
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
  providers: [ApiService, DocumentService, FactoryService],
  entryComponents: [ConfirmComponent, HomeComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
