exports.validateObjectAgainstModel = function(mongooseModel, incomingObj) {
  if (!incomingObj) {
    return;
  }

  // First we use the mongoose model to create a new object to validate field types.
  const validFields = new mongooseModel(incomingObj);

  // Then iterate through and create a new object with only the fields that are to be updated
  return sanitizeObject(incomingObj, validFields);
};

/**
 * Filters out any fields in objToTest that aren't also found in validObj.
 *
 * @param {*} objToTest object to strip unknown fields from
 * @param {*} validObj source of truth object to compare against
 * @returns a sanitized object that only contains fields that are also found in validObj
 */
const sanitizeObject = function(objToTest, validObj) {
  let sanitizedObj = {};

  let objToTestKeys = Object.keys(objToTest);
  for (const key of objToTestKeys) {
    if (key in validObj) {
      if (isObject(validObj[key])) {
        // descend into sub object
        sanitizedObj[key] = sanitizeObject(objToTest[key], validObj[key]);
      } else {
        sanitizedObj[key] = objToTest[key];
      }
    }
  }

  return sanitizedObj;
};

/**
 * Checks if the value provided is an object.
 *
 * @param {*} obj
 * @returns True if the value is an object, false otherwise.
 */
function isObject(item) {
  return item && typeof item === 'object' && item.constructor.name === 'Object';
}
