import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinesRecordsAddEditComponent } from './mines-records-add-edit.component';

describe('MinesRecordsAddEditComponent', () => {
  let component: MinesRecordsAddEditComponent;
  let fixture: ComponentFixture<MinesRecordsAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinesRecordsAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinesRecordsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
