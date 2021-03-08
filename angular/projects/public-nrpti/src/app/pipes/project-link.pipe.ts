import { Pipe, PipeTransform } from '@angular/core';

/**
 * Replace project names with links to LNG or CGL sites
 *
 * @export
 * @class LinkifyPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'projectLink' })
export class ProjectLinkPipe implements PipeTransform {
  transform(str: string): string {
    if (!str) {
      return '';
    }

    if (str === 'LNG Canada') {
      return `<a href="https://lng.gov.bc.ca/project/1/overview" target="_blank">${str}</a>`;
    }

    if (str === 'Coastal Gaslink') {
      return `<a href="https://lng.gov.bc.ca/project/2/overview" target="_blank">${str}</a>`;
    }

    return str;
  }
}
