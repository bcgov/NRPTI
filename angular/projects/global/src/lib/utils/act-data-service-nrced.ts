/**
 * @summary service for accessing issuing agencies.
 * @description the service provides methods for getting agency codes and names from ApplicationAgencyService.
 * @class AgencyDataService
 */

import { FactoryService } from '../../../../public-nrpti/src/app/services/factory.service';

/**
 * @class
 * @description Service for accessing issuing agencies from ApplicationAgencyService.
 */
export class ActDataServiceNRCED {
  /**
   * @constructor
   * @param {FactoryService} factoryService - the factory service for accessing application agency data.
   */
  constructor(private factoryService: FactoryService) {}

  /**
   * Get all Acts and Regulations
   * @returns {[string: string]}
   */

  getAllActsAndRegulations() {
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : {};
    return actsRegulationsMap;
  }

  /**
   * Get the full name of the agency based on the agency's code
   * retrieved from the agency data using the FactoryService.
   * @param {string} actCode - an agency's code
   * @returns {string} - the agency's full name
   */
  displayActTitleFull(actCode): string {
    // Access cached act data from FactoryService
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : {};
    return actsRegulationsMap && actsRegulationsMap[actCode] ? actsRegulationsMap[actCode] : actCode;
  }
}
