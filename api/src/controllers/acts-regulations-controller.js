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
  console.log('protectedOptions>>>>>>>');
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

// let updateTitle = async( actCode, actTitleFromAPI ) => {
//   try{
//   const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
//   const actsRegulationsCollection = db.collection('acts_regulations_mapping');
//   await actsRegulationsCollection.update(
//     { actCode: actCode },
//     { $set: { "act.title": actTitleFromAPI } }
//   );
//   } catch (error) {
//     console.error("updateTitle: Failed to update DB:", error);
//   }

// }


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

exports.updateActTitles = async function(args, res, next){
  let actMap = {};
  let actTitle = '';
  for (const [actCode, {actAPI}] of Object.entries(LEGISLATION_CODES)){
    const response = await axios.get(actAPI);
    actTitle = getTitleFromXML(response.data);
    actMap[actCode] = actTitle;
  }
  updateTitlesInDB(actMap);
  queryActions.sendResponse(res, 200,'Acts updated');
}

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

exports.getAllActsAndRegulationsFromDB = async function(){
  try{
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const actsRegulationsCollection = db.collection('acts_regulations_mapping');
    let actsRegulationsMapResponse = await actsRegulationsCollection.find({ _schemaName: RECORD_TYPE.ActsRegulationsMapping._schemaName}).toArray();
  // console.log('ActsRegulationsMapping>>>' + JSON.stringify(actsRegulationsMap));
    let actsRegulationsMap = {};
    for (let actRegulations of actsRegulationsMapResponse){
      //console.log('objects>>>' + JSON.stringify(actRegulations));
      actsRegulationsMap[actRegulations['actName']] = actRegulations['regulations'];
    }
    console.log('actsRegulationsMap>>>' + JSON.stringify(actsRegulationsMap));
    // let actTitleFromDB = act[0]['act']['title'];
    return (actsRegulationsMap);
   // return ('hello');
  } catch (error) {
      console.error("getActTitleFromDB: Failed to fetch data from DB:", error);
  }
}

function getTitleFromXML(responseXML){
  let actTitle = '';
  let startIndex = 0;
  try{
    const titleStart = '<act:title>';
    const titleEnd = '</act:title>';
    const titleStartIndex = responseXML.indexOf(titleStart, startIndex);
    const titleEndIndex = responseXML.indexOf(titleEnd, titleStart);
    actTitle = responseXML.substring(titleStartIndex + titleStart.length, titleEndIndex);
} catch (error) {
    console.error("getTitleFromXML: Failed to parse XML:", error);
    return null;
}
  return actTitle;
}

