//WARNING!!!!****
//THIS IS COPIED FROM THE FLNR FILE WITHOUT ALTERATION. I HAVE NOT CONFIRMED THAT EVERYTHING SHOULD BE THE SAME
/**
  * Expected headers for NRIS ALC Inspection csv.
  *
  * Note: sort order and letter case of headers is not important.
  *
  * @static
  * @memberof CsvConstants
  */
exports.alcInspectionCsvRequiredHeaders = [
    'Record ID',
    'Date',
    'Client / Complainant',
    'Region',
    'Latitude',
    'Longitude',
    'Function',
    'Action Taken',
    'Activity',
    'Report Status'
  ];
  
  /**
    * Required fields for NRIS ALC Inspection csv.
    *
    * @static
    */
  exports.alcInspectionCsvRequiredFields = ['Record ID'];
  
  /**
    * Fields for NRIS ALC Inspection csv that have a required format.
    *
    * Note: These fields are not necessarily required, and only have a required format if present.
    *
    * @static
    * @memberof CsvConstants
    */
  exports.flnrInspectionCsvRequiredFormats = [
    { field: 'date', type: 'date', format: 'YYYY-MM-DD' }
  ];
  
  /**
    * Fields for NRIS ALC Inspection csv that represent dates.
    *
    * @static
    * @memberof CsvConstants
    */
  exports.alcInspectionCsvDateFields = [{ field: 'date', format: 'YYYY-MM-DD' }];
  