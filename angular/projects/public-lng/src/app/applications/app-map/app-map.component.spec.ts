import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMapComponent } from './app-map.component';

describe('AppMapComponent', () => {
  let component: AppMapComponent;
  let fixture: ComponentFixture<AppMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppMapComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
