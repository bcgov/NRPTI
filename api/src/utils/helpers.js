const csvToJson = require('csvtojson');

/**
 * Given a csv string, return an array of row objects.
 *
 * Note: assumes there is a header row, which is converted to lowercase.
 *
 * @param {*} csvString
 * @returns {string[][]}
 */
exports.getCsvRowsFromString = async function(csvString) {
  if (!csvString) {
    return null;
  }

  let lineNumber = 0;

  // preFileLine bug that prevents us from using the built in line index
  // See: https://github.com/Keyang/node-csvtojson/issues/351
  const csvRows = await csvToJson()
    .preFileLine(fileLine => {
      let line = fileLine;

      if (lineNumber === 0) {
        // convert the header row to lowercase
        line = fileLine.toLowerCase();
      }

      lineNumber++;

      return line;
    })
    .fromString(csvString);

  return csvRows;
}