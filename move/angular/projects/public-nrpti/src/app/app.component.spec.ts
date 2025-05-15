import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ApiService } from './services/api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService, BreadcrumbComponent, StoreService, LoadingScreenService } from 'nrpti-angular-components';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(() => {
    const mockStoreService = {
      change: of(),
      toggleSideNave: () => {}
    };

    const mockLoadingScreenService = {
      setLoadingState: () => {}
    };

    TestBed.configureTestingModule({
      declarations: [AppComponent, HeaderComponent, FooterComponent, BreadcrumbComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        ConfigService,
        ApiService,
        { provide: StoreService, useValue: mockStoreService },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService }
      ]
    }).compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
