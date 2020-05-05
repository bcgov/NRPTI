
const issedToSubset = require('./search/issuedToSubset');
const locationSubset = require('./search/locationSubset');

let updateAllMaterializedViews = async function (defaultLog) {
  await issedToSubset.update(defaultLog);
  await locationSubset.update(defaultLog);
};

exports.updateAllMaterializedViews = updateAllMaterializedViews;