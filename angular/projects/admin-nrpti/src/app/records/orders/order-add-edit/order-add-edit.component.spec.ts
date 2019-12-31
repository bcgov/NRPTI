import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAddEditComponent } from './order-add-edit.component';

describe('OrderAddEditComponent', () => {
  let component: OrderAddEditComponent;
  let fixture: ComponentFixture<OrderAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrderAddEditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
