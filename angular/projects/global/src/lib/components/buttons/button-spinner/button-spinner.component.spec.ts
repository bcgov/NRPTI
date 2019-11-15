import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSpinnerComponent } from './button-spinner.component';

describe('ButtonSpinnerComponent', () => {
  let component: ButtonSpinnerComponent;
  let fixture: ComponentFixture<ButtonSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonSpinnerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
