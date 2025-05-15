'use strict';

var dbm;
var type;
var seed;

const { ApplicationRoles } = require('../src/utils/constants/misc');
const { mapLayerInfo: MapLayerInfo } = require('../src/models/index');

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  console.log('**** Adding initial values for LNG map info data ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  const nrpti = await mClient.collection('nrpti');

  const readPerms = [ApplicationRoles.ADMIN, ApplicationRoles.ADMIN_LNG, ApplicationRoles.PUBLIC]
  const writePerms = [ApplicationRoles.ADMIN, ApplicationRoles.ADMIN_LNG];
  const segmentData = [
    { segment: 'Section 1', location: 'West of Dawson Creek to south of Chetwynd', length: '92 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 2', location: 'South of Chetwynd to east of McLeod Lake', length: '48 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 3', location: 'East of McLeod Lake to north of Prince George', length: '104 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 4', location: 'North of Prince George to northwest of Vanderhoof', length: '93 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 5', location: 'North of Vanderhoof to south of Burns Lake', length: '82 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 6', location: 'South of Burns Lake to south of Houston', length: '85 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 7', location: 'South of Houston to north of Morice Lake', length: '78 Kilometres', read: readPerms, write: writePerms},
    { segment: 'Section 8', location: 'North of Morice Lake to Kitimat', length: '84 Kilometres', read: readPerms, write: writePerms},
  ]
  for (let entry of segmentData) {
    let mapInfo = new MapLayerInfo();
    mapInfo.segment = entry.segment;
    mapInfo.location = entry.location;
    mapInfo.length = entry.length;
    mapInfo.read = entry.read;
    mapInfo.write = entry.write;
    try {
      nrpti.insert(mapInfo)
    } catch (err) {
      mClient.close();
    }
  }

  console.log('**** LNG Map Info insertion complete')
  mClient.close();
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
