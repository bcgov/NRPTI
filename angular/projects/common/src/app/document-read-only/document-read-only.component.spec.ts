import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentReadOnlyComponent } from './document-read-only.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

describe('DocumentEditComponent', () => {
  let component: DocumentReadOnlyComponent;
  let fixture: ComponentFixture<DocumentReadOnlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentReadOnlyComponent],
      imports: [FormsModule, NgbModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentReadOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
