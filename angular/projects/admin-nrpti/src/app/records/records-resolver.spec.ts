import { TestBed, async } from '@angular/core/testing';
import { FactoryService } from '../services/factory.service';
import { TableTemplateUtils } from 'nrpti-angular-components';
import { RecordsResolver } from './records-resolver';
import { of } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TableObject } from 'nrpti-angular-components';
import { EpicProjectIds } from '../../../../common/src/app/utils/record-constants';
import { RecordUtils } from './utils/record-utils';

describe('RecordsResolver', () => {
  const spyFactoryService = jasmine.createSpyObj<FactoryService>('FactoryService', ['getRecords']);
  const spyTableTemplateUtils = jasmine.createSpyObj<TableTemplateUtils>('TableTemplateUtils', [
    'updateTableObjectWithUrlParams'
  ]);
  const spyRecordUtils = jasmine.createSpyObj<RecordUtils>('RecordUtils', ['appendActCodesToActNames']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FactoryService, useValue: spyFactoryService },
        { provide: TableTemplateUtils, useValue: spyTableTemplateUtils },
        { provide: RecordUtils, useValue: spyRecordUtils}
      ]
    }).compileComponents();
  });

  it('should create', async(() => {
    const factoryService = TestBed.get(FactoryService);
    const tableTemplateUtils = TestBed.get(TableTemplateUtils);
    const recordUtils = TestBed.get(RecordUtils);

    const recordsResolver = new RecordsResolver(factoryService, tableTemplateUtils, recordUtils);

    expect(recordsResolver).toBeTruthy();
  }));

  describe('resolve', () => {
    let factoryServiceSpy: jasmine.SpyObj<FactoryService>;
    let tableTemplateUtilsSpy: jasmine.SpyObj<TableTemplateUtils>;
    let recordUtilsSpy: jasmine.SpyObj<RecordUtils>;

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
        recordUtilsSpy = TestBed.get(RecordUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const recordsResolver = new RecordsResolver(factoryServiceSpy, tableTemplateUtilsSpy, recordUtilsSpy);

        recordsResolver.resolve(activatedRouteSnapshot);
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
            'Report'
          ],
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
        recordUtilsSpy = TestBed.get(RecordUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const recordsResolver = new RecordsResolver(factoryServiceSpy, tableTemplateUtilsSpy, recordUtilsSpy);

        recordsResolver.resolve(activatedRouteSnapshot);
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
            'Report'
          ],
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

    describe('with `lngCanada` project route parameter', () => {
      const activatedRouteSnapshot: ActivatedRouteSnapshot = {
        url: null,
        params: { projects: ['lngCanada'] },
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
        recordUtilsSpy = TestBed.get(RecordUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const recordsResolver = new RecordsResolver(factoryServiceSpy, tableTemplateUtilsSpy, recordUtilsSpy);

        recordsResolver.resolve(activatedRouteSnapshot);
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
            'Report'
          ],
          [],
          1,
          25,
          '-dateAdded',
          {},
          false,
          { _epicProjectId: EpicProjectIds.lngCanadaId },
          [],
          {}
        );
      });
    });

    describe('with `lngCanada` and `coastalGaslink` project route parameters', () => {
      const activatedRouteSnapshot: ActivatedRouteSnapshot = {
        url: null,
        params: { projects: ['lngCanada', 'coastalGaslink'] },
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
        recordUtilsSpy = TestBed.get(RecordUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const recordsResolver = new RecordsResolver(factoryServiceSpy, tableTemplateUtilsSpy, recordUtilsSpy);

        recordsResolver.resolve(activatedRouteSnapshot);
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
            'Report'
          ],
          [],
          1,
          25,
          '-dateAdded',
          {},
          false,
          { _epicProjectId: `${EpicProjectIds.lngCanadaId},${EpicProjectIds.coastalGaslinkId}` },
          [],
          {}
        );
      });
    });

    describe('with `lngCanada` and `otherProjects` project route parameters', () => {
      const activatedRouteSnapshot: ActivatedRouteSnapshot = {
        url: null,
        params: { projects: ['lngCanada', 'otherProjects'] },
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
        recordUtilsSpy = TestBed.get(RecordUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const recordsResolver = new RecordsResolver(factoryServiceSpy, tableTemplateUtilsSpy, recordUtilsSpy);

        recordsResolver.resolve(activatedRouteSnapshot);
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
            'Report'
          ],
          [],
          1,
          25,
          '-dateAdded',
          {},
          false,
          {},
          [],
          { _epicProjectId: EpicProjectIds.coastalGaslinkId }
        );
      });
    });

    describe('with `lngCanada`, `coastalGaslink`, and `otherProjects` project route parameters', () => {
      const activatedRouteSnapshot: ActivatedRouteSnapshot = {
        url: null,
        params: { projects: ['lngCanada', 'coastalGaslink', 'otherProjects'] },
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
        recordUtilsSpy = TestBed.get(RecordUtils);

        factoryServiceSpy.getRecords.calls.reset();
        factoryServiceSpy.getRecords.and.returnValue(of({}));
        tableTemplateUtilsSpy.updateTableObjectWithUrlParams.and.returnValue({ currentPage: 1, pageSize: 25 });

        const recordsResolver = new RecordsResolver(factoryServiceSpy, tableTemplateUtilsSpy, recordUtilsSpy);

        recordsResolver.resolve(activatedRouteSnapshot);
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
            'Report'
          ],
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
