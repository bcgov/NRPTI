import { async, TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TableObject, TableTemplateUtils } from 'nrpti-angular-components';
import { of } from 'rxjs';
import { FactoryService } from '../services/factory.service';
import { MinesRecordsListResolver } from './mines-records-list-resolver';

describe('MinesRecordsListResolver', () => {
  const spyFactoryService = jasmine.createSpyObj<FactoryService>('FactoryService', ['getRecords']);
  const spyTableTemplateUtils = jasmine.createSpyObj<TableTemplateUtils>('TableTemplateUtils', [
    'updateTableObjectWithUrlParams'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FactoryService, useValue: spyFactoryService },
        { provide: TableTemplateUtils, useValue: spyTableTemplateUtils }
      ]
    }).compileComponents();
  }));

  it('should create', async(() => {
    const factoryService = TestBed.get(FactoryService);
    const tableTemplateUtils = TestBed.get(TableTemplateUtils);

    const minesRecordsListResolver = new MinesRecordsListResolver(factoryService, tableTemplateUtils);

    expect(minesRecordsListResolver).toBeTruthy();
  }));

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
      };

      beforeAll(async(() => {
        factoryServiceSpy = TestBed.get(FactoryService);
        tableTemplateUtilsSpy = TestBed.get(TableTemplateUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const minesRecordsListResolver = new MinesRecordsListResolver(factoryServiceSpy, tableTemplateUtilsSpy);

        minesRecordsListResolver.resolve(activatedRouteSnapshot);
      }));

      it('calls tableTemplateUtils.updateTableObjectWithUrlParams', () => {
        expect(tableTemplateUtilsSpy.updateTableObjectWithUrlParams).toHaveBeenCalledWith(
          activatedRouteSnapshot.params,
          jasmine.any(TableObject)
        );
      });

      it('calls factoryService.getRecords', () => {
        expect(factoryServiceSpy.getRecords).toHaveBeenCalledWith(
          '',
          [
            'Order',
            'Inspection',
            'Certificate',
            'Permit',
            'SelfReport',
            'Agreement',
            'RestorativeJustice',
            'Ticket',
            'AdministrativePenalty',
            'AdministrativeSanction',
            'Warning',
            'ConstructionPlan',
            'ManagementPlan',
            'CourtConviction',
            'AnnualReport',
            'CertificateAmendment',
            'Correspondence',
            'DamSafetyInspection',
            'Report',
            'PermitBCMI',
            'PermitAmendmentBCMI',
            'AnnualReportBCMI',
            'CertificateAmendmentBCMI',
            'CorrespondenceBCMI',
            'DamSafetyInspectionBCMI',
            'ReportBCMI'
          ],
          [],
          1,
          25,
          '-dateAdded',
          {
            mineGuid: ''
          },
          false,
          {},
          [],
          {}
        );
      });
    });

    describe('with empty project route parameters', () => {
      const activatedRouteSnapshot: ActivatedRouteSnapshot = {
        url: null,
        params: { projects: '' },
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

        const minesRecordsListResolver = new MinesRecordsListResolver(factoryServiceSpy, tableTemplateUtilsSpy);

        minesRecordsListResolver.resolve(activatedRouteSnapshot);
      }));

      it('calls tableTemplateUtils.updateTableObjectWithUrlParams', () => {
        expect(tableTemplateUtilsSpy.updateTableObjectWithUrlParams).toHaveBeenCalledWith(
          activatedRouteSnapshot.params,
          jasmine.any(TableObject)
        );
      });

      it('calls factoryService.getRecords', () => {
        expect(factoryServiceSpy.getRecords).toHaveBeenCalledWith(
          '',
          [
            'Order',
            'Inspection',
            'Certificate',
            'Permit',
            'SelfReport',
            'Agreement',
            'RestorativeJustice',
            'Ticket',
            'AdministrativePenalty',
            'AdministrativeSanction',
            'Warning',
            'ConstructionPlan',
            'ManagementPlan',
            'CourtConviction',
            'AnnualReport',
            'CertificateAmendment',
            'Correspondence',
            'DamSafetyInspection',
            'Report',
            'PermitBCMI',
            'PermitAmendmentBCMI',
            'AnnualReportBCMI',
            'CertificateAmendmentBCMI',
            'CorrespondenceBCMI',
            'DamSafetyInspectionBCMI',
            'ReportBCMI'
          ],
          [],
          1,
          25,
          '-dateAdded',
          {
            mineGuid: ''
          },
          false,
          {},
          [],
          {}
        );
      });
    });
  });
});
