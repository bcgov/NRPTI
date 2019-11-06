import { Pipe, PipeTransform } from '@angular/core';
import LinkifyIt from 'linkify-it';

/**
 * Finds custom url patterns and replaces them with anchor tags.
 *
 * Examples - Before and after applying the linkify pipe.
 *
 * Standard urls with custom text:
 *  - "This is a string with a [standard url](https://www.standard-url.com) in it."
 *  - "This is a string with a <a href="https://https://www.standard-url.com)" target="_blank">standard url</a> in it."
 *
 * Relative urls with custom text:
 *  - "This is a string with a [relative url](/project/123/documents) in it."
 *  - "This is a string with a <a href="http://localhost:4300/project/123/documents" target="_blank">relative url</a> in it."
 *
 * @export
 * @class LinkifyPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
  transform(str: string | string[]): string | string[] {
    if (!str) {
      return '';
    }

    if (typeof str === 'string') {
      return this.linkifyString(str);
    }

    return this.linkifyStringArray(str);
  }

  /**
   * Linkify's a single string.
   *
   * @private
   * @param {string} str
   * @returns {string}
   * @memberof LinkifyPipe
   */
  private linkifyString(str: string): string {
    return this.convertCustomURLs(str);
  }

  /**
   * Linkify's an array of strings.
   *
   * @private
   * @param {string[]} str
   * @returns {string[]}
   * @memberof LinkifyPipe
   */
  private linkifyStringArray(str: string[]): string[] {
    const newStringArray: string[] = [];

    str.forEach(line => {
      newStringArray.push(this.linkifyString(line));
    });

    return newStringArray;
  }

  /**
   * Finds and convert all relative urls to anchor tags.
   * These relative urls are specified/found using a regex pattern: [LinkName](Standard_or_Relative_URL)
   *
   * @private
   * @param {string} str
   * @returns {string}
   * @memberof LinkifyPipe
   */
  private convertCustomURLs(str: string): string {
    const customURLMatch = str.match(/\[(.*)\]\((.*)\)/);

    if (customURLMatch) {
      const entireMatchedPattern = customURLMatch[0];
      const matchText = customURLMatch[1];
      const matchUrl = customURLMatch[2];

      const linkify = new LinkifyIt();
      const linkifyMatches = linkify.match(customURLMatch[2]);

      if (linkifyMatches && linkifyMatches.length) {
        str = str.replace(entireMatchedPattern, `<a href="${linkifyMatches[0].url}" target="_blank">${matchText}</a>`);
      } else {
        const urlWithHost = new URL(matchUrl, window.location.origin);
        str = str.replace(entireMatchedPattern, `<a href="${urlWithHost.href}" target="_blank">${matchText}</a>`);
      }
    }

    return str;
  }
}
