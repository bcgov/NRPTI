/**
 * @summary APIs for the Update Issuing Agency page.
 * @description This file contains API endpoints for loading and updating agency names from the database.
 */

const queryActions = require('../utils/query-actions');
const mongodb = require('../utils/mongodb');
const RECORD_TYPE = require('../utils/constants/record-type-enum');
const defaultLog = require('../utils/logger')('record');
const axios = require('axios');

const BC_LAWS_XML_ENDPOINT_BEGINNING = "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/";
const BC_LAWS_XML_ENDPOINT_ENDING = "_01/xml";

const BCOGC_ID = "08036"

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
 // console.log('args>>>>>>>' + args.swagger.params.actCode.value);
  //const actCode = args.swagger.params.actCode.value;
  let actsAndRegulationsMap = null;
    try {
      // let actTitleFromAPI = await getActTitleFromAPI(BCOGC_ID);
      //let actTitleFromDB = await getActTitleFromDB(actCode);
       actsAndRegulationsMap = await getAllActsAndRegulationsFromDB();
  
      // console.log('actTitleFromAPI>>>>' + actTitleFromAPI);
     // console.log('actTitleFromDB>>>>' + actTitleFromDB);
  
        // if(actTitleFromAPI !== actTitleFromDB){
        //   console.log('Title>>>>>>>>> is the different');
        //   updateTitle(actCode, actTitleFromAPI);
        // }
      //   actInfo = {
      //   [actCode]: actTitleFromDB
      // };
  
    } catch (error) {
      defaultLog.log(error);
      throw error;
    }
    queryActions.sendResponse(res, 200, actsAndRegulationsMap);
  };



// exports.publicGet = async function(args, res, next) {
// console.log('args>>>>>>>' + args.swagger.params.actCode.value);
// const actCode = args.swagger.params.actCode.value;
// let actInfo = null;
//   try {
//     let actTitleFromAPI = await getActTitleFromAPI(BCOGC_ID);
//     let actTitleFromDB = await getActTitleFromDB(actCode);

//     console.log('actTitleFromAPI>>>>' + actTitleFromAPI);
//     console.log('actTitleFromDB>>>>' + actTitleFromDB);

//       if(actTitleFromAPI !== actTitleFromDB){
//         console.log('Title>>>>>>>>> is the different');
//         updateTitle(actCode, actTitleFromAPI);
//       }
//       actInfo = {
//       actTitleFromDB: actTitleFromDB,
//       actTitleFromAPI: actTitleFromAPI
//     };

//   } catch (error) {
//     defaultLog.log(error);
//     throw error;
//   }
//   queryActions.sendResponse(res, 200, actInfo);
// };

let updateTitle = async( actCode, actTitleFromAPI ) => {
  try{
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const actsRegulationsCollection = db.collection('acts_regulations_mapping');
  await actsRegulationsCollection.update(
    { actCode: actCode },
    { $set: { "act.title": actTitleFromAPI } }
  );
  } catch (error) {
    console.error("updateTitle: Failed to update DB:", error);
  }

}

async function getActTitleFromAPI(id){
  try{
      const response = await axios.get(BC_LAWS_XML_ENDPOINT_BEGINNING + id + BC_LAWS_XML_ENDPOINT_ENDING)
      let actTitle = getTitleFromXML(response.data);
      return (actTitle);
  } catch (error) {
      console.error("getActTitleFromAPI: Failed to fetch XML:", error);
  }
}

async function getActTitleFromDB(actCode){
  try{
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const actsRegulationsCollection = db.collection('acts_regulations_mapping');
    let act = await actsRegulationsCollection.find({ _schemaName: RECORD_TYPE.ActsRegulations._schemaName, actCode: actCode}).toArray();
    let actTitleFromDB = act[0]['act']['title'];
    return (actTitleFromDB);
  } catch (error) {
      console.error("getActTitleFromDB: Failed to fetch data from DB:", error);
  }
}

async function getAllActsAndRegulationsFromDB(){
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

