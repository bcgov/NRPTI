/**
 * @summary service for accessing issuing agencies.
 * @description the service provides methods for getting agency codes and names from ApplicationAgencyService.
 * @class AgencyDataService
 */

import { FactoryService } from "../../../../admin-nrpti/src/app/services/factory.service";

/**
 * @class
 * @description Service for accessing issuing agencies from ApplicationAgencyService.
 */
export class ActDataServiceNRPTI {
  /**
   * @constructor
   * @param {FactoryService} factoryService - the factory service for accessing application agency data.
   */
  constructor(private factoryService: FactoryService) {}

  /**
   * Get all the acts and regulations
   * retrieved from the act data using the FactoryService.
   * @returns {string: [string]} - All Acts and Regulations
   */
  getAllActsAndRegulations(){
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    console.log('getActTitle actInfo>>>' + JSON.stringify(actsRegulationsMap));
    return actsRegulationsMap;
  }
}
