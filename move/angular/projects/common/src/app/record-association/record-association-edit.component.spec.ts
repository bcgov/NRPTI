import { TestBed } from '@angular/core/testing';
import { RecordAssociationEditComponent } from './record-association-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestBedHelper } from '../spec/spec-utils';
import { StoreService, Utils } from 'nrpti-angular-components';
import { EventEmitter } from '@angular/core';

describe('RecordAssociationEditComponent', () => {
  const testBedHelper = new TestBedHelper<RecordAssociationEditComponent>(RecordAssociationEditComponent);

  const mockStoreService = {
    getItem: () => {},
    stateChange: new EventEmitter()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecordAssociationEditComponent],
      imports: [FormsModule, ReactiveFormsModule, NgbModule],
      providers: [Utils, { provide: StoreService, useValue: mockStoreService }]
    }).compileComponents();
  });

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    const _epicProjectId = new FormControl({});
    const mineGuid = new FormControl({});
    const unlistedMine = new FormControl({});
    const unlistedMineType = new FormControl({});

    mineGuid.setValue(null);
    unlistedMineType.setValue('');

    component.formGroup = new FormGroup({ _epicProjectId, mineGuid, unlistedMine, unlistedMineType });
    component.mines = [];

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
