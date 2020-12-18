import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';

import { LoadingScreenService } from 'nrpti-angular-components';
import { Constants } from '../utils/constants/misc';
import { KeycloakService } from '../services/keycloak.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const mockRouter = jasmine.createSpyObj('Router', ['events']);

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
      }
      return retVal;
    }
  };

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: 'Router', useValue: mockRouter },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService },
        { provide: KeycloakService, useValue: mockKeyCloakService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
