import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';
import { News } from '../../../../common/src/app/models/master/common-models/news';
import { of } from 'rxjs';

@Injectable()
export class NewsResolver implements Resolve<Observable<object>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const newsId = route.paramMap.get('newsId');
    const newsType = route.paramMap.get('newsType');

    let schemaName = '';

    switch (newsType) {
      case 'lng': {
        schemaName = 'ActivityLNG';
      } break;
      case 'nrced': {
        // TODO
        schemaName = 'ActivityNRCED';
      } break;
      default: {
        // TODO
      }
    }
    if (newsId === null) {
      return of(new News({_schemaName: schemaName, system: newsType}));
    }

    return this.factoryService.getRecord(newsId, schemaName);
  }
}
