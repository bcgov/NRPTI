import { LoadingScreenService } from 'nrpti-angular-components';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FactoryService } from './../../../../../public-nrpti/src/app/services/factory.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeycloakService } from '../../services/keycloak.service';

import { LngMapInfoComponent } from './lng-map-info.component';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../../../../common/src/app/spec/spec-utils';

describe('LngMapInfoComponent', () => {
  let component: LngMapInfoComponent;
  let fixture: ComponentFixture<LngMapInfoComponent>;

  const mockActivatedRoute = new ActivatedRouteStub();
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, EditorModule],
      declarations: [LngMapInfoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: KeycloakService, useValue: mockKeycloakService },
        { provide: FactoryService, useValue: mockFactoryService },
        { provide: LoadingScreenService, useValue: mockLoadingScreenService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LngMapInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
