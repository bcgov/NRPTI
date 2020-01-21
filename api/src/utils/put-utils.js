exports.validateObjectAgainstModel = function (mongooseModel, incomingObj) {
  var validFields = null;
  var sanitizedObj = {};
  var incomingObjKeys = Object.keys(incomingObj);

  // First we use the mongoose model to create a new object to validate field types.
  try {
    validFields = new mongooseModel(incomingObj);
  } catch (e) {
    throw e;
  }

  // Then iterate through and create a new object with only the fields that are to be updated
  for (const key of incomingObjKeys) {
    key in validFields && (sanitizedObj[key] = incomingObj[key]);
  }

  return sanitizedObj;
}