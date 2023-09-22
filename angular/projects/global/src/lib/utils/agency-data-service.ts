import { FactoryService } from '../../../../admin-nrpti/src/app/services/factory.service';

export class AgencyDataService {
  constructor(
    private factoryService: FactoryService,
  ) {}

  displayNameFull(agencyCode): string {
    // Access cached agency data from FactoryService
    const agencyList = this.factoryService.agencyData;
    return agencyList[agencyCode] || agencyCode;
  }
}
