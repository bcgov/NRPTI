/**
 * General purpose utils.
 *
 * @export
 * @class Utils
 */
export class Utils {
  /**
   * Turns an array of strings into a single string where each element is deliminited with a pipe character.
   *
   * Example: ['dog', 'cat', 'bird'] => 'dog|cat|bird|'
   *
   * @param {any[]} collection an array of strings to concatenate.
   * @returns {string} pipe delimited string.
   * @memberof Utils
   */
  static convertArrayIntoPipeString(collection: string[]): string {
    let values = '';
    for (const value of collection) {
      values += value + '|';
    }
    // trim the last |
    return values.replace(/\|$/, '');
  }
}
