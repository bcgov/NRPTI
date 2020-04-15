import { async, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material';
import { TestBedHelper } from '../../spec/spec-utils';
import { EntityAddEditComponent } from './entity-add-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('EntityAddEditComponent', () => {
  const testBedHelper = new TestBedHelper<EntityAddEditComponent>(EntityAddEditComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSlideToggleModule, NgbModule.forRoot()],
      declarations: [EntityAddEditComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    component.formGroup = new FormGroup({
      type: new FormControl({}),
      companyName: new FormControl({}),
      firstName: new FormControl({}),
      middleName: new FormControl({}),
      lastName: new FormControl({}),
      fullName: new FormControl({}),
      dateOfBirth: new FormControl({}),
      forceAnonymous: new FormControl({})
    });

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
