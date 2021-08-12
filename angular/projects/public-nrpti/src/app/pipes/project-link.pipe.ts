import { Pipe, PipeTransform } from '@angular/core';

import { StoreService, ConfigService } from 'nrpti-angular-components';

/**
 * Replace project names with links to LNG or CGL sites
 *
 * @export
 * @class LinkifyPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'projectLink' })
export class ProjectLinkPipe implements PipeTransform {
  constructor(private storeService: StoreService, private configService: ConfigService) {}

  transform(str: string): string {
    if (!str) {
      return '';
    }

    const mines = this.storeService.getItem('mines') || [];
    const bcmiMine = mines.find(mine => mine.name === str);

    if (str === 'LNG Canada') {
      return `<a href="https://lng.gov.bc.ca/project/1/overview" target="_blank">${str}</a>`;
    }

    if (str === 'Coastal Gaslink') {
      return `<a href="https://lng.gov.bc.ca/project/2/overview" target="_blank">${str}</a>`;
    }

    if (bcmiMine) {
      if (this.configService.config.ENVIRONMENT) {
        switch (this.configService.config.ENVIRONMENT) {
          case 'prod':
            return `<a href="https://mines.nrs.gov.bc.ca/p/${bcmiMine._id}/overview" target="_blank">${str}</a>`;
          case 'test':
            return `<a href="https://bcmi-f00029-test.apps.silver.devops.gov.bc.ca/p/${bcmiMine._id}/overview" target="_blank">${str}</a>`;
          default:
            return `<a href="https://bcmi-f00029-dev.apps.silver.devops.gov.bc.ca/p/${bcmiMine._id}/overview" target="_blank">${str}</a>`;
        }
      }
    }

    return str;
  }
}
