import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MinesCollectionRecordTableRowComponent } from './mines-collection-detail-record-row.component';
import { TestBedHelper } from '../../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { GlobalModule } from 'nrpti-angular-components';

describe('MinesTableRowComponent', () => {
  const testBedHelper = new TestBedHelper<MinesCollectionRecordTableRowComponent>(
    MinesCollectionRecordTableRowComponent
  );

  // component constructor mocks
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, CommonModule, GlobalModule],
      declarations: [MinesCollectionRecordTableRowComponent],
      providers: [{ provide: Router, useValue: mockRouter }]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    component.rowData = {};

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
