import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ImportCSVComponent } from './import-csv.component';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '../../../../../common/src/app/common.module';

describe('ImportCSVComponent', () => {
  const testBedHelper = new TestBedHelper<ImportCSVComponent>(ImportCSVComponent);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportCSVComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, CommonModule],
      providers: []
    }).compileComponents();
  }));

  it('should create', async(() => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  }));
});
