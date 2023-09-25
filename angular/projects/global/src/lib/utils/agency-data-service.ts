import { FactoryService } from '../../../../admin-nrpti/src/app/services/factory.service';

export class AgencyDataService {
  constructor(
    private factoryService: FactoryService,
  ) {}

  displayNameFull(agencyCode): string {
    // Access cached agency data from FactoryService
    const agencyList = this.factoryService.applicationAgencyService.getAgencies();
    return agencyList[agencyCode] || agencyCode;
  }

  getAgencyCodes(): string[] {
    const agencyList = this.factoryService.applicationAgencyService.getAgencies();
    return Object.keys(agencyList);
  }

  getAgencyNames(): string[] {
    const agencyList = this.factoryService.applicationAgencyService.getAgencies();
    return Object.values(agencyList);
  }

  getAgencyCode(agencyName: string): string {
    const agencyList = this.factoryService.applicationAgencyService.getAgencies();
    for (const key in agencyList) {
      if (agencyList.hasOwnProperty(key) && agencyList[key] === agencyName) {
        return key; // Return the key if the value matches
      }
    }
  }
}
