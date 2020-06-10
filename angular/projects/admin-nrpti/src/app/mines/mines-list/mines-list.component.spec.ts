import { async, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { MinesListComponent } from './mines-list.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { GlobalModule, TableTemplateUtils, Utils, LoadingScreenService } from 'nrpti-angular-components';

describe('MinesListComponent', () => {
  const testBedHelper = new TestBedHelper<MinesListComponent>(MinesListComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  mockLocation.go.and.stub();
  const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
  mockRouter.createUrlTree.and.returnValue('');
  const mockActivatedRoute = new ActivatedRouteStub();

  const mockLoadingScreenService = {
    setLoadingState: () => {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, CommonModule, GlobalModule, NgxPaginationModule],
      declarations: [MinesListComponent],
      providers: [
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        TableTemplateUtils,
        Utils
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
