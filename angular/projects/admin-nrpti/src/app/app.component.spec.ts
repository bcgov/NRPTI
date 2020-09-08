import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ApiService } from './services/api.service';
import { KeycloakService } from './services/keycloak.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import {
  ConfigService,
  StoreService,
  GlobalModule,
  LoadingScreenService
} from 'nrpti-angular-components';
import { EventEmitter } from 'events';

describe('AppComponent', () => {
  beforeEach((() => {
    const mockKeycloakService = {
      isValidForSite: () => {
        return true;
      }
    };

    const mockStoreService = {
      getItem: () => { },
      stateChange: new EventEmitter()
    };

    const mockLoadingScreenService = {
      setLoadingState: () => { }
    };

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        SidebarComponent,
        ToggleButtonComponent
      ],
      imports: [GlobalModule, RouterTestingModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        ConfigService,
        ApiService,
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: KeycloakService, useValue: mockKeycloakService },
        { provide: StoreService, useValue: mockStoreService }
      ]
    }).compileComponents();
  }));

  it('should create the app', (() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
