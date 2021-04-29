import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativePenaltyDetailComponent } from './administrative-penalty-detail.component';

describe('AdministrativePenaltyDetailComponent', () => {
  let component: AdministrativePenaltyDetailComponent;
  let fixture: ComponentFixture<AdministrativePenaltyDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrativePenaltyDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativePenaltyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
