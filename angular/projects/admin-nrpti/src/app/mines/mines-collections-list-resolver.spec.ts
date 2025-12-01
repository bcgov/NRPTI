import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TableObject, TableTemplateUtils } from 'nrpti-angular-components';
import { of } from 'rxjs';
import { FactoryService } from '../services/factory.service';
import { MinesCollectionsListResolver } from './mines-collections-list-resolver';

// TODO: Skipping Test: Resolve in new ticket #1402
xdescribe('MinesCollectionsListResolver', () => {
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

  it('should create', () => {
    const factoryService = TestBed.get(FactoryService);
    const tableTemplateUtils = TestBed.get(TableTemplateUtils);

    const minesCollectionsListResolver = new MinesCollectionsListResolver(factoryService, tableTemplateUtils);

    expect(minesCollectionsListResolver).toBeTruthy();
  });

  describe('resolve', () => {
    let factoryServiceSpy: jasmine.SpyObj<FactoryService>;
    let tableTemplateUtilsSpy: jasmine.SpyObj<TableTemplateUtils>;

    describe('with empty/null route parameters', () => {
      const activatedRouteSnapshot: ActivatedRouteSnapshot = {
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
      } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;

      beforeAll(() => {
        factoryServiceSpy = TestBed.get(FactoryService);
        tableTemplateUtilsSpy = TestBed.get(TableTemplateUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of([]));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({
          currentPage: 1,
          pageSize: 25
        } as Partial<TableObject> as TableObject);

        const minesCollectionsListResolver = new MinesCollectionsListResolver(factoryServiceSpy, tableTemplateUtilsSpy);

        minesCollectionsListResolver.resolve(activatedRouteSnapshot);
      });

      it('calls tableTemplateUtils.updateTableObjectWithUrlParams', () => {
        expect(tableTemplateUtilsSpy.updateTableObjectWithUrlParams).toHaveBeenCalledWith(
          activatedRouteSnapshot.params,
          jasmine.any(TableObject)
        );
      });

      it('calls factoryService.getRecords', () => {
        expect(factoryServiceSpy.getRecords).toHaveBeenCalledWith(
          '',
          ['CollectionBCMI'],
          [],
          1,
          25,
          '-dateAdded',
          {},
          false,
          {},
          [],
          {}
        );
      });
    });
  });
});
