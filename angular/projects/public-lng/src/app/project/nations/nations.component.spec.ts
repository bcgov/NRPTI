import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NationsComponent } from './nations.component';

describe('NationsComponent', () => {
  let component: NationsComponent;
  let fixture: ComponentFixture<NationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NationsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
