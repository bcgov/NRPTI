import { TestBed, async } from '@angular/core/testing';
import { FactoryService } from '../services/factory.service';
import { TableTemplateUtils } from 'nrpti-angular-components';
import { MinesListResolver } from './mines-list-resolver';
import { of } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TableObject } from 'nrpti-angular-components';

describe('MinesListResolver', () => {
  const spyFactoryService = jasmine.createSpyObj<FactoryService>('FactoryService', ['getRecords']);
  const spyTableTemplateUtils = jasmine.createSpyObj<TableTemplateUtils>('TableTemplateUtils', [
    'updateTableObjectWithUrlParams'
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FactoryService, useValue: spyFactoryService },
        { provide: TableTemplateUtils, useValue: spyTableTemplateUtils }
      ]
    }).compileComponents();
  });

  it('should create', async(() => {
    const factoryService = TestBed.get(FactoryService);
    const tableTemplateUtils = TestBed.get(TableTemplateUtils);

    const minesListResolver = new MinesListResolver(factoryService, tableTemplateUtils);

    expect(minesListResolver).toBeTruthy();
  }));

  describe('resolve', () => {
    let factoryServiceSpy: jasmine.SpyObj<FactoryService>;
    let tableTemplateUtilsSpy: jasmine.SpyObj<TableTemplateUtils>;

    describe('with empty/null route parameters', () => {
      const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {
        url: null,
        params: null,
        queryParams: null,
        fragment: null,
        data: null,
        outlet: null,
        component: null,
        routeConfig: null,
        root: null,
        parent: null,
        firstChild: null,
        children: null,
        pathFromRoot: null,
        paramMap: null,
        queryParamMap: null
      };

      beforeAll(async(() => {
        factoryServiceSpy = TestBed.get(FactoryService);
        tableTemplateUtilsSpy = TestBed.get(TableTemplateUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const minesListResolver = new MinesListResolver(factoryServiceSpy, tableTemplateUtilsSpy);

        minesListResolver.resolve(mockActivatedRouteSnapshot);
      }));

      it('calls tableTemplateUtils.updateTableObjectWithUrlParams', () => {
        expect(tableTemplateUtilsSpy.updateTableObjectWithUrlParams).toHaveBeenCalledWith(
          mockActivatedRouteSnapshot.params,
          jasmine.any(TableObject)
        );
      });

      it('calls factoryService.getRecords', () => {
        expect(factoryServiceSpy.getRecords).toHaveBeenCalledWith('', ['Mine'], [], 1, 25, '-name', {}, false, {}, []);
      });
    });
  });
});
