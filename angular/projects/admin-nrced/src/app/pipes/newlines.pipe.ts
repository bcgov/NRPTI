import { Pipe, PipeTransform } from '@angular/core';

/**
 * Finds text '\n' characters and replaces them with html <br> tags.
 *
 * @export
 * @class NewlinesPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'newlines' })
export class NewlinesPipe implements PipeTransform {
  transform(str: string): string {
    if (!str) {
      return '';
    }

    return str.replace(/\n/g, '<br>');
  }
}
