/**
 * @summary service for accessing issuing agencies.
 * @description the service provides methods for getting agency codes and names from ApplicationAgencyService.
 * @class AgencyDataService
 */

import { FactoryService } from '../../../../admin-nrpti/src/app/services/factory.service';

/**
 * @class
 * @description Service for accessing issuing agencies from ApplicationAgencyService.
 */
export class AgencyDataService {
  /**
   * @constructor
   * @param {FactoryService} factoryService - the factory service for accessing application agency data.
   */
  constructor(private factoryService: FactoryService) {}

  /**
   * Get the full name of the agency based on the agency's code
   * retrieved from the agency data using the FactoryService.
   * @param {string} agencyCode - an agency's code
   * @returns {string} - the agency's full name
   */
  displayNameFull(agencyCode): string {
    // Access cached agency data from FactoryService
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    return agencyList && agencyList[agencyCode] ? agencyList[agencyCode] : agencyCode;
  }

  /**
   * Get an array of agency codes.
   * @returns {string[]} - an array of agency codes
   */
  getAgencyCodes(): string[] {
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    return agencyList ? Object.keys(agencyList) : [];
  }

  /**
   * Get an array of agency names.
   * @returns {string[]} - an array of agency names
   */
  getAgencyNames(): string[] {
    const agencyService = this.factoryService.applicationAgencyService;
    const agencyList = agencyService ? agencyService.getAgencies() : null;

    return agencyList ? Object.values(agencyList) : [];
  }

  /**
   * Get the agency code based on the agency's name
   * @param {string} agencyName - the name of an agency
   * @returns {string} - the agency's code
   */
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
