import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkAddEditComponent } from './link-add-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

describe('LinkAddEditComponent', () => {
  let component: LinkAddEditComponent;
  let fixture: ComponentFixture<LinkAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LinkAddEditComponent],
      imports: [FormsModule, NgbModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
