import { Pipe, PipeTransform } from '@angular/core';

/**
 * Filters out non-matching strings from a string array.
 *
 * @export
 * @class ObjectFilterPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'objectFilter' })
export class ObjectFilterPipe implements PipeTransform {
  /**
   * Returns a filtered array of strings, removing any values that do not match the filterString provided.
   *
   * Note: performs filtering against the lowercase version of each string.
   *
   * @param {any[]} strings string array to filter out non-matching values.
   * @param {string} filterString string value used to determine non-matching values.
   * @returns
   * @memberof ObjectFilterPipe
   */
  transform(strings: any[], filterString: string) {
    if (!filterString || filterString === '') {
      return strings;
    }

    return strings.filter(item => -1 < item.name.toLowerCase().indexOf(filterString.toLowerCase()));
  }
}
