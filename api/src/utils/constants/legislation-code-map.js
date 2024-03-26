/**
 * List of act codes that are associated with legislative acts in the acts_regulation_mapping collection in the database
 * and the BCLaws API endpoint to retrieve current values for names of legislation
 */

const LEGISLATION_CODES = Object.freeze({
    ACT_103: {// related to legislation act name utilized by BCOGC import
        actAPI: "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/08036_01/xml"
    },
});


module.exports = LEGISLATION_CODES;
