'use strict';

let dbm;
let type;
let seed;

const https = require('https');
// register the mine schema/model
const ObjectID = require('mongodb').ObjectID;
const bcmiUrl = 'https://mines.empr.gov.bc.ca';

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  let mClient;

  return db.connection.connect(db.connectionString, { native_parser: true })
  .then(async (conn) => {
    mClient = conn;
    const nrpti = mClient.collection('nrpti');

    // API call to pull data from BCMI
    // http://{bcmi_url}/api/projects/major

    // fetch all published mines
    // could also fetch from NRPTI first: require('../src/models/bcmi/mine').find().then(...);
    // then match to BCMI, just doing it this way so we can match on name, rather then code
    console.log('Fetching all major mines in BCMI...');
    getRequest(bcmiUrl + '/api/projects/major') // 30 results for major, 74 for published. Note, published does not return links?
    .then(async publishedMines => {
      const promises = [];

      console.log('Located ' + publishedMines.length + ' mines. Batching updates...');
      // build up a collection of all requests
      for (let i = 0; i < publishedMines.length; i++) {
        let mineData = publishedMines[i];
        promises.push(updateMine(mineData, nrpti));
      }

      // fire off the requests and wait
      let results = await Promise.all(promises);

      let updatedCount, notFoundCount = 0;
      results.forEach(result => {
        if (result) {
          updatedCount++;
        } else {
          notFoundCount++;
        }
      });

      // could check results for an update count
      // we're done, so close the connection
      console.log('BCMI migration complete.');
      console.log('Of ' + publishedMines.length + ' mines in BCMI, ' + notFoundCount + ' could not be found in NRPTI, and ' + updatedCount + ' were updated.');
      mClient.close();
    })
    .catch(err => {
      console.error('Error on BCMI dataload: ' + err);
      mClient.close();
    });
  })
  .catch((err) => {
    console.error('Error on BCMI dataload: ' + err);
    mClient.close();
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function updateMine(mineData, nrpti) {
  let nrptiMines = await nrpti.find({ _schemaName: 'MineBCMI', name: mineData.name}).toArray();

  if (nrptiMines.length === 1) {
    let externalLinks = [];
    // format the links from the data
    for(const idx in mineData.externalLinks) {
      const link = mineData.externalLinks[idx];
      externalLinks.push(link.link);
    }

    return nrpti.update({ _id: new ObjectID(nrptiMines[0]._id) }, {
      $set: {
        type:        mineData.type,
        summary:     mineData.description, // BCMI doesn't have a "summary" attribute
        description: mineData.description,
        links:       externalLinks,
        updatedBy:   'NRPTI BCMI Data Migration'
      }
    });

    // Alternatively...
    /* let nrptiMine = await require('../src/models/bcmi/mine').findById(nrptiMines[0]._id);

    nrptiMine.type        = mineData.type;
    nrptiMine.summary     = mineData.description; // BCMI doesn't have a "summary" attribute
    nrptiMine.description = mineData.description;
    nrptiMine.links       = externalLinks;
    nrptiMine.updatedBy   = 'NRPTI BCMI Data Migration';

    return nrptiMine.save(); */
  }

  return null;
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
