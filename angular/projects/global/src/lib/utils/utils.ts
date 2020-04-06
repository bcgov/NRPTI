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

  /**
   * Wraps a function in a debounce function, which prevents it from being called until a delay period has elapsed.
   * Repeated calls within the delay period will reset the delay.
   *
   * @static
   * @param {*} delay delay in milliseconds between calls that must elapse before the function will be executed
   * @param {*} fn function to debounce
   * @returns {() => any}
   * @memberof Utils
   */
  public debounced(delay, fn): () => any {
    let timerId;

    return (...args) => {
      if (timerId) {
        clearTimeout(timerId);
      }

      timerId = setTimeout(() => {
        fn(...args);
        timerId = null;
      }, delay);
    };
  }

  /**
   * Wraps a function in a throttle function, which prevents it from being called again until a delay period has
   * elapsed. Repeated calls within the delay period will be ignored.
   *
   * @static
   * @param {*} delay delay in milliseconds between calls that must elapse before the function will be executed again
   * @param {*} fn function to throttle
   * @returns {() => any}
   * @memberof Utils
   */
  public throttled(delay, fn): () => any {
    let lastCall = 0;

    return (...args) => {
      const now = new Date().getTime();

      if (now - lastCall < delay) {
        return;
      }

      lastCall = now;

      return fn(...args);
    };
  }
}
