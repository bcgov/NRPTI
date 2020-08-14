import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../../services/factory.service';
import { SearchResults } from 'nrpti-angular-components';

@Injectable()
export class CertificateAmendmentResolver implements Resolve<Observable<SearchResults[]>> {
  constructor(private factoryService: FactoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SearchResults[]> {
    const certificateAmendmentId = route.paramMap.get('certificateAmendmentId');
    return this.factoryService.getRecordWithFlavours(certificateAmendmentId, 'CertificateAmendment');
  }
}
