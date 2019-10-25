import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { MarkerPopupComponent } from './marker-popup.component';
import { Application } from 'app/models/application';

describe('MarkerPopupComponent', () => {
  let component: MarkerPopupComponent;
  let fixture: ComponentFixture<MarkerPopupComponent>;
  const application = new Application({ _id: 'BBBB', appStatus: 'Application Under Review' });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarkerPopupComponent],
      imports: [NgxTextOverflowClampModule, RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkerPopupComponent);
    component = fixture.componentInstance;
    component.app = application;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
