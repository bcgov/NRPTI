
const issedToSubset = require('./search/issuedToSubset');
const locationSubset = require('./search/locationSubset');
const recordNameSubset = require('./search/recordNameSubset');

let updateAllMaterializedViews = async function (defaultLog) {
  await issedToSubset.update(defaultLog);
  await locationSubset.update(defaultLog);
  await recordNameSubset.update(defaultLog);
};

exports.updateAllMaterializedViews = updateAllMaterializedViews;
