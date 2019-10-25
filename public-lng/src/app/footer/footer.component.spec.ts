import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'app/services/api';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  const apiServiceStub = {
    adminUrl: 'http://localhost:4000/admin/'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: ApiService, useValue: apiServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it renders a link to the admin page using the api service admin url', () => {
    const compiled = fixture.debugElement.nativeElement;
    const adminLink = compiled.querySelector('a.gtm-admin-login');
    expect(adminLink.textContent).toContain('Admin Login');
    expect(adminLink.getAttribute('href')).toEqual('http://localhost:4000/admin/');
  });
});
