import { async, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FactoryService } from '../services/factory.service';
import { Router, RouterEvent } from '@angular/router';
import { TestBedHelper } from '../../../../common/src/app/spec/spec-utils';
import { ReplaySubject } from 'rxjs';

describe('HeaderComponent', () => {
  const testBedHelper = new TestBedHelper<HeaderComponent>(HeaderComponent);

  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['getWelcomeMessage', 'getEnvironment']);
  mockFactoryService.getWelcomeMessage.and.returnValue('hello test');
  mockFactoryService.getEnvironment.and.returnValue('dev');

  const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'events']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: FactoryService, useValue: mockFactoryService },
        { provide: Router, useValue: mockRouter }
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
