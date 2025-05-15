import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentEditComponent } from './document-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { FormsModule } from '@angular/forms';

describe('DocumentEditComponent', () => {
  let component: DocumentEditComponent;
  let fixture: ComponentFixture<DocumentEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentEditComponent, FileUploadComponent],
      imports: [FormsModule, NgbModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
