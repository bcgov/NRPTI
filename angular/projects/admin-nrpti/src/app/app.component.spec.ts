import { TestBed, async } from '@angular/core/testing';
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
import { BreadcrumbComponent, StoreService } from 'nrpti-angular-components';
import { of } from 'rxjs';
import { LoadingScreenService } from 'nrpti-angular-components';

describe('AppComponent', () => {
  beforeEach(async(() => {
    const mockKeycloakService = {
      isValidForSite: () => {
        return true;
      }
    };

    const mockStoreService = {
      stateChange: of(),
      toggleSideNave: () => {}
    };

    const mockLoadingScreenService = {
      isLoading: false,
      setLoadingState: () => {
      return false;
    }
    };

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        SidebarComponent,
        ToggleButtonComponent,
        BreadcrumbComponent
      ],
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        ApiService,
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: KeycloakService, useValue: mockKeycloakService },
        { provide: StoreService, useValue: mockStoreService }
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
