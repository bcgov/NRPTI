import { async, TestBed } from '@angular/core/testing';
import { MatSlideToggleModule } from '@angular/material';
import { MinesRecordDetailComponent } from './mines-records-detail.component';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils'
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalModule } from 'nrpti-angular-components';
import { DatePipe } from '@angular/common';
import { CommonModule } from '../../../../../common/src/app/common.module';

describe('MinesRecordDetailComponent', () => {
  const testBedHelper = new TestBedHelper<MinesRecordDetailComponent>(MinesRecordDetailComponent);


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, GlobalModule, CommonModule, MatSlideToggleModule],
      declarations: [MinesRecordDetailComponent],
      providers: [
        DatePipe,
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
