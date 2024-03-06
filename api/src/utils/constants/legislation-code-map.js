/**
 * List of act codes that are associated with legislative acts in the acts_regulation_mapping collection in the database
 */

const LEGISLATION_CODES = Object.freeze({
        energyActCode : "ACT_103", // legislation act name utilized by BCOGC import
        energyActAPI: "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/08036_01/xml"
});
module.exports = LEGISLATION_CODES;
