import { FactoryService } from '../../../../admin-nrpti/src/app/services/factory.service';

export class AgencyDataService {
  constructor(
    private factoryService: FactoryService,
  ) {}

  displayNameFull(agencyCode): string {
    // Access cached agency data from FactoryService
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    return agencyList && agencyList[agencyCode] ? agencyList[agencyCode] : agencyCode;
  }

  getAgencyCodes(): string[] {
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    return agencyList ? Object.keys(agencyList) : [];
  }

  getAgencyNames(): string[] {
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    return agencyList ? Object.values(agencyList) : [];
  }

  getAgencyCode(agencyName: string): string {
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    if (agencyList) {
      for (const key in agencyList) {
        if (agencyList.hasOwnProperty(key) && agencyList[key] === agencyName) {
          return key; // Return the key if the value matches
        }
      }
    }
    // Return a default value or handle the case where agencyList is undefined or empty
    return '';
  }

}