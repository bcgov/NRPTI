import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';

import { ApplicationsComponent } from './applications.component';
import { AppMapComponent } from './app-map/app-map.component';

describe('ApplicationsComponent', () => {
  let component: ApplicationsComponent;
  let fixture: ComponentFixture<ApplicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationsComponent, AppMapComponent],
      imports: [NgbModule, FormsModule, RouterTestingModule],
      providers: [NgbTypeaheadConfig]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
