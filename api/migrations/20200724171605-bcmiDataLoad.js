'use strict';

let dbm;
let type;
let seed;

const https = require('https');
// register the mine schema/model
const ObjectID = require('mongodb').ObjectID;
const bcmiUrl = 'https://mines.empr.gov.bc.ca'; // prod api url

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  let mClient;

  try {
    mClient = await db.connection.connect(db.connectionString, { native_parser: true });
    const nrpti = mClient.collection('nrpti');

    // API call to pull data from BCMI
    // could also fetch from NRPTI first: require('../src/models/bcmi/mine').find().then(...);
    // then match to BCMI, just doing it this way so we can match on name, rather then code
    console.log('Fetching all major mines in BCMI...');
    // 30 results for major, 74 for published. Note, published does not return links so if we're supposed to use
    // published, we'll need to do a follow up call to /api/project/bycode/<mineData.code> to get the links
    const publishedMines = await getRequest(bcmiUrl + '/api/projects/published');
    console.log('Located ' + publishedMines.length + ' mines. Batching updates...');

    const promises = [];
    // build up a collection of all requests
    for (let i = 0; i < publishedMines.length; i++) {
      try {
        // The published endpoint doesn't have links, refresh the mineData object
        let mineData = await getRequest(bcmiUrl + '/api/project/bycode/' + publishedMines[i].code);
        promises.push(updateMine(mineData, nrpti));
      } catch(err) {
        console.error('Could not find ' + publishedMines[i]._id + ' : ' + publishedMines[i].name);
        // dont rethrow, we'll just ignore this one as a failure and check the rest
      }
    }

    // fire off the requests and wait
    let results = await Promise.all(promises);

    let updatedCount = 0;
    let notFoundCount = 0;
    results.forEach(result => {
      if (Object.prototype.hasOwnProperty.call(result, 'notfound')) {
        notFoundCount++;
        console.log('Could not find ' + result.data._id + ' : ' + result.data.name);
      } else {
        updatedCount++;
      }
    });

    // we're done
    console.log('BCMI migration complete.');
    console.log('Of ' + publishedMines.length + ' mines in BCMI, ' + notFoundCount + ' could not be found in NRPTI, and ' + updatedCount + ' were updated.');
  } catch(err) {
    console.error('Error on BCMI dataload: ' + err);
  }

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function updateMine(mineData, nrpti) {
  let nrptiMines = [];
  if (mineData.memPermitID === 'C-3' && mineData.name === 'Fording River Operations') { 
    nrptiMines = await nrpti.find({ _schemaName: 'MineBCMI', permitNumber: 'C-102'}).toArray();
  }
  else{
    nrptiMines = await nrpti.find({ _schemaName: 'MineBCMI', permitNumber: mineData.memPermitID}).toArray();
  }

  // should have 1 result returned. Any more or less, just ignore this update
  if (nrptiMines.length === 1) {
    let externalLinks = [];
    // format the links from the data
    for(const idx in mineData.externalLinks) {
      const link = mineData.externalLinks[idx];
      externalLinks.push({
        url: link.link,
        title: link.title
      });
    }

    console.log("Updating:", mineData.name);
    const summary = mineData.content.filter(content => {
      return content.type === 'Intro' && content.page === 'Mines';
    })[0].html;

    return nrpti.update({ _id: new ObjectID(nrptiMines[0]._id) }, {
      $set: {
        type:            mineData.type,
        summary:         summary,
        description:     mineData.description,
        links:           externalLinks,
        updatedBy:       'NRPTI BCMI Data Migration',
        sourceSystemRef: 'mem-admin'
      }
    });
  }

  return { notfound: true, data: mineData };
}

function getRequest(url) {
  return new Promise(function(resolve, reject) {
      let req = https.get(url, function(res) {
          if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error('statusCode=' + res.statusCode));
          }
          let body = [];
          res.on('data', function(chunk) {
              body.push(chunk);
          });
          res.on('end', function() {
              try {
                  body = JSON.parse(Buffer.concat(body).toString());
              } catch(e) {
                  reject(e);
              }
              resolve(body);
          });
      });

      req.on('error', function(err) {
          reject(err);
      });

      req.end();
  });
}
