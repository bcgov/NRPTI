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
    const actsRegulationsData = actService ? actService.getAllActsAndRegulations() : null;
    if(actsRegulationsData){
      const actsRegulationsMap = Object.keys(actsRegulationsData).reduce((acc, key) => {
        const { actName, regulations } = actsRegulationsData[key];
        acc[actName] = regulations;
        return acc;
      }, {});
      return actsRegulationsMap;
    } else {return {};}
  }

  /**
   * Get all the act names
   * retrieved from the act data using the FactoryService.
   * @returns {[string]} - An array with all the act names
   */
  getAllActs() {
    const actService = this.factoryService.actService;
    const actsRegulationsData = actService ? actService.getAllActsAndRegulations() : null;
    if (!actsRegulationsData) {
      return [];
    }
    let actsList = Object.values(actsRegulationsData).map( (act : any) => act.actName);
    return actsList.sort((a, b) => a.localeCompare(b));
  }

    /**
   * Get all the regulations
   * retrieved from the act data using the FactoryService.
   * @returns {[string]} - An array with all unique Regulations
   */
  getAllRegulations() {
    const actService = this.factoryService.actService;
    const actsRegulationsData = actService ? actService.getAllActsAndRegulations() : null;
    if (!actsRegulationsData) {
      return [];
    }
    const allRegulations = [];
    Object.keys(actsRegulationsData).forEach(act => allRegulations.push(...actsRegulationsData[act].regulations));
    return Array.from(new Set<string>(allRegulations)).sort((a, b) => a.localeCompare(b));
  }

    /**
   * Get all the regulations mapped to associated acts
   * retrieved from the act data using the FactoryService.
   * @returns {string: [string]} - All Regulations mapped to arrays of their associated actNames
   */
  getLegislationRegulationsMappedToActs = function(factoryService: any): { [key: string]: string[] } {
    const actService = this.factoryService.actService;
    if (!actService) {
      console.error('ActService is not available.');
      return {};
    }
    const actsRegulationsData = actService.getAllActsAndRegulations();
    const regulationsToActsMap: { [key: string]: string[] } = {};

    Object.values(actsRegulationsData).forEach((act: any) => {
      const actName = act.actName;
      act.regulations.forEach((regulation: string) => {
        if (!regulationsToActsMap[regulation]) {
          regulationsToActsMap[regulation] = [];
        }
        regulationsToActsMap[regulation].push(actName);
      });
    });
    return regulationsToActsMap;
  };
   /**
   * Get the full name of the act based on the act's code
   * retrieved from the agency data using the FactoryService.
   * @param {string} actCode - an act's code
   * @returns {string} - the act's full name
   */
   displayActTitleFull(actCode): string {
    // Access cached act data from FactoryService
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : {};
    return actsRegulationsMap && actsRegulationsMap[actCode] ? actsRegulationsMap[actCode]['actName'] : actCode;
  }

  /**
   * Get the intermediate act code based on the full act name
   * retrieved from the act data using the FactoryService.
   * @param {string} actTitle - an act's full name
   * @returns {string} - the act's itermediate code
   */
  getCodeFromTitle(actTitle): string {
    const actService = this.factoryService.actService;
    const actsRegulationsData = actService ? actService.getAllActsAndRegulations() : {};
    for (const [actCode, actDetails] of Object.entries(actsRegulationsData)) {
      if (actDetails['actName'] === actTitle) {
        return actCode;
      }
    }
    return null;
  }
}
