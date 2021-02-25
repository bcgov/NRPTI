import { LoadingScreenService } from 'nrpti-angular-components';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FactoryService } from './../../../../../public-nrpti/src/app/services/factory.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeycloakService } from '../../services/keycloak.service';

import { LngMapInfoComponent } from './lng-map-info.component';
import { Router } from '@angular/router';

describe('LngMapInfoComponent', () => {
  let component: LngMapInfoComponent;
  let fixture: ComponentFixture<LngMapInfoComponent>;

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockFactoryService = jasmine.createSpyObj('FactoryService', [
    'updateMapLayerInfo',
    'userInRole',
    'userInLngRole'
  ]);
  mockFactoryService.userInLngRole.and.returnValue(true);

  const mockKeycloakService = jasmine.createSpyObj('KeycloackService', ['isMenuEnabled', 'getToken']);
  const mockLoadingScreenService = {
    isLoading: false,
    setLoadingState: () => {
      return false;
    }
  };

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        EditorModule
      ],
      declarations: [ LngMapInfoComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: KeycloakService, useValue: mockKeycloakService},
        { provide: FactoryService, useValue: mockFactoryService },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LngMapInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
