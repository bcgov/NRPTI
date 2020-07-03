import { async, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { MinesContentComponent } from './mines-content.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { CommonModule as NrptiCommonModule } from '../../../../../common/src/app/common.module';
import { GlobalModule, LoadingScreenService } from 'nrpti-angular-components';
import { CommonModule } from '@angular/common';

describe('MinesContentComponent', () => {
  const testBedHelper = new TestBedHelper<MinesContentComponent>(MinesContentComponent);

  // component constructor mocks
  const mockActivatedRoute = new ActivatedRouteStub();

  const mockLoadingScreenService = {
    setLoadingState: () => {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, CommonModule, NrptiCommonModule, GlobalModule, NgxPaginationModule],
      declarations: [MinesContentComponent],
      providers: [
        Location,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService }
      ]
    }).compileComponents();
  }));

  it('should create', async(() => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  }));
});
