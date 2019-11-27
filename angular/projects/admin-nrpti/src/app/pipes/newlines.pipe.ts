import { Pipe, PipeTransform } from '@angular/core';

/**
 * Finds '\n' characters in a string and replaces them with html <br> tags.
 *
 * @export
 * @class NewlinesPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'newlines' })
export class NewlinesPipe implements PipeTransform {
  /**
   * Finds '\n' characters in a string and replaces them with html <br> tags.
   *
   * @param {string} str string to find and replace newlines in.
   * @returns {string}
   * @memberof NewlinesPipe
   */
  transform(str: string): string {
    if (!str) {
      return '';
    }

    return str.replace(/\n/g, '<br>');
  }
}
