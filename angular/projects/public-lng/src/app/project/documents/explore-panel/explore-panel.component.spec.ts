import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePanelComponent } from './explore-panel.component';

describe('ExplorePanelComponent', () => {
  let component: ExplorePanelComponent;
  let fixture: ComponentFixture<ExplorePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExplorePanelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
