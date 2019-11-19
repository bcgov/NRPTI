import { TestBed } from '@angular/core/testing';

import { CanActivateGuard } from './can-activate-guard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { FactoryService } from '../services/factory.service';

describe('CanActivateGuard', () => {
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['isAuthenticated']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CanActivateGuard,
        { provide: FactoryService, useValue: mockFactoryService },
        { provide: Router, useValue: mockRouter }
      ],
      imports: [RouterTestingModule]
    });
  });

  /**
   * Return the mocks to their default stubbed state after each test so the tests don't interfere with one another.
   */
  afterEach(() => {
    mockRouter.navigate.and.stub();
    mockFactoryService.isAuthenticated.and.stub();
  });

  it('should be created', () => {
    const service = TestBed.get(CanActivateGuard);

    expect(service).toBeTruthy();
  });

  it('should return true if the user is authenticated', () => {
    mockFactoryService.isAuthenticated.and.returnValue(true);

    const service = TestBed.get(CanActivateGuard);

    const result = service.canActivate();

    expect(result).toEqual(true);
  });

  it('should return false and redirect to not-authorized page if the user is not authenticated', () => {
    const routerMock = TestBed.get(Router);
    routerMock.navigate.calls.reset();

    const factoryServiceMock = TestBed.get(FactoryService);
    factoryServiceMock.isAuthenticated.and.returnValue(false);

    const service = TestBed.get(CanActivateGuard);

    const result = service.canActivate();

    expect(result).toEqual(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/not-authorized']);
  });
});
