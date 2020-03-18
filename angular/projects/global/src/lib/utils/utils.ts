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

  public convertJSDateToNGBDate(jSDate: Date) {
    if (!jSDate) {
      return null;
    }

    return {
      year: jSDate.getFullYear(),
      month: jSDate.getMonth() + 1,
      day: jSDate.getDate()
    };
  }

  public convertJSDateToString(jSDate: Date) {
    if (!jSDate) {
      return null;
    }

    return `${jSDate.getFullYear()}-${jSDate.getMonth() + 1}-${jSDate.getDate()}`;
  }

  public convertFormGroupNGBDateToJSDate(nGBDate, nGBTime = null) {
    if (!nGBDate) {
      return null;
    }

    if (nGBTime === null) {
      return new Date(nGBDate.year, nGBDate.month - 1, nGBDate.day);
    } else {
      return new Date(nGBDate.year, nGBDate.month - 1, nGBDate.day, nGBTime.hour, nGBTime.minute);
    }
  }

  /**
   * Add a key:value to an object.
   *
   * Only works for root level properties.
   *
   * @param {object} obj
   * @param {string} key
   * @param {string} value
   * @returns the modified object.
   * @memberof Utils
   */
  public addKeyValueToObject(obj: object, key: string, value: string) {
    if (obj && key) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Remove a key from an object.
   *
   * Only works for root level properties.
   *
   * @param {object} obj
   * @param {string} key
   * @returns the modified object.
   * @memberof Utils
   */
  public removeKeyFromObject(obj: object, key: string) {
    if (obj && key) {
      delete obj[key];
    }
    return obj;
  }
}
