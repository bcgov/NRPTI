import { Location } from '@angular/common';
import { async, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsListComponent } from './records-list.component';
import { of, throwError } from 'rxjs';
import { OrderByPipe } from '../../pipes/order-by.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { Record } from '../../models/record';
import { ActivatedRouteStub, TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { ExportService, GlobalModule } from 'nrpti-angular-components';
import { QueryParamModifier } from '../../services/api.service';
import { FactoryService } from '../../services/factory.service';

describe('RecordsListComponent', () => {
  const testBedHelper = new TestBedHelper<RecordsListComponent>(RecordsListComponent);

  // component constructor mocks
  const mockLocation = jasmine.createSpyObj('Location', ['go']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'events']);
  const mockActivatedRoute = new ActivatedRouteStub();
  const mockFactoryService = jasmine.createSpyObj('FactoryService', ['getAll']);
  const mockExportService = jasmine.createSpyObj('ExportService', ['exportAsCSV']);

  /**
   * Initialize the test bed.
   */
  beforeEach(async(() => {
    setDefaultMockBehaviour();

    TestBed.configureTestingModule({
      declarations: [RecordsListComponent, OrderByPipe],
      providers: [
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FactoryService, useValue: mockFactoryService },
        { provide: ExportService, useValue: mockExportService }
      ],
      imports: [RouterTestingModule, GlobalModule]
    }).compileComponents();
  }));

  /**
   * Return the mocks to their default stubbed state after each test so the tests don't interfere with one another.
   */
  afterEach(() => {
    setDefaultMockBehaviour();
  });

  /**
   * Sets the default stubbed behaviour of all mocks used by the component.
   */
  function setDefaultMockBehaviour() {
    mockLocation.go.and.stub();
    mockRouter.createUrlTree.and.returnValue('');
    mockActivatedRoute.clear();
    mockFactoryService.getAll.and.returnValue(of([]));
    mockExportService.exportAsCSV.and.stub();
  }

  it('should create', () => {
    const { component } = testBedHelper.createComponent();
    expect(component).toBeTruthy();
  });

  describe('getRecordQueryParamSets', () => {
    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
    });

    it('returns record query parameters', () => {
      component.pagination.currentPage = 7;
      component.pagination.itemsPerPage = 17;
      component.demoCodeFilters = ['COMPLETE'];

      const queryParameters = component.getRecordQueryParamSets()[0];

      expect(queryParameters.isDeleted).toEqual(false);
      expect(queryParameters.pageNum).toEqual(6);
      expect(queryParameters.pageSize).toEqual(17);
      expect(queryParameters.demo).toEqual({ value: ['COMPLETE'], modifier: QueryParamModifier.Equal });
    });
  });

  describe('getRecords', () => {
    describe('happy path', () => {
      let component;
      let factoryServiceMock;

      const records = [new Record({ _id: 1 }), new Record({ _id: 2 })];

      beforeEach(async(() => {
        ({ component } = testBedHelper.createComponent());

        component.records = [];
        component.pagination.totalItems = 0;
        component.isSearching = true;
        component.isLoading = true;

        factoryServiceMock = TestBed.get(FactoryService);
        factoryServiceMock.getAll.calls.reset();
        factoryServiceMock.getAll.and.returnValue(of(records));

        component.getRecords();
      }));

      it('calls FactoryService.getAll', () => {
        expect(factoryServiceMock.getAll).toHaveBeenCalledWith(component.getRecordQueryParamSets());
      });

      it('updates records', () => {
        expect(component.records).toEqual(records);
      });

      it('updates pagination', () => {
        expect(component.pagination.totalItems).toEqual(2);
      });

      it('updates isSearching/isLoading flags', () => {
        expect(component.isSearching).toEqual(false);
        expect(component.isLoading).toEqual(false);
      });
    });

    describe('on error', () => {
      let component;
      beforeEach(async(() => {
        ({ component } = testBedHelper.createComponent());
      }));

      it('re-navigates to the list page on error', async(() => {
        const factoryServiceMock = TestBed.get(FactoryService);
        factoryServiceMock.getAll.and.returnValue(throwError('some error'));

        const routerMock = TestBed.get(Router);
        routerMock.navigate.calls.reset();

        component.getRecords();

        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
      }));
    });
  });

  describe('export', () => {
    describe('happy path', () => {
      let component;
      let factoryServiceMock;
      let exportServiceMock;

      const records = [new Record({ _id: 3 })];

      beforeEach(async(() => {
        ({ component } = testBedHelper.createComponent());

        component.pagination.currentPage = 8;
        component.pagination.itemsPerPage = 18;
        component.demoCodeFilters = ['demoFilterF'];
        component.isExporting = true;

        factoryServiceMock = TestBed.get(FactoryService);
        factoryServiceMock.getAll.calls.reset();
        factoryServiceMock.getAll.and.returnValue(of(records));

        exportServiceMock = TestBed.get(ExportService);
        exportServiceMock.exportAsCSV.calls.reset();

        component.export();
      }));

      it('calls ExportService.exportAsCSV', () => {
        expect(exportServiceMock.exportAsCSV).toHaveBeenCalledTimes(1);
        expect(exportServiceMock.exportAsCSV.calls.all()[0].args[0]).toEqual(records);
      });

      it('updates isExporting flag', () => {
        expect(component.isExporting).toEqual(false);
      });
    });

    describe('on error', () => {
      let component;
      let exportServiceMock;

      const records = [new Record({ _id: 4 })];

      beforeEach(async(() => {
        ({ component } = testBedHelper.createComponent());

        component.isExporting = true;

        const factoryServiceMock = TestBed.get(FactoryService);
        factoryServiceMock.getAll.calls.reset();
        factoryServiceMock.getAll.and.returnValue(of(records));

        exportServiceMock = TestBed.get(ExportService);
        exportServiceMock.exportAsCSV.calls.reset();
        exportServiceMock.exportAsCSV.and.returnValue(throwError('some error 2'));

        component.export();
      }));

      it('calls ExportService.exportAsCSV', () => {
        expect(exportServiceMock.exportAsCSV).toHaveBeenCalledTimes(1);
        expect(exportServiceMock.exportAsCSV.calls.all()[0].args[0]).toEqual(records);
      });

      it('updates isExporting flag', () => {
        expect(component.isExporting).toEqual(false);
      });
    });
  });

  describe('setInitialQueryParameters', () => {
    it('sets default query parameters when parameters are not saved to the url', () => {
      const { component } = testBedHelper.createComponent();

      component.pagination.currentPage = 7;
      component.sorting.column = 'columnC';
      component.sorting.direction = 2;
      component.demoCodeFilters = ['demoFilterC'];

      component.setInitialQueryParameters();

      expect(component.pagination.currentPage).toEqual(1);
      expect(component.sorting.column).toEqual(null);
      expect(component.sorting.direction).toEqual(0);
      expect(component.demoCodeFilters).toEqual([]);
    });

    it('sets default query parameters when parameters are saved to the url', () => {
      const activatedRouteStub: ActivatedRouteStub = TestBed.get(ActivatedRoute);
      activatedRouteStub.setQueryParamMap({
        page: 3,
        sortBy: '+columnD',
        demo: 'demo1|demo2'
      });

      const { component } = testBedHelper.createComponent();

      component.pagination.currentPage = 77;
      component.sorting.column = 'columnCC';
      component.sorting.direction = 22;
      component.demoCodeFilters = ['demoFilterCC'];

      component.setInitialQueryParameters();

      expect(component.pagination.currentPage).toEqual(3);
      expect(component.sorting.column).toEqual('columnD');
      expect(component.sorting.direction).toEqual(1);
      expect(component.demoCodeFilters).toEqual(['demo1', 'demo2']);
    });
  });

  describe('saveQueryParameters', () => {
    let component;
    let routerMock;
    let locationMock;

    beforeEach(() => {
      routerMock = TestBed.get(Router);
      routerMock.createUrlTree.and.callFake((...args) => {
        expect(args[1].queryParams).toEqual({
          page: 4,
          sortBy: '-columnA',
          demo: 'demoFilterA'
        });
        return 'I was called 1';
      });

      locationMock = TestBed.get(Location);
      locationMock.go.calls.reset();

      ({ component } = testBedHelper.createComponent());
    });

    it('saves all query parameters to the url', () => {
      component.pagination.currentPage = 4;
      component.sorting.column = 'columnA';
      component.sorting.direction = -1;
      component.demoCodeFilters = ['demoFilterA'];

      component.saveQueryParameters();

      expect(locationMock.go).toHaveBeenCalledWith('I was called 1');
    });
  });

  describe('clearQueryParameters', () => {
    let component;
    let routerMock;
    let locationMock;

    beforeEach(() => {
      routerMock = TestBed.get(Router);
      routerMock.createUrlTree.and.callFake((...args) => {
        expect(args[1]['queryParams']).toBeUndefined();
        return 'I was called 2';
      });

      locationMock = TestBed.get(Location);
      locationMock.go.calls.reset();

      ({ component } = testBedHelper.createComponent());
    });

    it('sets all query parameters to their default values', () => {
      component.pagination.currentPage = 5;
      component.pagination.totalItems = 11;
      component.sorting.column = 'columnB';
      component.sorting.direction = -1;
      component.demoCodeFilters = ['demoFilterB'];

      component.clearQueryParameters();

      expect(component.pagination.currentPage).toEqual(1);
      expect(component.pagination.totalItems).toEqual(0);
      expect(component.sorting.column).toEqual(null);
      expect(component.sorting.direction).toEqual(0);
      expect(component.demoCodeFilters).toEqual([]);

      expect(locationMock.go).toHaveBeenCalledWith('I was called 2');
    });
  });

  describe('setDemoFilter', () => {
    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
    });

    describe('demo is undefined', () => {
      beforeEach(() => {
        component.demoCodeFilters = ['oldFilter'];
        component.filterChanged = false;

        component.setDemoFilter(undefined);
      });

      it('sets demoCodeFilters to empty array', () => {
        expect(component.demoCodeFilters).toEqual([]);
      });

      it('sets filterChanged to true', () => {
        expect(component.filterChanged).toEqual(true);
      });
    });

    describe('demo is null', () => {
      beforeEach(() => {
        component.demoCodeFilters = ['oldFilter'];
        component.filterChanged = false;

        component.setDemoFilter(null);
      });

      it('sets demoCodeFilters to empty array', () => {
        expect(component.demoCodeFilters).toEqual([]);
      });

      it('sets filterChanged to true', () => {
        expect(component.filterChanged).toEqual(true);
      });
    });

    describe('demo is empty string', () => {
      beforeEach(() => {
        component.demoCodeFilters = ['oldFilter'];
        component.filterChanged = false;

        component.setDemoFilter('');
      });

      it('sets demoCodeFilters to empty array', () => {
        expect(component.demoCodeFilters).toEqual([]);
      });

      it('sets filterChanged to true', () => {
        expect(component.filterChanged).toEqual(true);
      });
    });

    describe('demoCode is valid', () => {
      beforeEach(() => {
        component.demoCodeFilters = ['oldFilter'];
        component.filterChanged = false;

        component.setDemoFilter('newFilter');
      });

      it('sets demoCodeFilters to array containing new filter', () => {
        expect(component.demoCodeFilters).toEqual(['newFilter']);
      });

      it('sets filterChanged to true', () => {
        expect(component.filterChanged).toEqual(true);
      });
    });
  });

  describe('sort', () => {
    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
    });

    it('does nothing if sortBy is undefined', () => {
      component.sorting.column = 'columnE';
      component.sorting.direction = 1;

      component.sort(undefined);
      expect(component.sorting.column).toEqual('columnE');
      expect(component.sorting.direction).toEqual(1);
    });

    it('does nothing if sortBy is null', () => {
      component.sorting.column = 'columnE';
      component.sorting.direction = 1;

      component.sort(null);
      expect(component.sorting.column).toEqual('columnE');
      expect(component.sorting.direction).toEqual(1);
    });

    it('sets column and toggles direction', () => {
      component.sorting.column = '';
      component.sorting.direction = null;

      component.sort('columnA');
      expect(component.sorting.column).toEqual('columnA');
      expect(component.sorting.direction).toEqual(1);

      component.sort('columnA');
      expect(component.sorting.column).toEqual('columnA');
      expect(component.sorting.direction).toEqual(-1);

      component.sort('columnA');
      expect(component.sorting.column).toEqual('columnA');
      expect(component.sorting.direction).toEqual(1);

      component.sort('columnD');
      expect(component.sorting.column).toEqual('columnD');
      expect(component.sorting.direction).toEqual(1);
    });
  });

  describe('updatePagination', () => {
    const initialPaginationValues = {
      currentPage: 3,
      itemsPerPage: 2,
      totalItems: 9,
      pageCount: 5,
      message: 'Displaying 5 - 6 of 9 records'
    };

    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
      component.pagination = { ...initialPaginationValues };
    });

    it('does nothing if paginationParams is undefined', () => {
      component.updatePagination(undefined);
      expect(component.pagination).toEqual(initialPaginationValues);
    });

    it('does nothing if paginationParams is null', () => {
      component.updatePagination(null);
      expect(component.pagination).toEqual(initialPaginationValues);
    });

    it('does nothing if totalItems is negative', () => {
      component.updatePagination({ totalItems: -1 });
      expect(component.pagination).toEqual({ ...initialPaginationValues });
    });

    it('does nothing if currentPage is negative', () => {
      component.updatePagination({ currentPage: -1 });
      expect(component.pagination).toEqual({ ...initialPaginationValues });
    });

    it('sets canned message when totalItems is 0', () => {
      component.updatePagination({ totalItems: 0 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        totalItems: 0,
        pageCount: 1,
        message: 'No records found'
      });
    });

    it('updates pagination values for small sets', () => {
      component.updatePagination({ currentPage: 1, totalItems: 1 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        currentPage: 1,
        totalItems: 1,
        pageCount: 1,
        message: 'Displaying 1 - 1 of 1 records'
      });
    });

    it('updates pagination values for large sets', () => {
      component.pagination.itemsPerPage = 13;

      component.updatePagination({ currentPage: 4, totalItems: 251 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        itemsPerPage: 13,
        currentPage: 4,
        totalItems: 251,
        pageCount: 20,
        message: 'Displaying 40 - 52 of 251 records'
      });
    });

    it('updates pagination values on first page', () => {
      component.pagination.itemsPerPage = 14;

      component.updatePagination({ currentPage: 1, totalItems: 122 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        itemsPerPage: 14,
        currentPage: 1,
        totalItems: 122,
        pageCount: 9,
        message: 'Displaying 1 - 14 of 122 records'
      });
    });

    it('updates pagination values on last page', () => {
      component.pagination.itemsPerPage = 14;

      component.updatePagination({ currentPage: 10, totalItems: 130 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        itemsPerPage: 14,
        currentPage: 10,
        totalItems: 130,
        pageCount: 10,
        message: 'Displaying 127 - 130 of 130 records'
      });
    });

    it('updates pagination values when totalItems changes', () => {
      component.updatePagination({ totalItems: 15 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        totalItems: 15,
        pageCount: 8,
        message: 'Displaying 5 - 6 of 15 records'
      });
    });

    it('updates pagination values when currentPage changes', () => {
      component.updatePagination({ currentPage: 4 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        currentPage: 4,
        message: 'Displaying 7 - 8 of 9 records'
      });
    });

    it('sets canned message when currentPage greater than pageCount', () => {
      component.updatePagination({ currentPage: 10 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        currentPage: 10,
        message: 'Unable to display results, please clear and re-try'
      });
    });

    it('sets canned message when totalItems causes pageCount to be smaller than currentPage', () => {
      component.updatePagination({ totalItems: 1 });
      expect(component.pagination).toEqual({
        ...initialPaginationValues,
        totalItems: 1,
        pageCount: 1,
        message: 'Unable to display results, please clear and re-try'
      });
    });
  });

  describe('resetPagination', () => {
    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
    });

    it('sets current page to 1', () => {
      component.pagination.currentPage = 5;
      component.resetPagination();
      expect(component.pagination.currentPage).toEqual(1);
    });

    it('sets filterChanged flag to false', () => {
      component.filterChanged = true;
      component.resetPagination();
      expect(component.filterChanged).toEqual(false);
    });
  });

  describe('updatePage', () => {
    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
    });

    it('does nothing when page is undefined', () => {
      component.pagination.currentPage = 0;
      component.updatePage(undefined);
      expect(component.pagination.currentPage).toEqual(0);
    });

    it('does nothing when page is null', () => {
      component.pagination.currentPage = 0;
      component.updatePage(null);
      expect(component.pagination.currentPage).toEqual(0);
    });

    it('does nothing when page equal to 0', () => {
      component.pagination.currentPage = 1;
      component.updatePage(0);
      expect(component.pagination.currentPage).toEqual(1);
    });

    it('does nothing when page greater than 1', () => {
      component.pagination.currentPage = 1;
      component.updatePage(2);
      expect(component.pagination.currentPage).toEqual(1);
    });

    describe('page is -1', () => {
      it('current page is greater than 1', () => {
        component.pagination.currentPage = 2;
        component.updatePage(-1);
        expect(component.pagination.currentPage).toEqual(1);
      });

      it('current page is equal to 1', () => {
        component.pagination.currentPage = 1;
        component.updatePage(-1);
        expect(component.pagination.currentPage).toEqual(1);
      });

      it('current page is less than 1', () => {
        component.pagination.currentPage = 0;
        component.updatePage(-1);
        expect(component.pagination.currentPage).toEqual(0);
      });
    });

    describe('page is 1', () => {
      it('page count is greater than current page + 1', () => {
        component.pagination.pageCount = 3;
        component.pagination.currentPage = 1;
        component.updatePage(1);
        expect(component.pagination.currentPage).toEqual(2);
      });

      it('page count is equal to current page + 1', () => {
        component.pagination.pageCount = 2;
        component.pagination.currentPage = 1;
        component.updatePage(1);
        expect(component.pagination.currentPage).toEqual(2);
      });

      it('page count is equal to current page', () => {
        component.pagination.pageCount = 2;
        component.pagination.currentPage = 2;
        component.updatePage(1);
        expect(component.pagination.currentPage).toEqual(2);
      });

      it('page count is less than current page', () => {
        component.pagination.pageCount = 1;
        component.pagination.currentPage = 2;
        component.updatePage(1);
        expect(component.pagination.currentPage).toEqual(2);
      });
    });
  });

  describe('setPage', () => {
    let component;
    beforeEach(() => {
      ({ component } = testBedHelper.createComponent());
    });

    it('does nothing when page is undefined', () => {
      component.pagination.currentPage = 0;
      component.setPage(undefined);
      expect(component.pagination.currentPage).toEqual(0);
    });

    it('does nothing when page is null', () => {
      component.pagination.currentPage = 0;
      component.setPage(null);
      expect(component.pagination.currentPage).toEqual(0);
    });

    it('does nothing when page is negative', () => {
      component.pagination.currentPage = 0;
      component.setPage(-1);
      expect(component.pagination.currentPage).toEqual(0);
    });

    it('does nothing when page is 0', () => {
      component.pagination.currentPage = 1;
      component.setPage(0);
      expect(component.pagination.currentPage).toEqual(1);
    });
  });
});
