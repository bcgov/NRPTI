import { Pipe, PipeTransform } from '@angular/core';

import { StoreService, ConfigService, LoggerService } from 'nrpti-angular-components';

/**
 * Replace project names with links to LNG or CGL sites
 *
 * @export
 * @class LinkifyPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'projectLink' })
export class ProjectLinkPipe implements PipeTransform {
  constructor(
    private storeService: StoreService,
    private configService: ConfigService,
    private logger: LoggerService
  ) {}

  transform(str: string): string {
    if (!str) {
      return '';
    }

    try {
      const env = this.configService.config.ENVIRONMENT;
      const lngUrl = this.configService.config.APPLICATION_URLS.lng[env];
      const bcmiUrl = this.configService.config.APPLICATION_URLS.bcmi[env];

      const mines = this.storeService.getItem('mines') || [];
      const bcmiMine = mines.find(mine => mine.name === str);

      if (str === 'LNG Canada') {
        return `<a href="${lngUrl}/project/1/overview" target="_blank">${str}</a>`;
      }

      if (str === 'Coastal Gaslink') {
        return `<a href="${lngUrl}/project/2/overview" target="_blank">${str}</a>`;
      }

      if (bcmiMine) {
        return `<a href="${bcmiUrl}/p/${bcmiMine._id}/overview" target="_blank">${str}</a>`;
      }
    } catch {
      this.logger.error('Error determining application URLs.');
    }

    return str;
  }
}
