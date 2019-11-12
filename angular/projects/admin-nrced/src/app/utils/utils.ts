import moment from 'moment';
import _ from 'lodash';

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
    _.each(collection, a => {
      values += a + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }

  /**
   * Turns a non-null date into a formatted date string, or else returns null.
   *
   * @static
   * @param {Date} [date=null] a Date.
   * @returns {string}  formatted date string, or null.
   * @memberof Utils
   */
  static getFormattedDate(date: Date = null): string {
    if (!Date) {
      return null;
    }

    return moment(date).format('YYYY-MM-DD');
  }
}
