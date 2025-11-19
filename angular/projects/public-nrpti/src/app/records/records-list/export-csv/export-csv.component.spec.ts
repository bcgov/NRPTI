import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCsvComponent } from './export-csv.component';

// TODO: Skipping Test: Resolve in new ticket #1402
xdescribe('ExportCsvComponent', () => {
  let component: ExportCsvComponent;
  let fixture: ComponentFixture<ExportCsvComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExportCsvComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
