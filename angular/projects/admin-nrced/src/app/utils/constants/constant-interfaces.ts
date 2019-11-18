/**
 * A basic code set, which contains all codes as static items, and helper methods for fetching the codes.
 *
 * @export
 * @interface ICodeSet
 */
export interface ICodeSet {
  /**
   * Convenience method to return an array of all available code groups in the set.
   *
   * @memberof ICodeSet
   */
  getCodeGroups: () => ICodeGroup[];
}

/**
 * A basic code group, which contains all information associated with a code.
 *
 * @export
 * @interface ICodeGroup
 */
export interface ICodeGroup {
  /**
   * A string that uniquely identifies this code group.
   *
   * @type {string}
   * @memberof ICodeGroup
   */
  code: string;

  /**
   * A shorthand value, with no spaces or special characters, useful when building url query parameters.
   *
   * Note: must be unique.
   *
   * @type {string}
   * @memberof ICodeGroup
   */
  param: string;

  /**
   * Human friendly strings, in both long and short forms.
   *
   * @type {{ short: string; long: string }}
   * @memberof ICodeGroup
   */
  text: { short: string; long: string };

  /**
   * Child code values. Child codes that are grouped under this parent code.
   *
   * Useful if you want to support multiple external codes, but internally map them to one parent code and have all
   * logic work off of the parent code.
   *
   * @type {string[]}
   * @memberof ICodeGroup
   */
  mappedCodes: string[];
}
