exports.validateObjectAgainstModel = function(mongooseModel, incomingObj) {
  let validFields = null;
  let sanitizedObj = {};
  let incomingObjKeys = Object.keys(incomingObj);

  // First we use the mongoose model to create a new object to validate field types.
  validFields = new mongooseModel(incomingObj);

  // Then iterate through and create a new object with only the fields that are to be updated
  for (const key of incomingObjKeys) {
    key in validFields && (sanitizedObj[key] = incomingObj[key]);
  }

  return sanitizedObj;
};
