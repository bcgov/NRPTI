import { async, TestBed } from '@angular/core/testing';
import { RecordsListComponent } from './records-list.component';
import { TestBedHelper, ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import {
  TableTemplateComponent,
  PageCountDisplayComponent,
  PageSizePickerComponent,
  TableTemplateUtils
} from 'nrpti-angular-components';
import { PaginationControlsComponent, PaginationControlsDirective } from 'ngx-pagination';

describe('RecordsListComponent', () => {
  const testBedHelper = new TestBedHelper<RecordsListComponent>(RecordsListComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockActivatedRoute = new ActivatedRouteStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        RecordsListComponent,
        TableTemplateComponent,
        PageCountDisplayComponent,
        PageSizePickerComponent,
        PaginationControlsComponent,
        PaginationControlsDirective
      ],
      providers: [
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        TableTemplateUtils
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
