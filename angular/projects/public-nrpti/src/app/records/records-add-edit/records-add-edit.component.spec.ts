import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsAddEditComponent } from './records-add-edit.component';

describe('RecordsAddEditComponent', () => {
  let component: RecordsAddEditComponent;
  let fixture: ComponentFixture<RecordsAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsAddEditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
