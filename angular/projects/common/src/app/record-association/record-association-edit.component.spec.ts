import { TestBed } from '@angular/core/testing';
import { RecordAssociationEditComponent } from './record-association-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestBedHelper } from '../spec/spec-utils';
import { StoreService } from 'nrpti-angular-components';
import { EventEmitter } from '@angular/core';

describe('RecordAssociationEditComponent', () => {
  const testBedHelper = new TestBedHelper<RecordAssociationEditComponent>(RecordAssociationEditComponent);

  const mockStoreService = {
    getItem: () => { },
    stateChange: new EventEmitter()
  };

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [RecordAssociationEditComponent],
      imports: [FormsModule, ReactiveFormsModule, NgbModule.forRoot()],
      providers: [
        { provide: StoreService, useValue: mockStoreService }
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
