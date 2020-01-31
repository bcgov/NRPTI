import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ApiService } from './services/api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbComponent, StoreService } from 'nrpti-angular-components';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async(() => {
    const mockStoreService = {
      change: of(),
      toggleSideNave: () => {}
    };

    TestBed.configureTestingModule({
      declarations: [AppComponent, HeaderComponent, FooterComponent, BreadcrumbComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [ApiService, { provide: StoreService, useValue: mockStoreService }]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should render title in a span tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('span.navbar-brand__title').textContent).toContain(
      'Natural Resources Compliance & Enforcement Database'
    );
  }));
});
