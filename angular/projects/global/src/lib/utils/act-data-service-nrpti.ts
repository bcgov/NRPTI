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
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    console.log('getAllActsAndRegulations actInfo>>>' + JSON.stringify(actsRegulationsMap));
    return actsRegulationsMap;
  }
  getAllActs() {
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    console.log('getAllActs actInfo>>>' + JSON.stringify(actsRegulationsMap));
    return Object.keys(actsRegulationsMap).sort((a, b) => a.localeCompare(b));
  }
  getAllRegulations() {
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    console.log('getAllActs actInfo>>>' + JSON.stringify(actsRegulationsMap));
    // return Object.keys(actsRegulationsMap).sort((a, b) => a.localeCompare(b));

    const regulations = [];

    Object.keys(actsRegulationsMap).forEach(act => regulations.push(...actsRegulationsMap[act]));

    return Array.from(new Set<string>(regulations)).sort((a, b) => a.localeCompare(b));
  }
  getLegislationRegulationsMappedToActs = function(factoryService: any): { [key: string]: string[] } {
    {
      const actService = this.factoryService.actService;
      const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
      console.log('getAllActsAndRegulations actInfo>>>' + JSON.stringify(actsRegulationsMap));
      //  return actsRegulationsMap;
      const regulations = {};

      Object.keys(actsRegulationsMap).forEach(act =>
        actsRegulationsMap[act].map(regulation => {
          if (regulations[regulation]) {
            regulations[regulation].push(act);
          } else {
            regulations[regulation] = [act];
          }
        })
      );

      return regulations;
    }
  };
}
