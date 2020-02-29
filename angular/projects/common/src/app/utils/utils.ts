import { Legislation } from '../models/master/common-models/legislation';
import { Entity } from '../models/master/common-models/entity';
import { ENTITY_TYPE } from './entity-type-enum';

export class Utils {
  /**
   * Given a Legislation object, return a formatted legislation string.
   *
   * @param {Legislation} obj
   * @returns {string} formatted legislation string, or empty string if no legislation values are set.
   * @memberof Utils
   */
  public static buildLegislationString(obj: Legislation): string {
    if (!obj) {
      return '';
    }

    const legistrationStrings = [];

    if (obj.act) {
      legistrationStrings.push(obj.act);
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

  /**
   * Given an Entity object, return a formatted entity name string.
   *
   * @static
   * @param {Entity} obj
   * @returns {string} formatted entity string, or empty string if no entity values are set.
   * @memberof Utils
   */
  public static buildEntityString(obj: Entity): string {
    if (!obj) {
      return '';
    }

    if (obj.type === ENTITY_TYPE.Company) {
      return obj.companyName;
    }

    if (obj.type === ENTITY_TYPE.IndividualCombined) {
      return obj.fullName;
    }

    if (!obj.firstName && !obj.middleName && !obj.lastName) {
      return '';
    }

    if (obj.type === ENTITY_TYPE.Individual) {
      return [[obj.lastName || '-', obj.firstName || '-'].join(', '), obj.middleName || '-'].join(' ');
    }
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
}
