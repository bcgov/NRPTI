import { async, TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReplaySubject, of } from 'rxjs';
import { TestBedHelper } from '../../../../common/src/app/spec/spec-utils';
import { SidebarComponent } from './sidebar.component';
import { StoreService } from 'nrpti-angular-components';

describe('SidebarComponent', () => {
  const testBedHelper = new TestBedHelper<SidebarComponent>(SidebarComponent);

  const mockRouter = jasmine.createSpyObj('Router', ['events']);

  const mockStoreService = {
    change: of(),
    toggleSideNave: () => {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SidebarComponent],
      providers: [
        { provide: 'Router', useValue: mockRouter },
        { provide: StoreService, useValue: mockStoreService }
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const routerMock = TestBed.get(Router);
    routerMock.events = new ReplaySubject<RouterEvent>(1).asObservable();

    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  });
});
