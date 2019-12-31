import { DemoCodes } from './record-constants';
import { ICodeSet, ICodeGroup } from './constant-interfaces';

/**
 * Enum of supported code sets.
 *
 * @export
 * @enum {number}
 */
export enum CodeType {
  DEMO
}

/**
 * Util methods for fetching codes and their various pieces of related information.
 *
 * @export
 * @class ConstantUtils
 */
export class ConstantUtils {
  /**
   * Returns the code set that matches the given code type, or null if no match found.
   *
   * @static
   * @param {CodeType} codeType which group of codes to return.
   * @returns {ICodeSet}
   * @memberof ConstantUtils
   */
  public static getCodeSet(codeType: CodeType): ICodeSet {
    switch (codeType) {
      case CodeType.DEMO:
        return new DemoCodes();
      default:
        return null;
    }
  }

  /**
   * Returns the code group for the given code type and search string, or null if none found.
   *
   * This should only be used if you need to handle dynamic codes.
   * If you know exactly what code you need, reference it directly.
   *
   * @static
   * @param {CodeType} codeType which group of codes to search for a possible match.
   * @param {string} searchString either a group, code, long, short, or mapped status string. (case insensitive)
   * @returns {ICodeGroup}
   * @memberof ConstantUtils
   */
  public static getCodeGroup(codeType: CodeType, searchString: string): ICodeGroup {
    if (!searchString) {
      return null;
    }

    const codeSet: ICodeSet = this.getCodeSet(codeType);

    if (!codeSet) {
      return null;
    }

    const codeGroups = codeSet.getCodeGroups();

    for (const codeGroup of codeGroups) {
      searchString = searchString.toUpperCase();
      if (
        codeGroup.code.toUpperCase() === searchString ||
        codeGroup.param.toUpperCase() === searchString ||
        codeGroup.text.short.toUpperCase() === searchString ||
        codeGroup.text.long.toUpperCase() === searchString ||
        codeGroup.mappedCodes.map(code => code.toUpperCase()).includes(searchString)
      ) {
        return codeGroup;
      }
    }

    return null;
  }

  /**
   * Returns the code groups code value.
   *
   * @static
   * @param {CodeType} codeType which group of codes to search for a possible match.
   * @param {string} searchString either a group, code, long, short, or mapped status string.
   * @returns {string}
   * @memberof ConstantUtils
   */
  static getCode(codeType: CodeType, searchString: string): string {
    if (!searchString) {
      return null;
    }

    const codeGroup: ICodeGroup = this.getCodeGroup(codeType, searchString);

    if (!codeGroup) {
      return null;
    }

    return codeGroup.code;
  }

  /**
   * Returns the code groups param value.
   *
   * @static
   * @param {CodeType} codeType which group of codes to search for a possible match.
   * @param {string} searchString either a group, code, long, short, or mapped status string.
   * @returns {string}
   * @memberof ConstantUtils
   */
  static getParam(codeType: CodeType, searchString: string): string {
    if (!searchString) {
      return null;
    }

    const codeGroup: ICodeGroup = this.getCodeGroup(codeType, searchString);

    if (!codeGroup) {
      return null;
    }

    return codeGroup.param;
  }

  /**
   * Returns the code groups short string.
   *
   * @static
   * @param {CodeType} codeType which group of codes to search for a possible match.
   * @param {string} searchString either a group, code, long, short, or mapped status string.
   * @returns {string}
   * @memberof ConstantUtils
   */
  static getTextShort(codeType: CodeType, searchString: string): string {
    if (!searchString) {
      return null;
    }

    const codeGroup: ICodeGroup = this.getCodeGroup(codeType, searchString);

    if (!codeGroup) {
      return null;
    }

    return codeGroup.text.short;
  }

  /**
   * Returns teh code groups long string.
   *
   * @static
   * @param {CodeType} codeType which group of codes to search for a possible match.
   * @param {string} searchString either a group, code, long, short, or mapped status string.
   * @returns {string}
   * @memberof ConstantUtils
   */
  static getTextLong(codeType: CodeType, searchString: string): string {
    if (!searchString) {
      return null;
    }

    const codeGroup: ICodeGroup = this.getCodeGroup(codeType, searchString);

    if (!codeGroup) {
      return null;
    }

    return codeGroup.text.long;
  }

  /**
   * Returns an array of mapped strings associated with the code.
   *
   * @static
   * @param {CodeType} codeType which group of codes to search for a possible match.
   * @param {string} searchString either a group, code, long, short, or mapped status string.
   * @returns {string[]}
   * @memberof ConstantUtils
   */
  static getMappedCodes(codeType: CodeType, searchString: string): string[] {
    if (!searchString) {
      return null;
    }

    const codeGroup: ICodeGroup = this.getCodeGroup(codeType, searchString);

    if (!codeGroup) {
      return null;
    }

    return codeGroup.mappedCodes;
  }
}
