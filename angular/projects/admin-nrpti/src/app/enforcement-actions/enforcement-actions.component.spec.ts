import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnforcementActionsComponent } from './enforcement-actions.component';

describe('EnforcementActionsComponent', () => {
  let component: EnforcementActionsComponent;
  let fixture: ComponentFixture<EnforcementActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnforcementActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnforcementActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
