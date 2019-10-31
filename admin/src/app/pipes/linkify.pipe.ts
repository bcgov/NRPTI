import { Pipe, PipeTransform } from '@angular/core';
import * as LinkifyIt from 'linkify-it';

/**
 * Finds urls and replaces them with anchor tags.
 *
 * @export
 * @class LinkifyPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
  transform(str: string): string {
    if (!str) {
      return '';
    }

    const linkify = new LinkifyIt();

    const matches = linkify.match(str);
    if (matches) {
      matches.forEach(match => {
        str = str.replace(match.text, `<a href="${match.url}" target="_blank">${match.text}</a>`);
      });
    }
    return str;
  }
}
