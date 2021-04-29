import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinesAdministrativePenaltyAddEditComponent } from './mines-administrative-penalty-add-edit.component';

describe('MinesAdministrativePenaltyAddEditComponent', () => {
  let component: MinesAdministrativePenaltyAddEditComponent;
  let fixture: ComponentFixture<MinesAdministrativePenaltyAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinesAdministrativePenaltyAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinesAdministrativePenaltyAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
