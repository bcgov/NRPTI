import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentLinkStagingComponent } from './document-link-staging.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { FormsModule } from '@angular/forms';

describe('DocumentLinkStagingComponent', () => {
  let component: DocumentLinkStagingComponent;
  let fixture: ComponentFixture<DocumentLinkStagingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentLinkStagingComponent, FileUploadComponent],
      imports: [FormsModule, NgbModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLinkStagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
