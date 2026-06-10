exports.CONFIG_TYPES = {
  enforcementActionText: 'enforcementActionText',
  communicationPackage: 'communicationPackage'
};

exports.CONFIG_APPS = {
  BCMI: 'BCMI',
  NRPTI: 'NRPTI',
  NRCED: 'NRCED',
  LNG: 'LNG'
};

exports.OBJECTS_STORE_URL = () => {
  // Use env endpoint url, or default to this URL
  // S3 client requires a protocol, so if the env variable doesn't have one, add https://
  let tempURL = new URL(process.env.OBJECT_STORE_endpoint_url || 'https://nrs.objectstore.gov.bc.ca');
  if (tempURL.protocol) {
    return tempURL.href;
  } else {
    return new URL(`https://${tempURL.href}`);
  }
};
