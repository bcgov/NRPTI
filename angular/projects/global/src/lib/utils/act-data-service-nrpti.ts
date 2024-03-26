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
  getAllActsAndRegulations() {
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : {};
    return actsRegulationsMap;
  }
  getAllActs() {
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    if (!actsRegulationsMap) {
      return [];
    }
    return Object.keys(actsRegulationsMap).sort((a, b) => a.localeCompare(b));
  }
  getAllRegulations() {
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    if (!actsRegulationsMap) {
      return [];
    }
    const regulations = [];
    Object.keys(actsRegulationsMap).forEach(act => regulations.push(...actsRegulationsMap[act]));
    return Array.from(new Set<string>(regulations)).sort((a, b) => a.localeCompare(b));
  }
  getLegislationRegulationsMappedToActs = function(factoryService: any): { [key: string]: string[] } {
    const actService = this.factoryService.actService;
    if (!actService) {
      // Return an empty object or handle the lack of actService appropriately
      console.error('ActService is not available.');
      return {};
    }
    const actsRegulationsMap = actService.getAllActsAndRegulations();
    const regulationsMappedToActs: { [key: string]: string[] } = {};

    for (const act in actsRegulationsMap) {
      if (actsRegulationsMap.hasOwnProperty(act)) {
        const regulations = actsRegulationsMap[act];
        for (const regulation of regulations) {
          if (!regulationsMappedToActs[regulation]) {
            regulationsMappedToActs[regulation] = [];
          }
          regulationsMappedToActs[regulation].push(act);
        }
      }
    }

    return regulationsMappedToActs;
  };
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
