const ApplicationAgencies = {
  AGENCY_ALC: 'Agricultural Land Commission',
  AGENCY_WF: 'BC Wildfire Service',
  AGENCY_ENV_COS: 'Conservation Officer Service',
  AGENCY_EAO: 'Environmental Assessment Office',
  AGENCY_EMLI: 'Ministry of Energy Mines and Low Carbon Innovation',
  AGENCY_ENV: 'Ministry of Environment and Climate Change Strategy',
  AGENCY_ENV_BCPARKS: 'BC Parks',
  AGENCY_OGC: 'BC Energy Regulator',
  AGENCY_ENV_EPD: 'Ministry of Environment and Climate Change Strategy',
  AGENCY_LNG: 'LNG Secretariat',
  AGENCY_AGRI: 'Ministry of Agriculture and Food',
  AGENCY_FLNRO: 'Ministry of Forests',
  AGENCY_FLNR_NRO: 'Natural Resource Officers',
  AGENCY_WLRS: 'Ministry of Water, Land and Resource Stewardship',
};

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


  static displayNameFull(agency): string {
    switch (agency) {
      case ApplicationAgencies.AGENCY_AGRI:
        return 'Ministry of Agriculture and Food';
      case ApplicationAgencies.AGENCY_EMLI:
        return 'Ministry of Energy, Mines, and Low Carbon Innovation';
      case ApplicationAgencies.AGENCY_FLNRO:
        return 'Ministry of Forests';
      default:
        return agency;
    }
  }

  static displayNameAcronym(agency): string {
    switch (agency) {
      case ApplicationAgencies.AGENCY_EAO:
        return 'EAO';
      case ApplicationAgencies.AGENCY_EMLI:
        return 'EMLI';
      case ApplicationAgencies.AGENCY_FLNRO:
        return 'FLNRO';
      case ApplicationAgencies.AGENCY_ENV:
        return 'ENV';
      default:
        return agency;
    }
  }
}
