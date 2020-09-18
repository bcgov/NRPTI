import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MinesCollectionRecordTableRowComponent } from './mines-collection-detail-record-row.component';
import { TestBedHelper } from '../../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '../../../../../../common/src/app/common.module';
import { GlobalModule } from 'nrpti-angular-components';

describe('MinesTableRowComponent', () => {
  const testBedHelper = new TestBedHelper<MinesCollectionRecordTableRowComponent>(
    MinesCollectionRecordTableRowComponent
  );

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, CommonModule, GlobalModule],
      declarations: [MinesCollectionRecordTableRowComponent],
      providers: []
    }).compileComponents();
  }));

  it('should create', () => {
    const { component, fixture } = testBedHelper.createComponent(false);

    component.rowData = {};

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
