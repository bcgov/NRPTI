import { Legislation } from '../models/master/common-models/legislation';
import { FactoryService as FactoryServiceNRPTI } from '../../../../../projects/admin-nrpti/src/app/services/factory.service';
import { ActDataServiceNRCED } from '../../../../../projects/global/src/lib/utils/act-data-service-nrced';
import { FactoryService as FactoryServiceNRCED } from '../../../../public-nrpti/src/app/services/factory.service';
import { ActDataServiceNRPTI } from '../../../../global/src/lib/utils/act-data-service-nrpti';

export class Utils {
  /**
   * Given a Legislation object, return a formatted legislation string.
   *
   * @param {Legislation} obj
   * @returns {string} formatted legislation string, or empty string if no legislation values are set.
   * @memberof Utils
   */
  public static buildLegislationString(obj: Legislation, factoryService: any): string {
    if (!obj) {
      return '';
    }

    const legistrationStrings = [];
    if (obj.act) {
      if (this.isActCode(obj.act)) {
        let actDataService;
        switch (true) {
          case factoryService instanceof FactoryServiceNRPTI:
            actDataService = new ActDataServiceNRPTI(factoryService);
            break;
          case factoryService instanceof FactoryServiceNRCED:
            actDataService = new ActDataServiceNRCED(factoryService);
            break;
          default:
            break;
        }
        const actName = actDataService.displayActTitleFull(obj.act);
        legistrationStrings.push(actName);
      } else {
        legistrationStrings.push(obj.act);
      }
    }

    if (obj.regulation) {
      legistrationStrings.push(obj.regulation);
    }

    if (obj.section) {
      legistrationStrings.push(obj.section);
    }

    if (obj.subSection) {
      legistrationStrings.push(`(${obj.subSection})`);
    }

    if (obj.paragraph) {
      legistrationStrings.push(`(${obj.paragraph})`);
    }

    return legistrationStrings.join(' ');
  }

  public static setDocumentForm(newDocuments) {
    const docForms = [];
    newDocuments.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('fileName', doc.fileName);
      docForms.push(formData);
    });
    return docForms;
  }

  public static setLinkForm(newLinks) {
    const docForms = [];
    newLinks.map(doc => {
      const formData = new FormData();
      formData.append('fileName', doc.fileName);
      formData.append('url', doc.url);
      docForms.push(formData);
    });
    return docForms;
  }

  /**
   * Check if a value is an object.
   *
   * @param {*} obj
   * @returns True if the value is an object, false otherwise.
   */
  public static isObject(obj) {
    return obj && typeof obj === 'object' && obj.constructor.name === 'Object';
  }

  /**
   * Check if an act value is an act code
   *
   * @param {string} act a string value that should be the actName
   * @returns {boolean} if the value is an act code, return true. Else false.
   */
  private static isActCode(act) {
    const ACT_CODE_BEGINNING = 'ACT_';
    return act.substring(0, ACT_CODE_BEGINNING.length) === ACT_CODE_BEGINNING;
  }
}
