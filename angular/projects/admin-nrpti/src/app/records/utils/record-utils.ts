import { Type } from '@angular/core';
import * as models from '../../../../../common/src/app/models';

// orders
import { OrderNRCEDDetailComponent } from '../orders/order-nrced-detail/order-nrced-detail.component';
import { OrderLNGDetailComponent } from '../orders/order-lng-detail/order-lng-detail.component';

// inspections
import { InspectionNRCEDDetailComponent } from '../inspections/inspection-nrced-detail/inspection-nrced-detail.component';
import { InspectionLNGDetailComponent } from '../inspections/inspection-lng-detail/inspection-lng-detail.component';

// certificates
import { CertificateLNGDetailComponent } from '../certificates/certificate-lng-detail/certificate-lng-detail.component';

// permits
import { PermitLNGDetailComponent } from '../permits/permit-lng-detail/permit-lng-detail.component';

// agreements
import { AgreementLNGDetailComponent } from '../agreements/agreement-lng-detail/agreement-lng-detail.component';

// self reports
import { SelfReportLNGDetailComponent } from '../self-reports/self-report-lng-detail/self-report-lng-detail.component';

// restorative justices
import { RestorativeJusticeNRCEDDetailComponent } from '../restorative-justices/restorative-justice-nrced-detail/restorative-justice-nrced-detail.component';
import { RestorativeJusticeLNGDetailComponent } from '../restorative-justices/restorative-justice-lng-detail/restorative-justice-lng-detail.component';

// tickets
import { TicketLNGDetailComponent } from '../tickets/ticket-lng-detail/ticket-lng-detail.component';
import { TicketNRCEDDetailComponent } from '../tickets/ticket-nrced-detail/ticket-nrced-detail.component';

// administrative penalties
import { AdministrativePenaltyNRCEDDetailComponent } from '../administrative-penalties/administrative-penalty-nrced-detail/administrative-penalty-nrced-detail.component';
import { AdministrativePenaltyLNGDetailComponent } from '../administrative-penalties/administrative-penalty-lng-detail/administrative-penalty-lng-detail.component';
import { AdministrativePenaltyBCMIDetailComponent } from '../administrative-penalties/administrative-penalty-bcmi-detail/administrative-penalty-bcmi-detail.component';

// administrative sanctions
import { AdministrativeSanctionNRCEDDetailComponent } from '../administrative-sanctions/administrative-sanction-nrced-detail/administrative-sanction-nrced-detail.component';
import { AdministrativeSanctionLNGDetailComponent } from '../administrative-sanctions/administrative-sanction-lng-detail/administrative-sanction-lng-detail.component';

// warnings
import { WarningNRCEDDetailComponent } from '../warnings/warning-nrced-detail/warning-nrced-detail.component';
import { WarningLNGDetailComponent } from '../warnings/warning-lng-detail/warning-lng-detail.component';

// construction plans
import { ConstructionPlanLNGDetailComponent } from '../construction-plans/construction-plan-lng-detail/construction-plan-lng-detail.component';

// management plans
import { ManagementPlanLNGDetailComponent } from '../management-plans/management-plan-lng-detail/management-plan-lng-detail.component';

// court convictions
import { CourtConvictionBCMIDetailComponent } from '../court-convictions/court-conviction-bcmi-detail/court-conviction-bcmi-detail.component';
import { CourtConvictionLNGDetailComponent } from '../court-convictions/court-conviction-lng-detail/court-conviction-lng-detail.component';
import { CourtConvictionNRCEDDetailComponent } from '../court-convictions/court-conviction-nrced-detail/court-conviction-nrced-detail.component';

// certificate amendment
import { CertificateAmendmentLNGDetailComponent } from '../certificate-amendments/certificate-amendments-lng-detail/certificate-amendments-lng-detail.component';
import { CertificateAmendmentBCMIDetailComponent } from '../certificate-amendments/certificate-amendments-bcmi-detail/certificate-amendments-bcmi-detail.component';

// correspondence
import { CorrespondenceNRCEDDetailComponent } from '../correspondences/correspondence-nrced-detail/correspondence-nrced-detail.component';
import { CorrespondenceBCMIDetailComponent } from '../correspondences/correspondence-bcmi-detail/correspondence-bcmi-detail.component';

// report
import { ReportNRCEDDetailComponent } from '../reports/report-nrced-detail/report-nrced-detail.component';
import { ReportBCMIDetailComponent } from '../reports/report-bcmi-detail/report-bcmi-detail.component';

// dam safety inspection
import { DamSafetyInspectionNRCEDDetailComponent } from '../dam-safety-inspections/dam-safety-inspection-nrced-detail/dam-safety-inspection-nrced-detail.component';
import { DamSafetyInspectionBCMIDetailComponent } from '../dam-safety-inspections/dam-safety-inspection-bcmi-detail/dam-safety-inspection-bcmi-detail.component';

// annual reports
import { AnnualReportBCMIDetailComponent } from '../annual-reports/annual-report-bcmi-detail/annual-report-bcmi-detail.component';

// other
import { RecordComponent } from './record-component';
import { ActDataServiceNRPTI } from '../../../../../global/src/lib/utils/act-data-service-nrpti';

export class RecordUtils {
  /**
   * Given a single record object, find the matching model based on the records _schemaName, and return a new instance.
   * Returns null if no matching model found.
   *
   * @static
   * @param {*} data
   * @returns {object} new instance of record model, or null.
   * @memberof RecordUtils
   */
  static getRecordModelInstance(data: any): object {
    if (!data || !data._schemaName) {
      return null;
    }

    // We can find and create the model instance via reflection
    // This only works when our Schema Name is IDENTICAL to the class name
    // So when creating new models/flavours for records, always ensure the class
    // name and schema name match, case sensitive.
    // If you're getting errors here, you've likely named your model class
    // something different, so make sure you fix the name so it matches your Schema
    return this.getReflectiveInstance(models, data._schemaName, data);
  }

  /**
   * Given a record type, return the matching detail component type, or null if no matching component found.
   * Returns null if no matching detail component found.
   *
   * @static
   * @param {string} recordType
   * @returns {Type<RecordComponent>} the record detail component, or null.
   * @memberof RecordUtils
   */
  static getRecordDetailComponent(recordType: string): Type<RecordComponent> {
    if (!recordType) {
      return null;
    }

    // we can't use a reflective visitor with these because
    // importing from RecordModule would cause circular dependencies.
    switch (recordType) {
      case 'OrderNRCED':
        return OrderNRCEDDetailComponent;
      case 'OrderLNG':
        return OrderLNGDetailComponent;
      case 'InspectionNRCED':
        return InspectionNRCEDDetailComponent;
      case 'InspectionLNG':
        return InspectionLNGDetailComponent;
      case 'CertificateLNG':
        return CertificateLNGDetailComponent;
      case 'PermitLNG':
        return PermitLNGDetailComponent;
      case 'AgreementLNG':
        return AgreementLNGDetailComponent;
      case 'SelfReportLNG':
        return SelfReportLNGDetailComponent;
      case 'RestorativeJusticeNRCED':
        return RestorativeJusticeNRCEDDetailComponent;
      case 'RestorativeJusticeLNG':
        return RestorativeJusticeLNGDetailComponent;
      case 'TicketLNG':
        return TicketLNGDetailComponent;
      case 'TicketNRCED':
        return TicketNRCEDDetailComponent;
      case 'AdministrativePenaltyLNG':
        return AdministrativePenaltyLNGDetailComponent;
      case 'AdministrativePenaltyNRCED':
        return AdministrativePenaltyNRCEDDetailComponent;
      case 'AdministrativePenaltyBCMI':
        return AdministrativePenaltyBCMIDetailComponent;
      case 'AdministrativeSanctionLNG':
        return AdministrativeSanctionLNGDetailComponent;
      case 'AdministrativeSanctionNRCED':
        return AdministrativeSanctionNRCEDDetailComponent;
      case 'WarningLNG':
        return WarningLNGDetailComponent;
      case 'WarningNRCED':
        return WarningNRCEDDetailComponent;
      case 'ConstructionPlanLNG':
        return ConstructionPlanLNGDetailComponent;
      case 'ManagementPlanLNG':
        return ManagementPlanLNGDetailComponent;
      case 'CourtConvictionBCMI':
        return CourtConvictionBCMIDetailComponent;
      case 'CourtConvictionLNG':
        return CourtConvictionLNGDetailComponent;
      case 'CourtConvictionNRCED':
        return CourtConvictionNRCEDDetailComponent;
      case 'CertificateAmendmentLNG':
        return CertificateAmendmentLNGDetailComponent;
      case 'CertificateAmendmentBCMI':
        return CertificateAmendmentBCMIDetailComponent;
      case 'CorrespondenceNRCED':
        return CorrespondenceNRCEDDetailComponent;
      case 'CorrespondenceBCMI':
        return CorrespondenceBCMIDetailComponent;
      case 'ReportNRCED':
        return ReportNRCEDDetailComponent;
      case 'ReportBCMI':
        return ReportBCMIDetailComponent;
      case 'DamSafetyInspectionNRCED':
        return DamSafetyInspectionNRCEDDetailComponent;
      case 'DamSafetyInspectionBCMI':
        return DamSafetyInspectionBCMIDetailComponent;
      case 'AnnualReportBCMI':
        return AnnualReportBCMIDetailComponent;
      default:
        return null;
    }
  }

  // links is an array of objects that contain documents without upfile and with url already populated.
  // documents is an array of objects that contain documents with upfile and without url.
  // documentsToDelete is an array of objectIds whicfh map to existing documents in the database.
  async handleDocumentChanges(links = [], documents = [], documentsToDelete = [], recordId, factoryService) {
    const promises = [];

    // Handle adding links
    links.forEach(async link => {
      const formData = new FormData();
      formData.append('fileName', link.fileName);
      formData.append('url', link.url);
      promises.push(factoryService.createDocument(formData, recordId));
    });

    // Handle adding S3 Docs
    documents.forEach(async doc => {
      const formData = new FormData();
      formData.append('fileName', doc.fileName);
      formData.append('upfile', doc.upfile);
      promises.push(factoryService.createDocument(formData, recordId));
    });

    // Handle deleting documents
    documentsToDelete.forEach(async docId => {
      promises.push(factoryService.deleteDocument(docId, recordId));
    });

    // Execute
    return Promise.all(promises).catch(e => {
      alert('Server Error: ' + e.error);
    });
  }

  parseResForErrors(res) {
    if (!res || !res.length || !res[0] || !res[0].length || !res[0][0]) {
      alert('Failed to save record.');
    }

    if (res[0][0].status === 'failure') {
      alert('Failed to save master record.');
    }

    if (res[0][0].flavours) {
      let flavourFailure = false;
      res[0][0].flavours.forEach(flavour => {
        if (flavour.status === 'failure') {
          flavourFailure = true;
        }
      });
      if (flavourFailure) {
        alert('Failed to save one or more flavour records');
      }
    }
  }

  static getReflectiveInstance(context: any, name: string, ...args: any[]) {
    const instance = Object.create(context[name].prototype);

    if (args) {
      instance.constructor.apply(instance, args);
    }

    return instance;
  }

  /**
   * Replaces the 'act' value in the given record object with a corresponding act code.
   * @param {Object} record - The object containing legislation information.
   * @param {ServiceFactory} factoryService - The service factory used to create data service instances.
   * @returns {void} Modifies the record object in place.
   */
  replaceActTitleWithCode(record, factoryService) {
    console.log("******replaceActTitleWithCode record : " + JSON.stringify(record));
    if (!record || !record.legislation || !record.legislation[0] || !record.legislation[0].act) {
      throw new Error('Missing or invalid record. Unable to read act name. Not using act code');
    }

    const actTitle = record.legislation[0].act;
    const dataservice = new ActDataServiceNRPTI(factoryService);
    const actCode = dataservice.getCodeFromTitle(actTitle);
    if (!actCode) {
      throw new Error('Act code not found for the given title. Not using act code');
    }
    record.legislation[0].act = actCode;
  }

  /**
   * Adds the act code to a list of act names for a search query
   * @param {Object} actsSTring - a string of comma-seperated act names.
   * @param {ServiceFactory} factoryService - The service factory used to create data service instances.
   * @returns {string} a string with comma-serparated act names followed by comma sperated act codes
   */
  appendActCodesToActNames(actsString, factoryService) {
    const dataservice = new ActDataServiceNRPTI(factoryService);
    const actList = actsString.split(',');
    actList.forEach(actName => {
      const actCode = dataservice.getCodeFromTitle(actName);
      if (actCode) {
        actsString += ',' + actCode;
      }
    });
    return actsString;
  }

  /**
   * Replaces the 'act' value in the given record object with a corresponding act code.
   * @param {string} actCode - an intermediate code mapped to a title
   * @param {ServiceFactory} factoryService - The service factory used to create data service instances.
   * @returns {string} The title associated with the act code
   */
  replaceActCodeWithTitle(actCode, factoryService) {
    if (!actCode) {
      return actCode;
    }
    const dataservice = new ActDataServiceNRPTI(factoryService);
    const actTitle = dataservice.displayActTitleFull(actCode);
    return actTitle;
  }
}
