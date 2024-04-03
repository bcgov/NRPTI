/**
 * @summary APIs for the Update Issuing Agency page.
 * @description This file contains API endpoints for loading and updating agency names from the database.
 */

const queryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');
const defaultLog = require('../utils/logger')('record');
const axios = require('axios');
const LEGISLATION_CODES = require('../utils/constants/legislation-code-map');

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};


/**
 * @async
 * @param {Object} args - Request arguments.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function in the middleware chain.
 * @description Get API for retrieving agency code and names from the database.
 */
exports.publicGet = async function(args, res, next) {
  let actsAndRegulationsMap = null;
    try {
       actsAndRegulationsMap = await exports.getAllActsAndRegulationsFromDB();
  
    } catch (error) {
      defaultLog.log(error);
      throw error;
    }
    queryActions.sendResponse(res, 200, actsAndRegulationsMap);
  };

/**
 * @async
 * @param {Object} actMap an object where the key is the act code and the value is the associated act name
 * @description for each provided vaulue, sets the act name to that provided in the acts_regulations_mapping collection
 */
let updateTitlesInDB = async(actMap) => {
  try{
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const actsRegulationsCollection = db.collection('acts_regulations_mapping');
    for(let [actCode,actTitle] of Object.entries(actMap)){
      await actsRegulationsCollection.update(
        { _schemaName: "ActsRegulationsMapping", actCode: actCode},
        { $set: { actName : actTitle } }
      );
      console.log('updated actCode - ' + actCode + 'actTitle - ' + actTitle);
    }
  } catch (error) {
    console.error("updateTitlesInDB: Failed to update DB:", error);
  }

}

/**
 * @async
 * @param {Object} args - Request arguments.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function in the middleware chain.
 * @description Updates the Act title in the act_regulations_mapping collection in the db of every legislation
 * that we have a known BCLaws API endpoint for, stored in api/src/utils/constants/legislation-code-map.js
 * Acts as the endpoint for a cronjob that runs before the automated daily record import
 */
exports.updateActTitles = async function(args, res, next){
  let actMap = {};
  let actTitle = '';
  for (const [actCode, {actAPI}] of Object.entries(LEGISLATION_CODES)){
    const response = await axios.get(actAPI);
    actTitle = parseTitleFromXML(response.data);
    actMap[actCode] = actTitle;
  }
  updateTitlesInDB(actMap);
  queryActions.sendResponse(res, 200,'Acts updated');
}

/**
 * @async
 * @param {string} actCode - a string that maps to a specific set of legislation in the act_regulations_mapping collection
 * @returns {string} the full title for the legislation associated with the provided actCode
 */
exports.getActTitleFromDB = async function(actCode){
  try{
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const actsRegulationsCollection = db.collection('acts_regulations_mapping');
    let act = await actsRegulationsCollection.find({ _schemaName: RECORD_TYPE.ActsRegulationsMapping._schemaName, actCode: actCode}).toArray();
    let actTitleFromDB = act[0]['actName'];
    return (actTitleFromDB);
  } catch (error) {
      console.error("getActTitleFromDB: Failed to fetch data from DB:", error);
  }
}

/**
 * @async
 * @return {Object} an object that has the legislative act names as keys and an array of the regulations associated with those acts as values
 * @description provides a map of legislative acts and associated regulations from the db. Mimics a previously hardcoded set of constants.
 */
exports.getAllActsAndRegulationsFromDB = async function(){
  try{
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const actsRegulationsCollection = db.collection('acts_regulations_mapping');
    let actsRegulationsMapResponse = await actsRegulationsCollection.find({ _schemaName: RECORD_TYPE.ActsRegulationsMapping._schemaName}).toArray();
    let actsRegulationsMap = {};
    for (let actRegulations of actsRegulationsMapResponse){
      actsRegulationsMap[actRegulations['actCode']] = {'actName':actRegulations['actName'], 'regulations':actRegulations['regulations']};
    }
    return (actsRegulationsMap);

  } catch (error) {
      console.error("getAllActsAndRegulationsFromDB: Failed to fetch data from DB:", error);
  }
}

/**
 * @param {string} responseXML xml as a string from the BCLaws API
 * @return {string} the title of the act
 */
function parseTitleFromXML(responseXML){
  let actTitle = '';
  let startIndex = 0;
  try{
    const titleStart = '<act:title>';
    const titleEnd = '</act:title>';
    const titleStartIndex = responseXML.indexOf(titleStart, startIndex);
    const titleEndIndex = responseXML.indexOf(titleEnd, titleStart);
    actTitle = responseXML.substring(titleStartIndex + titleStart.length, titleEndIndex);
} catch (error) {
    console.error("parseTitleFromXML: Failed to parse XML:", error);
    return null;
}
  return actTitle;
}

