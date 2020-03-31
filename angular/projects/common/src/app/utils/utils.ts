import { Legislation } from '../models/master/common-models/legislation';

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
}
