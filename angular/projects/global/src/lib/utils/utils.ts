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
   * Wraps a function in a debounce function, which prevents it from being called until a delay period has elapsed.
   * Repeated calls within the delay period will reset the delay.
   *
   * @static
   * @param {*} delay delay in milliseconds between calls that must elapse before the function will be executed
   * @param {*} fn function to debounce
   * @returns {(...args) => any}
   * @memberof Utils
   */
  public debounced(delay, fn): (...args) => any {
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
   * @returns {(...args) => any}
   * @memberof Utils
   */
  public throttled(delay, fn): (...args) => any {
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

  static convertAcronyms(acronym): string {
    if (acronym && acronym === 'EAO') {
      return 'Environmental Assessment Office';
    } else if (acronym && acronym === 'EMLI') {
      return 'Ministry of Energy, Mines, and Low Carbon Innovation';
    } else {
      return acronym;
    }
  }
}
