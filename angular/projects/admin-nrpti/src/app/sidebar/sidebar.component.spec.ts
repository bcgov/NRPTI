import { TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReplaySubject, of } from 'rxjs';
import { TestBedHelper } from '../../../../common/src/app/spec/spec-utils';
import { SidebarComponent } from './sidebar.component';
import { StoreService, LoadingScreenService } from 'nrpti-angular-components';
import { KeycloakService } from '../services/keycloak.service';
import { By } from '@angular/platform-browser';
import { Constants } from '../utils/constants/misc';

describe('SidebarComponent', () => {
  const testBedHelper = new TestBedHelper<SidebarComponent>(SidebarComponent);

  const mockRouter = jasmine.createSpyObj('Router', ['events']);

  const mockStoreService = {
    change: of(),
    toggleSideNave: () => { }
  };

  const mockLoadingScreenService = {
    isLoading: false,
    setLoadingState: () => {
      return false;
    }
  };

  const mockKeyCloakService = {
    isMenuEnabled: (menuName) => {
      let retVal = false;
      switch (menuName) {
        case Constants.Menus.ALL_MINES: retVal = true; break;
        case Constants.Menus.ALL_RECORDS: retVal = true; break;
        case Constants.Menus.NEWS_LIST: retVal = true; break;
        case Constants.Menus.ANALYTICS: retVal = false; break;
        case Constants.Menus.MAP: retVal = false; break;
        case Constants.Menus.ENTITIES: retVal = false; break;
        case Constants.Menus.IMPORTS: retVal = true; break;
        case Constants.Menus.COMMUNICATIONS: retVal = true; break;
        case Constants.Menus.AGENCIES: retVal = true; break;
      }
      return retVal;
    }
  };

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SidebarComponent],
      providers: [
        { provide: 'Router', useValue: mockRouter },
        { provide: StoreService, useValue: mockStoreService },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: KeycloakService, useValue: mockKeyCloakService }
      ]
    }).compileComponents();
  }));

  it('sidebar menu should render properly', () => {
    const routerMock = TestBed.get(Router);
    routerMock.events = new ReplaySubject<RouterEvent>(1).asObservable();

    const { component, fixture } = testBedHelper.createComponent();

    expect(component.keycloakService.isMenuEnabled(Constants.Menus.ALL_MINES)).toEqual(true);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.ALL_RECORDS)).toEqual(true);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.NEWS_LIST)).toEqual(true);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.ANALYTICS)).toEqual(false);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.MAP)).toEqual(false);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.ENTITIES)).toEqual(false);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.IMPORTS)).toEqual(true);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.COMMUNICATIONS)).toEqual(true);
    expect(component.keycloakService.isMenuEnabled(Constants.Menus.AGENCIES)).toEqual(true);
    expect(component.keycloakService.isMenuEnabled('Something Not Here')).toEqual(false);

    expect(component).toBeTruthy();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(fixture.debugElement.query(By.css('#sidebarnav')).nativeElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#mines')).nativeElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#records')).nativeElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#newslist')).nativeElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#analytics'))).toBeNull();
      expect(fixture.debugElement.query(By.css('#map'))).toBeNull();
      expect(fixture.debugElement.query(By.css('#entities'))).toBeNull();
      expect(fixture.debugElement.query(By.css('#imports')).nativeElement).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#map'))).toBeNull();
    });
  });
});
