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
}
